"""SQLite degraded-mode operation journal.

PostgreSQL remains canonical. This journal is intentionally NOT an alternate
ORM/database for AJo domain tables and is never synchronized table-to-table.
Only explicit, idempotent operation envelopes belong here.

Automatic acceptance of authenticated financial writes while PostgreSQL is
unreachable is deliberately fail-closed until the operation carries enough
identity, aggregate-version and authorization evidence for safe replay.
"""
import json
import os
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4


REPLAY_RESULTS = {
    "SUCCESS",
    "ALREADY_PROCESSED",
    "CONFLICT",
    "INVALID",
    "FAILED_RETRYABLE",
    "FAILED_PERMANENT",
}


@dataclass(frozen=True)
class DegradedOperation:
    event_id: str
    operation_type: str
    aggregate_type: str
    aggregate_id: str
    payload: dict
    idempotency_key: str
    created_at: str
    sequence: int | None
    sync_status: str
    retry_count: int
    last_error: str | None


class DegradedJournal:
    def __init__(self, path: str | None = None):
        filename = path or os.getenv("AJO_DEGRADED_SQLITE_PATH", "/data/ajo-degraded.db")
        self.path = Path(filename)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._init()

    def _connect(self):
        connection = sqlite3.connect(self.path)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA journal_mode=WAL")
        connection.execute("PRAGMA synchronous=FULL")
        return connection

    def _init(self):
        with self._connect() as db:
            db.execute(
                """
                CREATE TABLE IF NOT EXISTS degraded_operations (
                    event_id TEXT PRIMARY KEY,
                    operation_type TEXT NOT NULL,
                    aggregate_type TEXT NOT NULL,
                    aggregate_id TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    idempotency_key TEXT NOT NULL UNIQUE,
                    created_at TEXT NOT NULL,
                    sequence INTEGER,
                    sync_status TEXT NOT NULL DEFAULT 'PENDING',
                    retry_count INTEGER NOT NULL DEFAULT 0,
                    last_error TEXT
                )
                """
            )

    def append(self, *, operation_type: str, aggregate_type: str, aggregate_id: str,
               payload: dict, idempotency_key: str, sequence: int | None = None) -> str:
        event_id = str(uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        with self._connect() as db:
            existing = db.execute(
                "SELECT event_id FROM degraded_operations WHERE idempotency_key=?",
                (idempotency_key,),
            ).fetchone()
            if existing:
                return existing["event_id"]
            db.execute(
                """INSERT INTO degraded_operations
                   (event_id, operation_type, aggregate_type, aggregate_id, payload,
                    idempotency_key, created_at, sequence, sync_status, retry_count)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 0)""",
                (
                    event_id, operation_type, aggregate_type, aggregate_id,
                    json.dumps(payload, separators=(",", ":"), sort_keys=True),
                    idempotency_key, created_at, sequence,
                ),
            )
        return event_id

    def pending(self, limit: int = 100) -> list[DegradedOperation]:
        with self._connect() as db:
            rows = db.execute(
                """SELECT * FROM degraded_operations
                   WHERE sync_status IN ('PENDING','FAILED_RETRYABLE')
                   ORDER BY created_at, event_id LIMIT ?""",
                (limit,),
            ).fetchall()
        return [
            DegradedOperation(
                event_id=row["event_id"],
                operation_type=row["operation_type"],
                aggregate_type=row["aggregate_type"],
                aggregate_id=row["aggregate_id"],
                payload=json.loads(row["payload"]),
                idempotency_key=row["idempotency_key"],
                created_at=row["created_at"],
                sequence=row["sequence"],
                sync_status=row["sync_status"],
                retry_count=row["retry_count"],
                last_error=row["last_error"],
            )
            for row in rows
        ]

    def mark(self, event_id: str, result: str, error: str | None = None):
        if result not in REPLAY_RESULTS:
            raise ValueError(f"Unknown replay result: {result}")
        with self._connect() as db:
            db.execute(
                """UPDATE degraded_operations
                   SET sync_status=?, retry_count=retry_count+1, last_error=?
                   WHERE event_id=?""",
                (result, error, event_id),
            )
