# Project: Construction Site Management MVP

A full-stack web app for small Indian builders and contractors to replace WhatsApp + Excel workflows. Tracks sites, workers, attendance, materials, expenses, and daily reports.

**Target users:** Indian site supervisors and contractors using mobile browsers on-site (dusty hands, small screens, intermittent connectivity).

## Architecture
Two independent packages under `construction-site/`:
- `client/` — React 18 + Vite (port 5173). See @construction-site/client/CLAUDE.md.
- `server/` — Express + node-postgres (port 3000). See @construction-site/server/CLAUDE.md.
- Database: PostgreSQL `construction_site`.
- **No auth for MVP** — every request is anonymous; the server still validates input.

Specs (read before generating code):
- @docs/frontend.md — pages, components, services
- @docs/backend.md — endpoints, tables, error shape

## Mindset (applies everywhere)

**Think first.** Every file must have a clear reason to exist. Before creating one, check whether the spec demands it. No premature abstraction, no utilities "just in case."

**Generate from spec.** One file per requirement, not one per idea. Every route maps to a spec endpoint; every page maps to a spec screen; every service maps to a resource. If `docs/frontend.md` lists 7 pages, generate exactly 7 — no more, no less. Cross-check against the spec before adding a new file.

**Don't duplicate logic.** Search the codebase before adding a helper, type, or component. Reuse what exists.

**Match surrounding code.** Naming, structure, comment style, error handling — mirror what's already there.

## Design philosophy (Indian construction market)

- Design for contractors who today use WhatsApp groups and Excel sheets — keep flows simple, labels plain English, no jargon.
- **Mobile-first, always.** Most users will hit this on a phone, not a laptop. Large tap targets, single-column layouts on small screens, sidebar collapses on `<md`.
- **Currency is ₹** with Indian locale grouping (`Intl.NumberFormat('en-IN')`). Never display money as a plain number.
- **Construction-themed palette** — amber/orange for actions (`amber-600`), gray-900 sidebar, warm neutrals. Confirm with the user before introducing any new color.
- **Accessibility basics**: labels, keyboard nav, color + text together (not color alone) for status.

## Cross-cutting always-do

- Read the relevant spec (`docs/frontend.md` or `docs/backend.md`) before writing new code.
- Read the package-level CLAUDE.md (`client/CLAUDE.md` or `server/CLAUDE.md`) when working inside that package — it has the concrete rules.
- Run the package's `npm run build` before claiming a feature is done — both packages use it as the verification command.
- Work on a branch, one clean commit per logical change.
- Validate at boundaries (form submits on client; POST/PUT bodies on server).
- Keep secrets in `.env`, never in code.

## Cross-cutting never-do

- Do not introduce auth, role-based access, or login flows — out of scope for MVP.
- Do not add new top-level dependencies without checking what's already installed; the stack is intentionally small.
- Do not commit `.env`, `dist/`, `build/`, or `node_modules/`.
- Do not change the API contract (`/api/...` endpoint shapes in `docs/backend.md`) without updating both the spec and the client service.
- Do not pick colors, copy, or UX patterns without confirming — see "Design philosophy" above.

## Where to look for what

| Question | File |
|---|---|
| What's the product / who's it for? | This file |
| Frontend rules (React, Tailwind, routes) | `construction-site/client/CLAUDE.md` |
| Backend rules (Express, pg, routes) | `construction-site/server/CLAUDE.md` |
| Monorepo layout, quick start | `construction-site/CLAUDE.md` |
| What pages/components to build | `docs/frontend.md` |
| What endpoints/tables to build | `docs/backend.md` |
