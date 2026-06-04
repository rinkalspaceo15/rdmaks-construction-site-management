# Construction Site Management MVP — Execution Plan

**Goal:** Build working MVP from existing scaffolding in `construction-site/` — sites, workers, attendance, materials, expenses, daily reports.

**Stack:** React 18 + Vite + Tailwind + Lucide | Express + pg + PostgreSQL | No auth for MVP

**Current state:** Scaffolding only — empty route files, no models, no frontend pages/components/services.

**Specs:** `docs/backend.md` (API + DB), `docs/frontend.md` (7 pages, 7 components, 6 services)

---

## Phase 1: Server Foundation

- [ ] **1.1** Create `server/src/app.ts` — Express app with cors, json, route mounts, error handler. Export `app` (no `listen()`).
- [ ] **1.2** Rewrite `server/src/index.ts` — import `app`, call `listen(3000)` only here.
- [ ] **1.3** Create `server/src/middleware/errorHandler.ts` — `errorHandler` + `notFoundHandler`.
- [ ] **1.4** Add input types (`CreateSiteInput`, `CreateWorkerInput`, `AttendanceRecord`, `CreateMaterialInput`, `CreateExpenseInput`, `CreateReportInput`) to `server/src/types/index.ts`.
- [ ] **1.5** Create standalone route files (empty routers) for `attendanceStandalone.ts`, `materialsStandalone.ts`, `expensesStandalone.ts`, `reportsStandalone.ts` — avoids param collisions per CLAUDE.md rule.
- [ ] **1.6** Run migration: `npx tsx src/db/migrate.ts` — verify 6 tables exist.
- [ ] **1.7** Commit: `refactor(server): app/server separation, error handler, input types`

## Phase 2: Backend Models & Routes (6 resources)

Each resource: create `models/<resource>.ts` (SQL queries) + implement `routes/<resource>.ts` (HTTP handlers). Validate required fields on POST/PUT, return 400 on missing. Wrap handlers in try/catch, call `next(err)`.

- [ ] **2.1** Sites — `models/sites.ts` (getAll, getById, create, update, remove) + `routes/sites.ts` (GET /, GET /:id, POST /, PUT /:id, DELETE /:id). Test with curl.
- [ ] **2.2** Workers — `models/workers.ts` + `routes/workers.ts` (GET /, POST /, PUT /:id, DELETE /:id).
- [ ] **2.3** Attendance — `models/attendance.ts` (getBySiteAndDate with worker JOIN, markBulk with UPSERT, updateById) + `routes/attendance.ts` (nested: GET /:siteId/attendance?date=, POST /:siteId/attendance) + `routes/attendanceStandalone.ts` (PUT /:id).
- [ ] **2.4** Materials — `models/materials.ts` + `routes/materials.ts` (nested: GET/POST under /:siteId/materials) + `routes/materialsStandalone.ts` (PUT /:id, DELETE /:id).
- [ ] **2.5** Expenses — `models/expenses.ts` + `routes/expenses.ts` (nested) + `routes/expensesStandalone.ts` (PUT/DELETE).
- [ ] **2.6** Reports — `models/reports.ts` (getBySite, getById, create, update) + `routes/reports.ts` (nested: GET list, GET single, POST) + `routes/reportsStandalone.ts` (PUT /:id).
- [ ] **2.7** Smoke test all endpoints with curl. Commit per resource.

**Route mounting in app.ts:**
```
/api/sites         → sitesRouter
/api/workers       → workersRouter
/api/attendance    → attendanceStandaloneRouter
/api/materials     → materialsStandaloneRouter
/api/expenses      → expensesStandaloneRouter
/api/reports       → reportsStandaloneRouter
/api/sites         → attendanceRouter (nested)
/api/sites         → materialsRouter (nested)
/api/sites         → expensesRouter (nested)
/api/sites         → reportsRouter (nested)
```

## Phase 3: Frontend Services & Components

