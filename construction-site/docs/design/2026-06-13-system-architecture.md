# System Architecture — Construction Site Management

> **Audience:** internal. Reference doc for future plans, onboarding, and architecture decisions.
> **Date:** 2026-06-13
> **Status:** Living. Update as each Phase 1 feature closes and as Phase 2 lifts guardrails.
> **Companion docs:**
> - `docs/frontend.md`, `docs/backend.md` — current API/UI contracts (the "Specs")
> - `docs/roadmap/README.md` — phasing + verified market findings
> - `construction-site/CLAUDE.md`, `client/CLAUDE.md`, `server/CLAUDE.md` — enforcement rules
> - `construction-site/docs/plans/2026-06-13-product-ui-market-plan.md` — strategy + UI focus
> - `construction-site/spec-code-gap-report.md` — current spec-vs-code drift

---

## 1. Purpose

Capture the system as it exists today and where Phase 1 work is taking it. Future implementation plans (Phase 1 close-out, the corrected gap-fix, Phase 2 lifts) cite this doc instead of re-deriving architecture.

This is **not** a plan. There are no tasks here, no commits to run. Only what the system is and what it's becoming.

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Site supervisor / contractor                            │
│  Android phone, 375–414 px, sun + dust + spotty network  │
└──────────────────────────────────────────────────────────┘
                            │  HTTPS
                            ▼
┌──────────────────────────────────────────────────────────┐
│  React 18 SPA  (Vite-built static bundle in prod)        │
│  React Router 6 + Axios + Tailwind + Lucide              │
│  Mobile-first; AppLayout with collapsing Sidebar         │
└──────────────────────────────────────────────────────────┘
                            │  /api/...
                            ▼  (Vite proxy in dev → :3000)
┌──────────────────────────────────────────────────────────┐
│  Express 4 + TypeScript 5 (strict)                       │
│  Routes → Models → pg.Pool. Centralized error handler.   │
│  No auth, no session, no cookies. Anonymous always.      │
└──────────────────────────────────────────────────────────┘
                            │  parameterized SQL
                            ▼
