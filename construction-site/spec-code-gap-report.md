# Spec vs Code Gap Report

## Summary
Overall health is reasonably strong: database schema and all cross-package contracts (API base, DECIMAL-as-string, UUIDs, error shape, no-auth, ISO dates) match the spec exactly, and every spec-required endpoint, page, and service function exists. However, the implementation has drifted beyond the stated MVP scope and one root-route contract is broken. Across dimensions there are 8 gaps: 2 blocker, 1 major, 5 minor. The dominant themes are (1) **scope creep** — Payroll feature (1 backend route, 1 page, 1 service) and Workers page are implemented despite not appearing in `docs/frontend.md` or `docs/backend.md`; (2) **routing contract drift** — Dashboard moved off `/` in favor of an unspecified LandingPage; and (3) **a single missing spec'd behavior** — DataTable is not actually sortable despite the spec calling it a "Sortable table component."

## Gaps by dimension

### backend-endpoints
- **minor** — GET /api/sites/:siteId/payroll (extra)
  - Spec: `/Users/sotsys337/LEarning/docs/backend.md` API Endpoints section (no mention of payroll)
  - Code: `/Users/sotsys337/LEarning/construction-site/server/src/routes/payroll.ts:7`, mounted in `/Users/sotsys337/LEarning/construction-site/server/src/app.ts:33`
  - A fully functional payroll endpoint with `from`/`to` query parameters and a backing model is implemented but is not documented in `backend.md` and not listed in the MVP exclusions either.

### frontend-pages
- **blocker** — Dashboard page route (mismatch)
  - Spec: `/Users/sotsys337/LEarning/docs/frontend.md` line 44 — "Dashboard — `/`"
  - Code: `/Users/sotsys337/LEarning/construction-site/client/src/App.tsx:41`
  - Dashboard is routed to `/app` instead of the spec-required `/`, breaking the root-page contract.

- **blocker** — LandingPage (extra)
  - Spec: `/Users/sotsys337/LEarning/docs/frontend.md` line 44 (Dashboard owns `/`; no LandingPage in spec)
  - Code: `/Users/sotsys337/LEarning/construction-site/client/src/App.tsx:30-35`
  - Root path `/` is intercepted to render an undocumented LandingPage component, displacing the spec-required Dashboard entry point.

- **minor** — Workers page (extra)
  - Spec: `/Users/sotsys337/LEarning/docs/frontend.md` line 42 — "Pages (7 total)" enumerates 7 pages; Workers is not among them
  - Code: `/Users/sotsys337/LEarning/construction-site/client/src/App.tsx:44`, `/Users/sotsys337/LEarning/construction-site/client/src/pages/Workers.tsx`
  - A fully implemented Workers page exists at `/workers` though the spec lists exactly 7 pages and Workers is not one of them. (The spec's Sidebar description does mention a Workers link, creating internal inconsistency in the spec itself.)

- **minor** — Payroll page (extra)
  - Spec: `/Users/sotsys337/LEarning/docs/frontend.md` (no mention of payroll)
  - Code: `/Users/sotsys337/LEarning/construction-site/client/src/App.tsx:49`, `/Users/sotsys337/LEarning/construction-site/client/src/pages/Payroll.tsx`
  - A Payroll page is implemented at `/sites/:id/payroll` though the spec lists exactly 7 MVP pages and payroll appears only in `docs/roadmap/02-payroll.md` as a future Phase 1 feature.

### frontend-services
- **minor** — workerService.getWorker(id) (extra)
  - Spec: `/Users/sotsys337/LEarning/docs/frontend.md` line 142 — workerService lists only `getWorkers, createWorker, updateWorker, deleteWorker`
  - Code: `/Users/sotsys337/LEarning/construction-site/client/src/services/workerService.ts:5`
  - `getWorker(id)` calls `GET /api/workers/:id`, an endpoint neither in `backend.md` nor implemented in `/Users/sotsys337/LEarning/construction-site/server/src/routes/workers.ts` — meaning this call would 404 if invoked.

- **minor** — payrollService.ts (extra)
  - Spec: `/Users/sotsys337/LEarning/docs/frontend.md` API Integration (Services Layer) — lists exactly 6 service files; payroll is not one
  - Code: `/Users/sotsys337/LEarning/construction-site/client/src/services/payrollService.ts`
  - An entire payroll service file exists to back the out-of-scope Payroll page; payroll appears only in `docs/roadmap/02-payroll.md` as a future feature.

### frontend-components
- **major** — DataTable component (mismatch)
  - Spec: `/Users/sotsys337/LEarning/docs/frontend.md` line 129 — "Sortable table component. Receives columns config + data rows. Supports action buttons per row."
  - Code: `/Users/sotsys337/LEarning/construction-site/client/src/components/DataTable.tsx:1-82`
  - Columns, data rows, and per-row action buttons are present, but sorting is entirely missing — no sort state, no clickable headers, no sort indicators. The "Sortable" requirement is unimplemented.

## Recommendations
- **Restore the root-route contract (blockers):** Move Dashboard back to `/` at `/Users/sotsys337/LEarning/construction-site/client/src/App.tsx:41` and either remove the LandingPage interception at lines 30-35 or update `docs/frontend.md` to formally introduce LandingPage and renumber the page list. This is the only contract-breaking gap and should be fixed first.
- **Decide on Payroll scope (major decision driving 3 minor gaps):** Either (a) remove the Payroll feature from MVP — delete `/Users/sotsys337/LEarning/construction-site/server/src/routes/payroll.ts`, `/Users/sotsys337/LEarning/construction-site/server/src/models/payroll.ts`, `/Users/sotsys337/LEarning/construction-site/client/src/pages/Payroll.tsx`, `/Users/sotsys337/LEarning/construction-site/client/src/services/payrollService.ts`, the route in `App.tsx:49`, and the mount in `app.ts` — or (b) promote it into MVP by adding endpoint, page, and service entries to `docs/backend.md` and `docs/frontend.md`.
- **Implement DataTable sorting (major):** Add sort state, clickable column headers, and sort indicators to `/Users/sotsys337/LEarning/construction-site/client/src/components/DataTable.tsx` to honor the "Sortable" promise in the spec. Alternatively, downgrade the spec language if sortability is no longer wanted.
- **Reconcile Workers page (minor):** The spec is internally inconsistent — it says "Pages (7 total)" but its Sidebar description references a Workers link. Update `docs/frontend.md` to either include Workers as page #8 (and update the count) or remove the Sidebar Workers link and delete `/Users/sotsys337/LEarning/construction-site/client/src/pages/Workers.tsx`.
- **Fix the dangling getWorker call (minor):** Either remove `getWorker(id)` at `/Users/sotsys337/LEarning/construction-site/client/src/services/workerService.ts:5` (it has no backing endpoint and will 404), or add `GET /api/workers/:id` to both `docs/backend.md` and `/Users/sotsys337/LEarning/construction-site/server/src/routes/workers.ts`.
- **Add a spec-drift guard:** Treat `docs/frontend.md` and `docs/backend.md` as the contract during PR review and require a spec update in the same commit whenever new pages, services, or endpoints land — this would have caught Payroll, Workers, LandingPage, and the stray `getWorker` before they merged.
