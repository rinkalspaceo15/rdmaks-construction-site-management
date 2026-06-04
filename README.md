# Construction Site Management

A full-stack web app for small Indian builders and contractors to replace WhatsApp + Excel workflows. Tracks sites, workers, attendance, materials, expenses, and daily reports.

- **App code:** [`construction-site/`](construction-site/) — `client/` (React + Vite) and `server/` (Express + Postgres). See `construction-site/CLAUDE.md` for quick start.
- **Product specs:** [`docs/frontend.md`](docs/frontend.md), [`docs/backend.md`](docs/backend.md)
- **Feature roadmap:** [`docs/roadmap/`](docs/roadmap/) — master plan + one doc per planned feature.

---

## Branching Strategy

We use an environment-promotion model. Code flows **upward** from feature branches to production:

```
feature/<name>  →  development  →  QA  →  staging  →  main
```

| Branch | Purpose | Who merges in | Deploys to |
|---|---|---|---|
| **`main`** | Production. Always stable, release-tagged. | staging only | Production |
| **`staging`** | Pre-production rehearsal. Final sign-off before release. | QA only | Staging env |
| **`QA`** | Testing / QA verification of integrated features. | development only | QA env |
| **`development`** | Integration branch. All features land here first. | feature/* branches | Dev env |
| **`feature/<name>`** | One branch per feature/task. Branched **off `development`**. | — | local / preview |

### Rules
- **Never commit directly to `main`, `staging`, `QA`, or `development`.** Open a PR.
- **Feature branches branch off `development`** and merge back into `development` via PR.
- **Promotion is one step at a time:** `development → QA → staging → main`. Don't skip levels.
- **Naming:** `feature/<short-kebab-name>` (e.g. `feature/phase1-client`, `feature/payroll-api`). Use `fix/<name>` for bug fixes, `chore/<name>` for tooling/docs.
- **One clean commit per logical change**, message format `type(scope): what changed` (e.g. `feat(payroll): add wage computation route`).
- Hotfixes to production branch off `main` as `fix/<name>`, then merge to `main` **and** back down to `development`.

### Current feature branches (Phase 1)
Per the roadmap (`docs/roadmap/`), Phase 1 is split by package:

| Branch | Scope | Roadmap docs |
|---|---|---|
| `feature/phase1-client` | Landing redesign, vernacular i18n, payroll UI | 01, 03, (02 client) |
| `feature/phase1-server` | Payroll API (model + route) | 02 (server) |

---

## Quick Start

See [`construction-site/CLAUDE.md`](construction-site/CLAUDE.md) for full setup. In short:

```bash
createdb construction_site
cd construction-site/server && npm install && npm run migrate && npm run dev   # :3000
cd construction-site/client && npm install && npm run dev                       # :5173
```
