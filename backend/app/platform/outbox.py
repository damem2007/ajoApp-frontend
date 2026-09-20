"""Transactional outbox primitives.

Call enqueue() inside the same SQLAlchemy transaction as the domain state
change. Publishing happens later, after commit, so a Redis outage cannot erase
the durable instruction to perform work.
"""
import json
import os
from datetime import datetime, timezone

from sqlalchemy import select

from .models import OutboxEvent


PAYMENT_QUEUE = "ajo:payment"
NOTIFICATION_QUEUE = "ajo:notification"\nRECONCILIATION_QUEUE = "ajo:reconciliation"


def enqueue(db, *, event_type: str, aggregate_type: str, aggregate_id: str, payload: dict,
            idempotency_key: str) -> OutboxEvent:
    existing = db.scalar(select(OutboxEvent).where(OutboxEvent.idempotency_key == idempotency_key))
    if existing:
        return existing
    event = OutboxEvent(
        event_type=event_type,
        aggregate_type=aggregate_type,
        aggregate_id=aggregate_id,
        payload=payload,
        idempotency_key=idempotency_key,
    )
    db.add(event)
    db.flush()
    return event


def _queue_for(event_type: str) -> str:
    if event_type.startswith("payment."):
        return PAYMENT_QUEUE
    return RECONCILIATION_QUEUE


def publish_pending(db, redis_client, limit: int = 100) -> int:
    events = list(db.scalars(
        select(OutboxEvent)
        .where(OutboxEvent.status.in_(["Pending", "Failed"]))
        .order_by(OutboxEvent.created_at, OutboxEvent.id)
        .limit(limit)
    ))
    published = 0
    for event in events:
        envelope = {
            "event_id": event.id,
            "event_type": event.event_type,
            "aggregate_type": event.aggregate_type,
            "aggregate_id": event.aggregate_id,
            "payload": event.payload,
            "idempotency_key": event.idempotency_key,
        }
        try:
            redis_client.rpush(_queue_for(event.event_type), json.dumps(envelope, separators=(",", ":")))
            event.status = "Published"
            event.published_at = datetime.now(timezone.utc).isoformat()
            event.attempt_count += 1
            event.last_error = None
            published += 1
        except Exception as exc:
            event.status = "Failed"
            event.attempt_count += 1
            event.last_error = str(exc)[:2000]
    db.flush()
    return published


def redis_url() -> str:
    return os.getenv("AJO_REDIS_URL", "redis://redis:6379/0")
