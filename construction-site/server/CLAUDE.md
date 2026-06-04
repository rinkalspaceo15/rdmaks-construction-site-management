# Backend — Express API

Full backend spec lives in @../../docs/backend.md — read it before adding routes, models, or migrations.

## Tech
Express 4 + TypeScript 5 (strict) + node-postgres (`pg`) + PostgreSQL + tsx (dev) + CORS + uuid

## Commands
```bash
npm install
npm run dev       # tsx watch src/index.ts — hot reload, port 3000
npm run migrate   # creates uuid-ossp extension + all tables (idempotent)
npm run build     # tsc → dist/ (use this to verify TS before claiming done)
npm start         # node dist/index.js (after build)
```
No standalone lint/typecheck/test script yet — `npm run build` is the verification command. <!-- DECIDE: add eslint, vitest+supertest, test script -->

## Structure
```
src/
├── index.ts                    # Entry — imports app, calls listen(PORT). The ONLY file that calls listen().
├── app.ts                      # Express instance — middleware + route mounts, exported without listen() so tests can import it
├── db/
│   ├── pool.ts                 # Shared pg.Pool instance — all models import from here
│   └── migrate.ts              # Inline SQL: uuid-ossp + all tables (CREATE IF NOT EXISTS)
├── middleware/
│   └── errorHandler.ts         # notFoundHandler (404) + errorHandler (500) — only shared middleware lives here
├── routes/                     # One pair per resource — see "Router pattern" below
│   ├── sites.ts                # mounted at /api/sites
│   ├── workers.ts              # mounted at /api/workers
│   ├── attendance.ts           # NESTED — mounted at /api/sites (handles /:siteId/attendance)
│   ├── attendanceStandalone.ts # STANDALONE — mounted at /api/attendance (handles /:id)
│   ├── materials.ts            # NESTED — mounted at /api/sites
│   ├── materialsStandalone.ts  # STANDALONE — mounted at /api/materials
│   ├── expenses.ts             # NESTED — mounted at /api/sites
│   ├── expensesStandalone.ts   # STANDALONE — mounted at /api/expenses
│   ├── reports.ts              # NESTED — mounted at /api/sites
│   └── reportsStandalone.ts    # STANDALONE — mounted at /api/reports
├── models/                     # One file per resource: sites, workers, attendance, materials, expenses, reports
└── types/index.ts              # Interfaces for all DB rows + request bodies
```

## App / Server separation (mandatory)
- `app.ts` builds the Express instance and `export default app` — **never** calls `.listen()`.
- `index.ts` imports `app`, calls `app.listen(PORT, ...)` — the only entrypoint that starts the server.
- Tests must import `app` from `./app`, not from `./index`. Importing `index` would start a real server on every test run.

## Router pattern (mandatory)
Resources that belong to a site (attendance, materials, expenses, reports) use **two** router files:
- `<resource>.ts` — handles **nested** routes like `GET /:siteId/<resource>`, mounted at `/api/sites`.
- `<resource>Standalone.ts` — handles **standalone** routes like `GET /:id`, `PUT /:id`, `DELETE /:id`, mounted at `/api/<resource>`.

Why split: mounting one router at two base paths causes Express param-name collisions (`:siteId` vs `:id` on the same router). Keep them in separate files.

When adding a new resource that belongs to a site, create **both** files and mount in `app.ts` in the existing order (standalone block before nested block — see `app.ts:23-31`).

## Database
- **Database name**: `construction_site` (created manually before `npm run migrate`).
- **Primary keys**: UUIDs via `uuid_generate_v4()` (uuid-ossp extension — created by migrate).
- **DECIMAL columns** (amounts, quantities): `pg` driver returns these as **strings**, not numbers. Type as `string` in `types/index.ts`; convert with `Number()` only when doing math; client also receives them as strings.
- **All queries through `db/pool.ts`** — never create a new `Pool` or `Client` in a model.
- **Parameterized queries only**: `pool.query('SELECT ... WHERE id = $1', [id])`. Never string-concatenate values into SQL (SQL injection).
- **Migration is idempotent**: `CREATE TABLE IF NOT EXISTS` only. Do not write destructive SQL.

