"""Create disposable AJo users/circles through the public REST API.

This never writes directly to SQL tables. It is intentionally disabled for
production environments.
"""
import argparse
import json
import os
import secrets
import string
from datetime import date, timedelta

import httpx


def guard():
    env = os.getenv("APP_ENV", "development").lower()
    if env == "production":
        raise RuntimeError("Test-data generation is disabled in production")


def password():
    return "AjoTest!" + secrets.token_urlsafe(12)


def phone(index: int) -> str:
    # Reserved North-American fictional range.
    return f"+155501{index:04d}"


def register(client, base, index):
    marker = secrets.token_hex(4)
    email = f"ajo-test-{marker}-{index}@example.test"
    pwd = password()
    response = client.post(
        base + "/api/v1/auth/register",
        json={"email": email, "phone": phone(index), "password": pwd},
    )
    response.raise_for_status()
    data = response.json()
    return {
        "email": email,
        "password": pwd,
        "access_token": data["access_token"],
        "user": data.get("user"),
    }


def main():
    guard()
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=os.getenv("AJO_TEST_BASE_URL", "http://127.0.0.1:8000"))
    parser.add_argument("--clients", type=int, default=3)
    parser.add_argument("--circles", type=int, default=1)
    args = parser.parse_args()
    if args.clients < 1 or args.circles < 0:
        parser.error("clients must be >= 1 and circles >= 0")
    with httpx.Client(timeout=20) as client:
        users = [register(client, args.base_url.rstrip("/"), i) for i in range(args.clients)]
        # Registration intentionally stops before bypassing verification/KYC/bank
        # controls. Circle creation requires those real workflows and must not be
        # achieved with hidden SQL fixture insertion.
    print(json.dumps({"clients": users, "circles_requested": args.circles}, indent=2))


if __name__ == "__main__":
    main()
