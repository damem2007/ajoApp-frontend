"""Redis-backed worker entry points for payments, notifications, reconciliation and outbox dispatch."""
import argparse
import json
import logging
import os
import time
from datetime import date

from redis import Redis
from sqlalchemy.orm import Session

from .application import create_platform
from .degraded import DegradedJournal
from .outbox import publish_pending, redis_url
from .payments import run_due, dispatch_notices


log = logging.getLogger("ajo.workers")


def _redis() -> Redis:
    return Redis.from_url(redis_url(), decode_responses=True)


def _session(ctx):
    gen = ctx.session()
    db = next(gen)
    return gen, db


def _finish(gen):
    try:
        next(gen)
    except StopIteration:
        pass


def outbox_dispatch_once(ctx, redis_client) -> int:
    gen, db = _session(ctx)
    try:
        count = publish_pending(db, redis_client)
        _finish(gen)
        return count
    except Exception:
        gen.close()
        raise


def payment_once(ctx, envelope: dict) -> dict:
    if envelope.get("event_type") != "payment.scan_due":
        return {"ignored": envelope.get("event_type")}
    gen, db = _session(ctx)
    try:
        as_of = envelope.get("payload", {}).get("as_of")
        result = run_due(db, ctx, date.fromisoformat(as_of) if as_of else None)
        _finish(gen)
        return result
    except Exception:
        gen.close()
        raise


def notification_once(ctx, envelope: dict) -> dict:
    if envelope.get("event_type") != "notification.dispatch":
        return {"ignored": envelope.get("event_type")}
    gen, db = _session(ctx)
    try:
        result = {"notifications_dispatched": dispatch_notices(db, ctx)}
        _finish(gen)
        return result
    except Exception:
        gen.close()
        raise


def reconciliation_once(ctx, envelope: dict) -> dict:
    if envelope.get("event_type") != "reconciliation.replay":
        return {"ignored": envelope.get("event_type")}
    # The SQLite journal is intentionally an operation journal rather than a
    # mirror of domain tables. Replay handlers must be explicit per operation.
    journal = DegradedJournal()
    pending = journal.pending(limit=100)
    return {
        "pending": len(pending),
        "status": "awaiting-explicit-operation-handlers" if pending else "clear",
    }


def consume(queue: str, handler):
    app = create_platform()
    ctx = app.state.ctx
    redis_client = _redis()
    while True:
        item = redis_client.blpop(queue, timeout=5)
        if not item:
            outbox_dispatch_once(ctx, redis_client)
            continue
        _, raw = item
        try:
            envelope = json.loads(raw)
            result = handler(ctx, envelope)
            log.info("worker queue=%s event=%s result=%s", queue, envelope.get("event_id"), result)
        except Exception:
            log.exception("worker failure queue=%s payload=%s", queue, raw)


def scheduler_loop(interval: int):
    from .scheduler import schedule_once

    app = create_platform()
    ctx = app.state.ctx
    redis_client = _redis()
    while True:
        schedule_once(ctx, redis_client)
        time.sleep(interval)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("worker", choices=["payment", "notification", "reconciliation", "outbox", "scheduler"])
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--interval", type=int, default=int(os.getenv("AJO_SCHEDULER_INTERVAL", "30")))
    args = parser.parse_args()
    app = create_platform()
    ctx = app.state.ctx
    redis_client = _redis()

    if args.worker == "outbox":
        if args.once:
            print({"published": outbox_dispatch_once(ctx, redis_client)})
            return
        while True:
            print({"published": outbox_dispatch_once(ctx, redis_client)}, flush=True)
            time.sleep(args.interval)

    if args.worker == "scheduler":
        if args.once:
            from .scheduler import schedule_once
            print(schedule_once(ctx, redis_client))
            return
        scheduler_loop(args.interval)
        return

    queue = {
        "payment": "ajo:payment",
        "notification": "ajo:notification",
        "reconciliation": "ajo:reconciliation",
    }[args.worker]
    handler = {
        "payment": payment_once,
        "notification": notification_once,
        "reconciliation": reconciliation_once,
    }[args.worker]

    if args.once:
        item = redis_client.blpop(queue, timeout=1)
        print(handler(ctx, json.loads(item[1])) if item else {"queue": queue, "empty": True})
        return
    consume(queue, handler)


if __name__ == "__main__":
    main()