- [ ] **3.1** Create `services/api.ts` — Axios instance with `baseURL: '/api'`.
- [ ] **3.2** Create 6 service files: `siteService.ts`, `workerService.ts`, `attendanceService.ts`, `materialService.ts`, `expenseService.ts`, `reportService.ts` — each exports typed CRUD functions matching backend endpoints.
- [ ] **3.3** Create 7 components:
  - `Sidebar.tsx` — nav links (Dashboard, Sites, Workers), Lucide icons, collapses on mobile
  - `PageHeader.tsx` — title + optional action button
  - `StatCard.tsx` — label, value, icon
  - `Modal.tsx` — overlay dialog with title, children, cancel/submit
  - `StatusBadge.tsx` — colored pill (active=green, on_hold=yellow, completed=gray)
  - `EmptyState.tsx` — icon + message + optional CTA button
  - `DataTable.tsx` — generic table with columns config + optional actions column
- [ ] **3.4** Commit: `feat(client): add API services and 7 reusable components`

## Phase 4: Frontend Pages (8 pages)

- [ ] **4.1** `Dashboard.tsx` (`/`) — stat cards (total sites, active, workers, on-hold), quick action links, recent sites grid.
- [ ] **4.2** `SitesList.tsx` (`/sites`) — card grid, search bar, status filter tabs, "Add Site" modal.
- [ ] **4.3** `SiteDetail.tsx` (`/sites/:id`) — site header with status badge, edit modal, tab links to attendance/materials/expenses/reports.
- [ ] **4.4** `Workers.tsx` (`/workers`) — DataTable with name/role/phone/wage, add/edit modal, delete.
- [ ] **4.5** `Attendance.tsx` (`/sites/:id/attendance`) — date picker, worker list with present/absent/half_day toggles, overtime input, "Mark All Present", bulk save.
- [ ] **4.6** `Materials.tsx` (`/sites/:id/materials`) — DataTable with running total footer, add/edit modal, INR formatting.
- [ ] **4.7** `Expenses.tsx` (`/sites/:id/expenses`) — category summary cards, filter tabs (all/material/labor/transport/misc), DataTable with grand total, add/edit modal.
- [ ] **4.8** `DailyReports.tsx` (`/sites/:id/reports`) — timeline list (date + weather icon + summary), expandable detail, create modal with date/weather/summary/issues.
- [ ] **4.9** Commit per page.

## Phase 5: App Layout & Wiring

- [ ] **5.1** Replace `App.tsx` — Sidebar + `<main>` with all Routes wired to pages.
- [ ] **5.2** Verify `npx tsc --noEmit` passes for client.
- [ ] **5.3** Start both servers, test in browser at 375px / 768px / 1024px.
- [ ] **5.4** Commit: `feat(client): wire App layout with Sidebar and all 8 pages`

## Phase 6: Fix CLAUDE.md

- [ ] **6.1** Root `CLAUDE.md`: fix port 3001 → 3000, fix folder paths to `construction-site/client/` and `construction-site/server/`.
- [ ] **6.2** `construction-site/CLAUDE.md`: fix typos ("backend have own" → proper English), port consistency.
- [ ] **6.3** Commit: `fix: correct port and path references in CLAUDE.md files`

---

## Key Conventions

- **Currency:** `Intl.NumberFormat('en-IN')` with `₹` prefix everywhere
- **DECIMAL fields:** pg returns strings — cast with `Number()` on client
- **Colors:** amber-600 primary actions, gray-900 sidebar, warm neutrals background
- **Validation:** check required fields → return 400 before touching DB
- **Error handling:** try/catch in routes → `next(err)` → centralized handler

---

## Success Criteria (from REQUIREMENTS.md)

- [ ] Add a construction site
- [ ] Add workers
- [ ] Mark attendance for workers at a site on a given day
- [ ] Log materials purchased for a site
- [ ] Log expenses for a site
- [ ] Write a daily report for a site
- [ ] Dashboard with overview stats across all sites
- [ ] Mobile responsive at 375px width
