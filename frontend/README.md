# Ajo Next.js frontend

Run FastAPI on port 8000 from the repository root, then `npm install` and `npm run dev` in this folder. Visit http://127.0.0.1:3000. `AJO_API_ORIGIN` configures the server-side same-origin API proxy. Do not put backend credentials in public environment variables.

## Human-maintainable boundaries

- `src/app`: App Router URLs and member/staff layouts. Public pages include `/`, `/marketplace`, `/terms`, `/privacy`, `/sign-in`, `/register`.
- `/app/circles`, `/app/account`, `/app/invitations`, `/app/marketplace`, `/app/notifications`, `/app/trust`, `/app/reports`: native React member workflows.
- `/backoffice`: native administrative modules. CMS is `/backoffice/cms`; draft preview uses `/backoffice/cms/preview` and authenticated JSON.
- `src/components`: domain components for account, circles and backoffice, shared navigation/forms/data views.
- `src/lib/api`: named typed resources for auth, circles/contracts, account, marketplace, notifications, administration and CMS. `client.ts` owns transport, coordinated token refresh, field errors, multipart uploads and binary downloads.
- `src/providers`: shared session and toast state. Backend authorization remains authoritative.
- `src/lib/frequencies.ts`: eight requirement frequency choices shared across screens.

Both marketplaces mount the same React component and call `/api/v1/public/marketplace`. Eligibility is checked when joining. Sandbox examples cannot be joined. New circle setup sends `contribution_minor`; backend preview derives and validates payouts using actual calendar dates before draft creation. Member capacity is fixed at setup.

`/app?view=...` URLs redirect to native routes for bookmark compatibility. No native route loads the legacy workspace controllers or injects backend HTML. Historical Python HTML handlers and files remain available solely as compatibility material; their removal was blocked by automatic approval review. Use port 3000 as the frontend entry point and configure `AJO_FRONTEND_ORIGIN=http://127.0.0.1:3000` on FastAPI.

## Verification

`npm run typecheck`, `npm run build`; browser tests in `tests/next-*-ui.cjs` use `AJO_UI_PORT` (default 3000) and `AJO_PLAYWRIGHT_MODULE`. Browser mutations use intercepted fictional fixtures. FastAPI sandbox regression tests run separately with pytest and isolated databases. Keep `AJO_DEMO_MODE=true` for sandbox testing.