┌──────────────────────────────────────────────────────────┐
│  PostgreSQL  (database: construction_site)               │
│  uuid-ossp extension; 6 tables; idempotent migration.    │
└──────────────────────────────────────────────────────────┘
```

**Three load-bearing principles:**

1. **Two-package monorepo, types duplicated by hand.** `client/` and `server/` each have their own `package.json`, `tsconfig.json`, and `node_modules`. There is no shared `types/` package yet — `client/src/types/index.ts` and `server/src/types/index.ts` are kept in sync manually. Future work in §9.3 may consolidate.
2. **Stateless, no-auth API.** Every HTTP request is anonymous. The server validates input at every boundary (no "the client checked it"); the client validates at form submit.
3. **One deployment per contractor.** No multi-tenant logic, no per-user data isolation. A new customer = a new deployment of both packages + a fresh `construction_site` database. Phase 2 auth (`docs/roadmap/07-auth-accounts.md`) lifts this when needed.

---

## 3. Component Boundaries

### Client (`client/src/`)

| Layer | Path | Responsibility |
|---|---|---|
| Entry | `main.tsx` | Renders `<App />` inside `<BrowserRouter>` |
| Composition + routing | `App.tsx` | URL → page mapping; `AppLayout` wraps non-landing pages |
| Layout | `AppLayout` (inside `App.tsx`), `components/Sidebar.tsx` | Persistent sidebar; collapses on `<md`; mobile top-bar with menu |
| Pages | `pages/<Name>.tsx` | One per route; compose components, call services, manage local form state |
| Components | `components/<Name>.tsx` | Reusable UI: `DataTable`, `Modal`, `StatCard`, `PageHeader`, `StatusBadge`, `EmptyState`, `LanguageSwitcher`, `PageTransition`. **Known drift:** `Intl.NumberFormat('en-IN')` currency formatter is inlined in `Materials.tsx`, `Expenses.tsx`, `Payroll.tsx`, `Workers.tsx`. A centralized `formatINR` helper is planned (see §8). |
| Services | `services/<resource>Service.ts` | Thin Axios wrappers; one file per resource. **Error handling is the caller's responsibility** — services have no interceptor and don't catch; pages must wrap calls in try/catch and surface errors to users. Today inconsistent: `SitesList.tsx` uses try/catch + `console.error`; `Dashboard.tsx` and `Materials.tsx` use `.then/.finally` without `.catch`. Should be normalized as part of error-UX polish. |
| Shared HTTP | `services/api.ts` | Single Axios instance with `baseURL: '/api'`; no interceptor |
| Types | `types/index.ts` | Interfaces matching server payloads + form-body shapes |
| i18n | `i18n/` (`LanguageProvider` context + `useTranslation()` hook) | `main.tsx` wraps `<App />` with `<LanguageProvider>`. Catalogs at `i18n/{en,hi}.json` (flat key → string, ~165 keys each). Selected language persists to `localStorage` key `sm_lang`. Missing keys fall back to English and emit a `console.warn` in dev. |

**State rules.** `useState` + `useContext` only. No Redux/Zustand/Jotai/React Query (intentional — see §9.5). Server state via direct service calls in `useEffect`.

### Server (`server/src/`)

| Layer | Path | Responsibility |
|---|---|---|
| Entry | `index.ts` | **Only file that calls `app.listen()`** (8 lines; 5 non-blank) |
| App | `app.ts` | Builds Express, mounts middleware + routers, `export default app` |
| Routes — nested | `routes/<resource>.ts` | Handle `/:siteId/<resource>` routes; mounted at `/api/sites` |
| Routes — standalone | `routes/<resource>Standalone.ts` | Handle `/:id` CRUD; mounted at `/api/<resource>` |
| Models | `models/<resource>.ts` | All SQL lives here; the only consumer of `pg.Pool` |
| DB | `db/pool.ts`, `db/migrate.ts` | Shared pool with a DATE type-parser override (`types.setTypeParser(1082, …)`) returning the raw `'YYYY-MM-DD'` string to prevent the IST timezone shift on date fields. Idempotent `CREATE TABLE IF NOT EXISTS` migration. |
| Middleware | `middleware/errorHandler.ts` + `cors` package | `cors()` mounted globally at `app.ts:18` with default config (all origins allowed). `errorHandler.ts` = 404 handler + 500 handler with `{ error: string }` shape. |
| Types | `types/index.ts` | DB row + request body shapes |

### Two mandatory patterns

**App/server separation.** `app.ts` builds and exports the Express instance; `index.ts` is the only file that calls `.listen()`. Future tests must import from `./app` so they don't open a real port on every test run.

**Nested/standalone router split.** For resources that belong to a site (`attendance`, `materials`, `expenses`, `reports`), two router files exist:
- `<resource>.ts` — nested, mounted at `/api/sites`, handles `/:siteId/<resource>` requests
- `<resource>Standalone.ts` — standalone, mounted at `/api/<resource>`, handles `/:id` CRUD

Reason: Express collapses param names when one router is mounted at two base paths (`:siteId` and `:id` collide). Splitting into two files is the documented escape.

---

## 4. Data Flow (one request, end-to-end)

User opens `/sites/abc/materials` on a phone:

1. React Router renders `pages/Materials.tsx` inside `AppLayout` (Sidebar + main column).
2. `Materials.tsx` calls `getMaterials(siteId)` from `services/materialService.ts`.
3. `materialService` calls `api.get('/sites/abc/materials')` — `api` is the shared Axios instance with `baseURL: '/api'`.
4. Browser issues `GET /api/sites/abc/materials`. In dev, Vite proxies to `http://localhost:3000`.
5. Express in `app.ts` matches `app.use('/api/sites', materialsRouter)` → router matches `GET /:siteId/materials`.
6. Route handler validates `siteId` shape, calls `getMaterialsBySite(siteId)` from `models/materials.ts`.
7. Model issues parameterized SQL: `pool.query('SELECT * FROM materials WHERE site_id = $1 ORDER BY date DESC', [siteId])`.
8. pg driver returns rows; **DECIMAL columns are strings** (`quantity`, `unit_price`); **DATE columns are `'YYYY-MM-DD'` strings** (see §5 — `pool.ts` overrides oid 1082).
9. Route sends `res.json(rows)` — DECIMALs and dates travel as strings, UUIDs as strings.
10. Client receives JSON; `client/src/types/index.ts` declares DECIMAL fields as `string` so TypeScript matches reality.
11. `Materials.tsx` renders the table via `<DataTable />`, converting strings to numbers only at math sites: `formatCurrency(Number(item.quantity) * Number(item.unit_price))`.

