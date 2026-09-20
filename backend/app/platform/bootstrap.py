"""Idempotent bootstrap of the single persistent system administrator."""
import os

from sqlalchemy import select

from .models import Account
from .security import password_hash


def ensure_super_admin(db):
    email = os.getenv("SUPERADMIN_EMAIL", "").strip().lower()
    phone = os.getenv("SUPERADMIN_PHONE", "").strip()
    password = os.getenv("SUPERADMIN_PASSWORD", "")
    if not (email and phone and password):
        return None
    if len(password) < 12:
        raise RuntimeError("SUPERADMIN_PASSWORD must contain at least 12 characters")
    existing = db.scalar(select(Account).where(Account.email == email))
    if existing:
        if existing.role != "admin":
            raise RuntimeError("SUPERADMIN_EMAIL already belongs to a non-admin account")
        return existing
    account = Account(
        email=email,
        phone=phone,
        password=password_hash(password),
        role="admin",
        pseudonym="Super Admin",
    )
    db.add(account)
    db.flush()
    return account
