# Ajo Next.js frontend

Set `frontend/.env.local` using `.env.example`. The user's API address is read as `NEXT_PUBLIC_API_BASE_URL`; `AJO_API_ORIGIN` is an optional server-only override. Public preferences supply the notification polling interval and dropdown page size. `FRONTEND_HOST` and `FRONTEND_PORT` select the listening address without source changes. `npm run dev/start` loads the environment before starting Next.js. Missing/invalid settings fail build/startup explicitly.

## Human-maintainable boundaries

- `src/app`: App Router pages and member/staff layouts. Public pages include `/`, `/marketplace`, `/terms`, `/privacy`, `/sign-in`, `/register`.
- `/app/circles`, `/app/account`, `/app/invitations`, `/app/marketplace`, `/app/notifications`, `/app/trust`, `/app/reports`: native React member workflows.
- `/backoffice`: administrative modules. CMS lives at `/backoffice/cms`; saved-draft preview uses `/backoffice/cms/preview` and authenticated JSON.
- `src/components`: feature components for account, circles and backoffice, shared navigation/forms/data views. Every screen is TSX.
- `src/lib/api`: named typed auth, circles/contracts, account, marketplace, notification, administration and CMS resources. `client.ts` owns transport, coordinated token refresh, field errors, multipart uploads and binary downloads.
- `src/providers`: shared session and toast state. FastAPI authorization remains authoritative.
- `src/lib/backend-origin.ts`, `client-config.ts`: validated environment settings; no embedded deployment addresses.
- `src/lib/frequencies.ts`: the eight frequency choices shared across screens.
- `src/workers/service-worker.ts`: the source for the generated public worker; financial/identity data is not cached offline.

Both marketplaces use the same component/catalogue API. Joining triggers authoritative eligibility checks. Sandbox examples cannot be joined. New circle setup sends fixed `contribution_minor`; the backend derives and validates funded payouts from actual calendar dates before review. Capacity is fixed at setup.

`/app?view=...` redirects to native routes. No native screen injects backend HTML or loads asset controllers. The retired controllers/templates live in `sandbox/legacy-ui`, outside public assets and production builds. Browser bundles emitted under `_next` and the generated worker are JavaScript compiled from TS/TSX.

## Run and verify

`npm ci`, `npm run dev`; production uses `npm run build` and `npm run start`. Public environment changes require rebuilding.

`npm run test:config`, `npm run typecheck`, `npm run build`, and `AJO_UI_ORIGIN=<frontend-origin> npm run test:ui`. Browser writes use intercepted fictional fixtures. Install Playwright's Chromium or provide `AJO_BROWSER_EXECUTABLE`; machine-specific paths are not embedded. Python sandbox financial regressions run separately with isolated databases.

See [architecture](../docs/ARCHITECTURE.md) and [configuration reference](../docs/CONFIGURATION.md).


## FastAPI contract types

FastAPI/Pydantic in the separate `ajoApp` backend is the source of truth for API contract types.
The frontend keeps its handwritten HTTP resource functions and generates **types only** with
`openapi-typescript`.

With the backend repository available as the sibling `../backend`:

```bash
npm ci
npm run api:types
npm run api:types:check
npm run typecheck
npm run build
```

Generated definitions are committed at `src/generated/api-types.ts` and must not be edited
manually. `api:types:check` generates into a temporary file and fails when the committed contract
is stale; it does not modify the committed file. UI/form/view-model types remain handwritten.