For mutations (POST/PUT/DELETE), the path is the same but with body validation at step 6 (`req.body` checked for required fields and types before any SQL).

---

## 5. Cross-Package Contracts (mandatory)

The contracts both client and server must respect. Changing one requires changing both.

| Contract | Detail |
|---|---|
| **URL prefix** | All endpoints at `/api/...`. Client always uses relative `/api/<path>`; Vite proxies in dev; production hosting must preserve the `/api` prefix. |
| **DECIMAL as string** | pg driver returns DECIMAL as string. `client/src/types/index.ts` and `server/src/types/index.ts` both type DECIMAL fields as `string`. Convert with `Number()` only at math sites. Easy to break — needs PR-level discipline. |
| **DATE as `YYYY-MM-DD`** | `server/src/db/pool.ts` overrides pg type parser for oid 1082 (DATE) to return the raw string. This prevents the IST timezone shift that would render dates one day early. TIMESTAMP (oid 1114) is unaffected and travels as full ISO. |
| **UUIDs** | Strings end-to-end (`uuid_generate_v4()` server-side). Never int. |
| **Error shape** | `{ error: string }` on every 4xx/5xx. No other keys. Client error handlers read `response.data.error`. **Spec conflict (open):** `docs/backend.md:181` shows a permissive `{ error, details? }` form that disagrees with this contract; code (`server/src/middleware/errorHandler.ts:4,9`) and `server/CLAUDE.md:73` both follow the strict form. Recommend reconciling `docs/backend.md` to drop the optional `details` so all four sources agree. |
| **No auth** | No Authorization headers, no cookies, no session middleware. Anonymous always. Validation at boundary is non-optional because of this. |

---

## 6. Data Model (PostgreSQL)

Six tables, all keyed by UUID (`uuid_generate_v4()` from uuid-ossp extension). All schema lives in `server/src/db/migrate.ts` as idempotent `CREATE TABLE IF NOT EXISTS` statements.

```
sites (id, name, address, status, start_date, created_at)
  └── attendance (id, site_id→sites, worker_id→workers, date, status, overtime_hours DECIMAL)
  │     UNIQUE(site_id, worker_id, date)
  ├── materials (id, site_id→sites, name, quantity DECIMAL, unit, unit_price DECIMAL, vendor, date)
  ├── expenses (id, site_id→sites, category, description, amount DECIMAL, date)
  └── daily_reports (id, site_id→sites, date, weather, summary, issues, created_at)

workers (id, name, role, phone, daily_wage DECIMAL, created_at)
  (referenced by attendance.worker_id)
```

**Foreign keys** reference parent `id`. `ON DELETE CASCADE` is defined on every FK relationship in `db/migrate.ts` — sites → attendance, materials, expenses, daily_reports; workers → attendance. Deleting a site cascades to all of its records; deleting a worker cascades to attendance entries. (This is a load-bearing behavior — a UI-level "delete site" hits five tables.)

**Single pool.** `db/pool.ts` exports one `pg.Pool` instance configured from env vars (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) with sane defaults. All models import from there. **Never instantiate a new `Pool` or `Client` elsewhere.**

**Migration is idempotent.** Run with `npm run migrate`. Creates `uuid-ossp` extension if missing, then `CREATE TABLE IF NOT EXISTS` for each table. Never destructive. No `DROP`, no `ALTER` migrations yet (schema changes would be additive only at this stage).

---

## 7. Current State (2026-06-13)