## Validation
- Validate required fields on every POST and PUT **before** hitting the DB.
- Return `res.status(400).json({ error: '<clear message>' })` with a human-readable reason (e.g., `'name is required'`).
- Validate types and ranges (e.g., quantity must be positive number) — pg will not catch business-rule errors for you.
- Never trust the client (no auth in MVP means every request is anonymous — still validate).

## Error handling
- Centralized in `middleware/errorHandler.ts`.
- Every error response shape: `{ error: string }`. No other keys. (If you add `details`, update this rule and the handler together.)
- `notFoundHandler` returns 404 for unmatched routes.
- `errorHandler` returns 500 for thrown errors. It logs `err.stack` to stderr.
- In routes: `throw` or `next(err)` for unexpected errors; `return res.status(4xx).json({error})` for expected user errors.

## Environment
- All env vars are optional with sane defaults (see `db/pool.ts`, `index.ts`). Keys: `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
- Provide `.env.example` for onboarding. <!-- DECIDE: .env.example not yet committed — add it -->
- Never commit `.env`, `dist/`, or `node_modules/`.
- Use `dotenv` only if/when env loading from `.env` is required. <!-- DECIDE: not installed; defaults work — add only when DB creds differ from defaults -->

## Code conventions
- **TypeScript strict mode is ON** (`strict: true`). No `any` without a `// reason: ...` comment.
- **Imports**: relative paths only — no path aliases configured. Order: node built-ins → external libs → `db/` → `models/` → `routes/` → `middleware/` → `types`.
- **Naming**: camelCase files for routes/models/middleware (`siteService.ts`, `errorHandler.ts`); PascalCase only for types/interfaces inside files.
- **Async**: use `async/await` consistently — no raw `.then()` chains. Wrap route handlers so thrown errors reach `errorHandler`.
- **HTTP status codes**: 200 OK, 201 Created (POST that creates), 204 No Content (DELETE), 400 Bad Request (validation), 404 Not Found, 500 Internal.
- **No extra middleware files** unless shared across 3+ routes — keep route-specific logic in the route file.

## Testing (planned — not yet set up)
Per project rules, when tests are added:
- **Vitest + Supertest**. Add `vitest`, `supertest`, `@types/supertest` to `devDependencies` in one go — not piecemeal.
- Add `vitest.config.ts` in `server/` root.
- Each test file: `setupTestDb()` before all, `cleanTestDb()` before each, `teardownTestDb()` after all.
- Import `app` from `./app` (never `./index`).
- Test against a real Postgres DB (test schema), not mocks — pg behavior diverges from mocks.

## Always do
- Run `npm run build` before saying a feature is done — catches TS errors `tsx watch` skips.
- Add the model file AND the route file(s) AND the migrate.ts table together when adding a resource.
- Validate every POST/PUT body before hitting the DB.
- Use parameterized queries (`$1, $2, ...`) for every value.
- Mount new routers in `app.ts` (not `index.ts`).
- Return `{ error: string }` on every error path.

## Never do
- Do not call `app.listen()` outside `index.ts`.
- Do not mount the same router at two different base paths — split into nested/standalone pair instead.
- Do not string-concatenate or template-literal user input into SQL.
- Do not return DB error messages directly to clients (leaks schema/internals) — log them, return a generic message.
- Do not create a new `Pool` or `Client` outside `db/pool.ts`.
- Do not import from `./index` in any file — only `index.ts` runs the server.
- Do not skip validation because "the client checks it" — the client is untrusted.

<!--
Open decisions to confirm with the team:
1. Testing setup — install vitest + supertest + @types/supertest, add vitest.config.ts, write first test
2. .env.example — commit a template file
3. dotenv — install only if env loading from .env file is needed
4. Lint — add eslint + prettier or skip for MVP
5. Request logging — add morgan or skip for MVP
These notes are HTML comments — stripped from Claude's context per docs, visible when you open the file.
-->
