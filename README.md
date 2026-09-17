# Ajo platform

FastAPI implementation of the Esusu/Ajo requirements, with member and staff workflows, versioned policy, encrypted identity evidence, independent contribution/payout calendars, contracts, and an obligation ledger.

**Current delivery: functional sandbox.** Real KYC, legal signatures, bank settlement, SMS/email/push transmission and jurisdiction-specific compliance are not configured. The platform never claims sandbox provider responses are real verification or money movement. See [requirement coverage](docs/PLATFORM_COVERAGE.md) for exact implemented and remaining boundaries.

## Start

From the project directory, with Python 3.9+:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -e '.[dev]'
AJO_DEMO_MODE=true .venv/bin/python -m app.platform.cli seed-demo
AJO_DEMO_MODE=true .venv/bin/uvicorn app.platform.application:app --host 127.0.0.1 --port 8000
```

Open [the landing page](http://127.0.0.1:8000/) or [the public marketplace](http://127.0.0.1:8000/marketplace) or [the Ajo app](http://127.0.0.1:8000/app) and [API documentation](http://127.0.0.1:8000/docs).

The seed command creates `amber@ajo.test`, `cedar@ajo.test`, `indigo@ajo.test` and `admin@ajo.test`, and prints one random password for the newly created accounts. Re-running it leaves existing accounts/passwords intact. Never use real identities or bank details in sandbox mode. Keep the server bound to localhost.

The current restored environment already has `.venv`. On this machine the system Python launcher may require Xcode setup; the existing `.venv/bin/python` executable works independently.

## Try a full rotation

1. Sign in as Amber, create a three-member circle, then publish it. Use a start date of today or later.
2. Sign in separately as Cedar and Indigo, and join through Marketplace. Their seeded bank mandates are already verified sandbox fixtures.
3. Open the circle as a member, confirm payout order and create the agreement. Review the frozen policy and schedule; download the stored PDF.
4. Accept the identical version as each member. The circle activates only after all members accept.
5. As the administrator, open Operations > Jobs. Advance the sandbox through the final payout date. The worker settles synthetic contributions and releases funded payouts.
6. Review each member's remaining obligation, the ledger CSV, notifications, trust record, and audit trail.

Register a new fictional account to exercise channel verification, the sandbox OTP inbox, encrypted document/selfie submission, KYC review, and bank linking. `sandbox-ok-unique-name`, `sandbox-fail-unique-name`, and `sandbox-pending-unique-name` tokens exercise different payment scenarios. These are not bank account numbers.

## Automatic jobs

```sh
AJO_DEMO_MODE=true .venv/bin/python -m app.platform.cli worker
# A single tick:
AJO_DEMO_MODE=true .venv/bin/python -m app.platform.cli worker --once
```

The worker polls persistent due records every 30 seconds. Definitive failures retry according to the contract's frozen policy; pending payments require reconciliation. Use Operations > Policies to set `scheduler_paused` for an immediate global stop. Manual future dates are sandbox-only.

## Configuration and open questions

Administrators create policy versions under Operations > Policies. The available strategies are intentionally explicit:

- UTC calendar dates with month-end clipping. Bi-monthly means every two months.
- Mixed frequencies allocate each payout target across actual debit dates in its payout window.
- Overflow extends the rotation to one payout window per finalized member.
- Defaulting contributions hold payouts and flag members; future windows cannot conceal a shortfall.
- Zero fees, or flat/basis-point fees collected separately from the pool.
- Reproducible server-commitment random payout ordering.

Unresolved values may remain `null`; required missing policies block finalization. Contracts snapshot policy and schedule. Configuration changes never silently rewrite agreed obligations. Launch country/provider selection, legal terms, bank holiday rules, alternative overflow/fee/default rules, reserves, retention and live provider adapters remain explicit integration work.

## Storage and migrations

`ajo-platform.db` is independent of the original `ajo.db`. Existing prototype records remain intact; they are not silently converted into the new contractual model. Sandbox startup creates tables and append-only evidence guards. The migration is for a fresh production-shaped database:

```sh
.venv/bin/alembic upgrade head
.venv/bin/alembic check
```

For PostgreSQL, install `.[postgres]` and supply `AJO_PLATFORM_DATABASE_URL` through deployment configuration. Before migrating an existing auto-created sandbox database, back it up and verify its schema; do not blindly run an initial create migration against it.

Identity documents, identity metadata, bank tokens and signature details use AES-GCM encryption. `AJO_KEY_FILE` points to a mounted secret containing a base64-encoded 32-byte key. Sandbox generates a restricted local key in `.ajo-data/sandbox.key`; keep it with its database backup, never commit it. Production startup does not create a fallback key. Registration contact fields are currently stored as searchable plaintext database columns; production encrypted storage, indexing policy and infrastructure encryption require hardening.

## Docker

```sh
docker compose up --build
# Optional sandbox worker:
docker compose --profile scheduler up --build
# Create demo accounts in the container:
docker compose exec api python -m app.platform.cli seed-demo
```

The container publishes only on localhost and uses a named data volume. Docker/PostgreSQL execution have not been validated on this host.

## Verification

```sh
.venv/bin/python -m pytest -q
node --check app/static/platform.js
```

The current suite has 26 tests, including the seven original prototype tests. It covers full rotations, mixed-frequency rounding, member/private access, invitations, OTP limits, MFA replay/session revocation, contract versioning, policy gates, fees, concurrent jobs, pending funds, reversals and append-only database enforcement. Dependency snapshot: `requirements-dev.lock`.

## Code map

- `app/platform/application.py`: full application entry point.
- `auth.py`, `security.py`: account verification, sessions, MFA and encrypted identity handling.
- `circles.py`, `calendar.py`, `contracts.py`: membership, invitations, schedules and contracts.
- `payments.py`, `services.py`: worker, balanced postings, trust and notification outbox.
- `operations.py`: staff controls, complaints, exports, metrics and policies.
- `providers.py`: explicitly separate sandbox and unconfigured live ports.
- `models.py`, `integrity.py`, `migrations/`: schema and evidence guards.
- `frontend/src/` and `frontend/public/assets/workspace/`: React client and preserved member/operations controllers; installable mobile-web shell without offline financial-data caching.
- `app/main.py`: preserved original prototype, runnable separately on another port.

[Original requirements analysis](docs/analysis.md) · [Current coverage](docs/PLATFORM_COVERAGE.md) · [Build checkpoint](docs/BUILD_STATUS.md)

Website content is managed in **Back office → Website CMS** after signing in as admin or operations staff. Administrators can publish and restore revisions. See [CMS documentation](docs/CMS.md) for the draft/preview/publish workflow.

## Separate Next.js frontend and FastAPI backend

The active client is now in `frontend/`, with Next.js App Router and React components. The Python domain implementation lives in `backend/app/`; the root `app` symlink preserves existing imports and scripts.

Start FastAPI from the repository root with `AJO_DEMO_MODE=true .venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000`. Then run `npm ci` and `npm run dev` from `frontend/`. Open http://127.0.0.1:3000. The CMS is at `/app?view=backoffice&module=cms`.

Public and signed-in marketplaces use the same public catalogue; FastAPI enforces eligibility when joining. React owns the landing page, calculator, marketplace and CMS. Existing member workflow controllers remain isolated inside the frontend workspace during the staged React port. See [frontend documentation](frontend/README.md). `docker compose up --build` starts separate frontend/backend services in sandbox mode.

Set `AJO_FRONTEND_ORIGIN=http://127.0.0.1:3000` when starting FastAPI to redirect historical public/UI URLs to Next.js while keeping API routes on FastAPI. `AJO_FRONTEND_ASSETS` can override the location of compatibility/preview assets in deployments.