### What's built and matches the spec
- All 24 spec'd REST endpoints from `docs/backend.md` ✓ (plus 1 unspec'd Phase 1 endpoint: `GET /api/sites/:siteId/payroll` — see "Built but not yet in the main specs" below)
- All 7 pages from `docs/frontend.md` ✓ (with one caveat — Dashboard's route, below)
- All 6 service files + their spec'd functions ✓ (with one extra)
- All 7 spec'd reusable components ✓ (plus 2 Phase 1 additions: `LanguageSwitcher`, `PageTransition`); DataTable lacks sort — see real gaps below
- DB schema 100% matches `docs/backend.md` ✓
- Cross-package contracts (§5): 5 of 6 clean ✓. **Error-shape contract is in dispute** between `docs/backend.md:181` (permissive `details?`) and the architecture doc + `server/CLAUDE.md:73` + code (strict). See §5 note.

### Built but not yet in the main specs (Phase 1 in flight)
These exist in code today but `docs/frontend.md` / `docs/backend.md` don't yet describe them. Their authority lives in their roadmap docs:

- **LandingPage** at `/`, with the Dashboard relocated to `/app`. Source: `docs/roadmap/01-landing-redesign.md` ("Designed & user-approved, paused mid-build"). Will move main spec when redesign closes.
- **Payroll** — `GET /api/sites/:siteId/payroll` (backend route + model), `pages/Payroll.tsx`, `services/payrollService.ts`, types `PayrollRow` + `PayrollSummary`. Source: `docs/roadmap/02-payroll.md`. Computes wage from attendance + overtime + `workers.daily_wage`.
- **Vernacular i18n** — `useTranslation` hook, `LanguageSwitcher` component, translation keys across sidebar, materials, daily reports, etc. Source: `docs/roadmap/03-vernacular-i18n.md`. Coverage being expanded.

### Real spec-vs-code gaps (Phase 1 close-out work)
- **`workerService.getWorker(id)`** in `client/src/services/workerService.ts:5`. Calls `GET /api/workers/:id`, which is not in `docs/backend.md` and not implemented in `server/src/routes/workers.ts`. Would 404. Dead code.
- **DataTable not sortable.** `docs/frontend.md:129` requires "Sortable table component"; `client/src/components/DataTable.tsx` has no sort state, no clickable headers, no indicators.

### Open architectural question
- **Workers page (`/workers`)** exists in code but is not enumerated in `docs/frontend.md`'s "Pages (7 total)" section and is not in any `docs/roadmap/*.md` doc. Origin and intended status unknown. See §9.1.

---

## 8. Target State (after Phase 1 closes)

This is what the system should look like once the three Phase 1 features (`01`, `02`, `03`) finish and the gap-fix lands.

- `docs/frontend.md` documents the Phase 1 pages. **Two open decisions drive the final shape:** the root-route resolution (§9.8) and the Workers-page status (§9.1). With both open, the page count lands at 8 or 9. Layout is either (a) Dashboard at `/`, LandingPage on a separate route like `/welcome` (spec-conformant), or (b) LandingPage at `/`, Dashboard at `/app` (current code; requires an explicit spec-change decision).
- `docs/backend.md` documents a Payroll section with `GET /api/sites/:siteId/payroll`.
- All UI strings are translation keys; no inline English.
- `DataTable` is sortable via opt-in per column (`sortable?: boolean`) with chevron indicators; Materials, Expenses, and Payroll opt in.
- `workerService.getWorker(id)` is removed.
- A centralized `formatINR(value: number | string): string` lives at `client/src/utils/` and replaces every inline `Intl.NumberFormat('en-IN')` usage.
- The spec-vs-code gap report runs to zero gaps.

**Not in target state for Phase 1:** auth, photo upload, GST, offline-first, native mobile, exports. Each has its own roadmap doc (Phase 2 / Phase 3) and explicitly lifts an MVP guardrail.

---

## 9. Open Architectural Questions

Decisions that should be made deliberately rather than accidentally.

### 9.1. Workers page — keep or delete?
**Status:** open. Not in any spec or roadmap doc.

- **Option A: keep and document.** Workers are entity-level data (one worker can attend multiple sites), so a standalone CRUD page matches the schema. Spec gains an 8th page entry.
- **Option B: delete.** Force worker creation/editing through Attendance flows. Reduces sidebar clutter; matches "Pages (7 total)" literal count.

**Recommendation: A (keep and document).** Entity-level data deserves entity-level management UI. The Attendance-modal path becomes painful when adding 20 workers for a new site.

### 9.2. Photo upload storage (Phase 2)
`docs/roadmap/04-bill-photo-capture.md` will need to choose:
- **Local disk on the deployment host** — fits "one deployment per contractor" model; no external dependencies.
- **S3 / R2 / similar object store** — fits managed-SaaS model; needs credentials per deployment.
- **Cloudinary / similar all-in-one** — easiest DX, costs more per GB.

Decision drives deployment shape and pricing. Don't choose until Phase 2 starts.

### 9.3. Shared types between client and server
Currently duplicated by hand. Drift happened recently — recent commit `431832e` (`fix(types): type DECIMAL columns as string per pg driver contract`) fixed one side; the other side already matched. Risk grows linearly with new fields.

- **Option A: npm workspaces with a `packages/types` package.** Tooling lift now; long-term win.
- **Option B: status quo, with a PR-review discipline check.** Cheap; relies on human attention.

**Recommendation: B until the next drift incident, then A.** Premature consolidation has its own cost (build pipelines, double install in CI).

### 9.4. Testing strategy
No test framework installed in either package. `server/CLAUDE.md` plans Vitest + Supertest; `client/CLAUDE.md` is silent.

When tests arrive, install all dependencies in one commit (per `server/CLAUDE.md` discipline): `vitest`, `supertest`, `@types/supertest`, `vitest.config.ts`, scripts. Same for client: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `vitest.config.ts`. Don't bring tests in piecemeal.

Tests must:
- Server side: import `app` from `./app` (never `./index`), use a real Postgres test schema with `setupTestDb` / `cleanTestDb` / `teardownTestDb`.
- Client side: test components in isolation; mock services via MSW or hand-rolled stubs.

### 9.5. State management
Currently `useState` + `useContext` + direct service calls in `useEffect`. No React Query, no Zustand, no Jotai.

Pain points that would justify adding a library:
- Optimistic mutations (when offline-first lands — Phase 3).
- Shared server-state cache across pages (e.g., a site visited from Sites List and Site Detail in quick succession; today both pages refetch).

Until one of those pains is real, don't add a library — keeps cognitive load low for a mobile-first MVP.

### 9.6. Spec evolution discipline
Three sources of truth currently: `docs/frontend.md` + `docs/backend.md` (main specs), `docs/roadmap/*.md` (in-flight feature docs), and the code itself. They diverged in this case — the gap report reflects that.

**Proposed rule:** when a Phase 1 feature closes (acceptance criteria met, code merged), the same commit that closes the roadmap doc must:
1. Update `docs/frontend.md` / `docs/backend.md` to absorb the feature.
2. Mark the roadmap doc as `Status: Closed (merged into main specs)`.

This makes spec-vs-code gaps self-healing as Phase 1 wraps.

### 9.7. Production deployment shape (not yet decided)
Vite's dev proxy (`/api` → `localhost:3000`) is a dev-only convenience. Production hosting must preserve the `/api` → server routing through Nginx, Caddy, Vercel rewrites, or similar. **There is no production deployment doc yet** — add one when the first pilot deployment is staged.

**CORS is also a deployment decision.** `server/src/app.ts:18` mounts default `cors()` (all origins allowed). Same-origin production (reverse proxy serves both the SPA and `/api` from one origin) needs no change. Separate-origin deployment (SPA on a CDN, server on a different host) requires an explicit allowlist passed to `cors({ origin: [...] })`.

### 9.8. Root route — Dashboard at `/` or LandingPage at `/`?

**Status:** unresolved; blocks Phase 1 spec close-out.

- **Spec position** (`docs/frontend.md:44`): Dashboard owns `/`.
- **Code position** (`client/src/App.tsx:30-35`): LandingPage owns `/`, Dashboard at `/app`.
- **Feature 01 scope** (`docs/roadmap/01-landing-redesign.md:24`): explicitly excludes route changes from the LandingPage redesign.
- **Gap report** (`spec-code-gap-report.md`): flags current routing as a blocker against the original spec.

The Phase 1 LandingPage redesign was scoped to a restyle, not a route swap. The current routing in code is undocumented and conflicts with `docs/frontend.md:44`. The intent is unclear — was the route swap deliberate or accidental?

**Decision needed before Phase 1 closes:**
- **(a)** Restore Dashboard to `/`; host LandingPage on a separate route (e.g., `/welcome`). Matches `docs/frontend.md:44` and `01-landing-redesign.md`'s "no route changes" scope rule. Minimal spec edit.
- **(b)** Record an explicit spec-change decision (separate from Feature 01) that LandingPage owns `/` and Dashboard moves to `/app`. Update `docs/frontend.md` to reflect 8+ pages with new root. Requires Feature 01's scope to formally lift the "no route changes" exclusion.

---

## 10. Explicitly NOT in This Architecture

Features the codebase deliberately does not have, with the documented escape hatch:

| Concern | Roadmap doc | Phase |
|---|---|---|
| Authentication / accounts | `07-auth-accounts.md` | 2 — **build first**; gates GST, ledgers, multi-user pricing tiers, and photos (privacy) |
| File / photo uploads | `04-bill-photo-capture.md` | 2 — defensible market gap per `roadmap/README.md` §4; should follow auth (per `04-bill-photo-capture.md:59` — privacy) |
| GST + invoicing + ledgers | `05-gst-billing-ledgers.md` | 2 — requires auth |
| Offline-first sync | `06-offline-first.md` | 3 — largest lift, last |
| Native mobile app | — | Not on roadmap; mobile web is the target |
| Push notifications | — | Not on roadmap |
| PDF / Excel export | — | Mid-priority post-MVP, not yet specced |

---

## 11. Risks

- **DECIMAL contract erosion.** Adding `Number()` on the wrong side (server → client or in form bodies) breaks rounding precision. Single-source-of-truth would help; testing would help more. Mitigation today: PR review.
- **Spec drift.** Three sources of truth (see §9.6). Currently diverged. Discipline from §9.6 mitigates; without it, drift will recur every Phase.
- **No tests = regressions land easily.** Acceptable while the page count is small and the team is one developer. Becomes urgent past ~10 active features or first paying customer.
- **Single `pg.Pool`, no read replicas.** Fine for one-deployment-per-contractor (typical load = 1 supervisor + occasional contractor). Phase 2 multi-tenant scaling needs pgBouncer or per-tenant pools.
- **Vite dev proxy ≠ production routing.** Production must explicitly route `/api` to the Express server. Easy to forget; add a deployment doc when first pilot lands (see §9.7).
- **The IST date-parser override (§5) is silent magic.** A future developer adding a date field is unlikely to know about oid 1082 vs 1114. Mitigation: keep the comment block in `pool.ts` accurate; reference it in `server/CLAUDE.md`.

---

## 12. References

- `REQUIREMENTS.md` — scope source of truth.
- `docs/frontend.md`, `docs/backend.md` — current contracts; absorb Phase 1 features as they close.
- `docs/roadmap/README.md` — master roadmap with verified market findings.
- `docs/roadmap/01-landing-redesign.md`, `02-payroll.md`, `03-vernacular-i18n.md` — Phase 1, in flight.
- `docs/roadmap/04-bill-photo-capture.md`, `05-gst-billing-ledgers.md`, `06-offline-first.md`, `07-auth-accounts.md` — Phase 2/3, documented not built.
- `construction-site/CLAUDE.md` — cross-package contracts (§5 source).
- `construction-site/client/CLAUDE.md`, `server/CLAUDE.md` — enforcement rules per package.
- `construction-site/docs/plans/2026-06-13-product-ui-market-plan.md` — strategy + UI focus companion.
- `construction-site/spec-code-gap-report.md` — verified spec-vs-code gaps.
- `construction-site/docs/plans/2026-06-13-spec-code-gap-fix.md` — implementation plan that needs revision per the strategy doc.
