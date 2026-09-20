"""Durably schedule background work through the transactional outbox."""
from datetime import date, datetime, timezone

from sqlalchemy.orm import Session

from .outbox import enqueue, publish_pending


def schedule_once(ctx, redis_client) -> dict:
    bucket = datetime.now(timezone.utc).strftime("%Y%m%d%H%M")
    with Session(ctx.engine) as db, db.begin():
        enqueue(
            db,
            event_type="payment.scan_due",
            aggregate_type="scheduler",
            aggregate_id="payments",
            payload={"as_of": date.today().isoformat()},
            idempotency_key=f"scheduler:payment:{bucket}",
        )
        enqueue(
            db,
            event_type="notification.dispatch",
            aggregate_type="scheduler",
            aggregate_id="notifications",
            payload={},
            idempotency_key=f"scheduler:notifications:{bucket}",
        )
        enqueue(
            db,
            event_type="reconciliation.replay",
            aggregate_type="scheduler",
            aggregate_id="degraded-journal",
            payload={},
            idempotency_key=f"scheduler:reconciliation:{bucket}",
        )
    with Session(ctx.engine) as db, db.begin():
        published = publish_pending(db, redis_client)
    return {"scheduled_bucket": bucket, "published": published}
