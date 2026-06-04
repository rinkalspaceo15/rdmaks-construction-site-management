# Construction Site Management — Monorepo Root

Two independent Node packages, each with its own `package.json` and CLAUDE.md.

## Structure
```
construction-site/
├── client/             # React frontend — see client/CLAUDE.md
├── server/             # Express + Postgres backend — see server/CLAUDE.md
└── REQUIREMENTS.md     # Full project requirements + success criteria

../docs/                # Spec files live ONE LEVEL UP, not inside construction-site/
├── frontend.md         # Frontend spec (pages, components, services)
└── backend.md          # Backend spec (endpoints, tables, error handling)
```

Specs (read before adding pages, routes, or tables):
- @../docs/frontend.md
- @../docs/backend.md

## Quick start

```bash
# 1. Database — create the Postgres database once
createdb construction_site

# 2. Backend — port 3000
cd server
npm install
npm run migrate    # creates uuid-ossp + all tables (idempotent)
npm run dev        # tsx watch, hot reload

# 3. Frontend — port 5173 (separate terminal)
cd client
npm install
npm run dev        # Vite, proxies /api → localhost:3000
```

Each package has its own CLAUDE.md — follow it when working inside that folder:
- `client/CLAUDE.md` — frontend rules
- `server/CLAUDE.md` — backend rules

## Cross-package contracts

These are the contracts both sides must respect. Changing one requires changing both.

- **API base**: client calls `/api/...`; Vite dev server proxies to `http://localhost:3000`. Production hosting must preserve this path prefix.
- **DECIMAL columns** (amounts, quantities): pg driver returns these as **strings** — `types/index.ts` on both sides must type them as `string`, not `number`. Convert with `Number()` only when doing math.
- **UUIDs**: every primary key is a UUID string. Never treat IDs as integers.
- **Error shape**: server always returns `{ error: string }` on 4xx/5xx. Client error handlers should read `response.data.error`.
- **No auth**: no Authorization headers, no cookies, no session middleware. Every request is anonymous.
- **Date format**: ISO 8601 strings over the wire (`YYYY-MM-DD` for date-only fields, full ISO for timestamps).

## Project root files

| File | Purpose |
|---|---|
| `REQUIREMENTS.md` | Source of truth for scope and success criteria |
| `../docs/frontend.md` | Frontend spec — read before generating UI |
| `../docs/backend.md` | Backend spec — read before generating routes/tables |
| `client/CLAUDE.md` | Frontend rules (Tailwind, routes, conventions) |
| `server/CLAUDE.md` | Backend rules (Express, pg, validation, errors) |
