# Ajo Next.js frontend

Run FastAPI on port 8000 from the repository root, then run `npm install` and `npm run dev` here. Visit http://127.0.0.1:3000. Set `AJO_API_ORIGIN` to change the server API target; browser requests use the same-origin proxy, so tokens and provider credentials are never placed in public environment variables.

App Router pages: `/` (published CMS content), `/marketplace` (shared public catalogue), `/app` (member workspace and back office), `/terms`, `/privacy`.

React components: `Home`, `Marketplace`, `CmsEditor`, `Workspace`, `Legal`. `src/lib/api.ts` centralizes the public catalogue and authenticated API calls; `src/lib/frequencies.ts` defines the eight supported frequency labels. Both public and signed-in React marketplaces mount the same component and load the same `/api/v1/public/marketplace` catalogue. The backend checks eligibility, identity, trust, concurrent commitments and capacity at join time. Sandbox examples appear in both views and cannot be joined.

The member/workflow controllers in `public/assets/workspace/` (split into core, auth, circles, account, notifications, backoffice and bootstrap) are retained behind `Workspace` during migration to preserve circle contracts, KYC, MFA, notifications and operational workflows. They are plain JavaScript controllers, not yet native React components. The landing page, marketplace, calculator, legal pages and CMS are native React. All client assets now belong to this frontend folder. FastAPI's historical HTML URLs remain compatible during rollout; port 3000 is the new frontend entry point.

`npm run typecheck` and `npm run build` validate the frontend. The Python service remains responsible for all domain rules, staff authorization, audit records and database migrations.
