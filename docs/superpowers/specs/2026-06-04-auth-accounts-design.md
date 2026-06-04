# Auth & Accounts — Design Spec (Phase 2)

> **Status:** Approved design. **Not for build now** — documented to manage the work later.
> **Date:** 2026-06-04
> **Companion docs:** roadmap summary [`docs/roadmap/07-auth-accounts.md`](../../roadmap/07-auth-accounts.md); implementation plan [`docs/superpowers/plans/2026-06-04-auth-accounts-plan.md`](../plans/2026-06-04-auth-accounts-plan.md).
> **Guardrail:** This LIFTS the MVP "no auth" rule — building it requires the spec/CLAUDE.md updates in §8.

## Decisions (locked 2026-06-04)
| Decision | Choice |
|---|---|
| Token strategy | **JWT (stateless)** — `Authorization: Bearer <jwt>`, no session store |
| v1 scope | **Teams + roles from the start** — accounts with multiple users, owner/supervisor roles |
| Existing data | **Migrate** — backfill current sites/workers onto a default account |
| Multi-tenancy | **`account_id` on sites + workers**; child tables scoped via `site_id → sites` join |

## 1. Goal
Each builder/contractor gets an account they can log into from anywhere; their team (supervisors) log in under the same account; all data is isolated per account. Unblocks GST billing, paid tiers, and safe file uploads.

## 2. Data model
```
accounts   ( id UUID PK, name VARCHAR(255), created_at TIMESTAMP DEFAULT NOW() )

users      ( id UUID PK,
             account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
             name VARCHAR(255),
             email VARCHAR(255) UNIQUE NOT NULL,
             password_hash TEXT NOT NULL,
             role VARCHAR(20) CHECK (role IN ('owner','supervisor')) DEFAULT 'supervisor',
             created_at TIMESTAMP DEFAULT NOW() )

ALTER TABLE sites   ADD COLUMN account_id UUID REFERENCES accounts(id);
ALTER TABLE workers ADD COLUMN account_id UUID REFERENCES accounts(id);
-- attendance / materials / expenses / daily_reports: unchanged;
-- scoped via their site_id → sites.account_id
```
- A **user** belongs to exactly one **account** (a supervisor works for one builder).
- The team = multiple users sharing one account.

## 3. Roles — permission boundary
| Action | owner | supervisor |
|---|---|---|
| View all account data | ✅ | ✅ |
| Create/edit sites, workers, attendance, materials, expenses, reports | ✅ | ✅ |
| **Delete** sites / workers | ✅ | ❌ |
| Manage members (add/remove users, change roles) | ✅ | ❌ |
| Edit account settings | ✅ | ❌ |

Enforced by a `requireOwner` guard on delete + member + account routes (server-side).

## 4. Auth flow (JWT)
```
POST /api/auth/signup  { name, businessName, email, password }
   → creates account + first OWNER user → 201 { token, user }
POST /api/auth/login   { email, password }            → 200 { token, user }
GET  /api/auth/me                                      → 200 { user, account }
POST /api/auth/logout                                  → 204   (client clears token)
```
- JWT payload: `{ user_id, account_id, role }`, signed with `JWT_SECRET` (env), reasonable expiry (e.g. 7d).
- Passwords hashed with `bcrypt`. Never stored or logged in plaintext.

## 5. Members (team management — owner only)
```
GET    /api/members                 → list users in the account
POST   /api/members { name, email, role, password }   → create a supervisor user
DELETE /api/members/:id             → remove a user (not self)
```
- **Invite approach (v1):** owner sets a temporary password; the member logs in and (later enhancement) changes it. **Email-based invite links are deferred** to avoid an email-provider dependency in v1.

## 6. Multi-tenancy enforcement (security core)
- `requireAuth` middleware on **every** `/api/*` route except `/api/auth/*`: verify JWT → attach `req.accountId`, `req.role`; reject missing/invalid token with **401**.
- Every model query is scoped:
  - `sites`, `workers`: `WHERE account_id = $accountId`.
  - `attendance`, `materials`, `expenses`, `daily_reports`: `JOIN sites ON site_id = sites.id WHERE sites.account_id = $accountId` (and verify the parent site belongs to the account on writes).
- **Never trust a client-supplied id without the scope check** — fetching/updating/deleting by `:id` must also confirm account ownership (404 if not owned, to avoid leaking existence).
- `requireOwner` guard on delete + member + account routes → **403** for supervisors.

## 7. Client
- `AuthContext` (React Context, existing state pattern) holds `{ token, user }`; persisted in `localStorage`; exposes `login`, `signup`, `logout`.
- New pages: `Login`, `Signup`, `Team` (owner-only member management).
- `ProtectedRoute` wrapper redirects unauthenticated users to `/login`; role-gated UI hides owner-only actions for supervisors.
- Axios interceptor: attach `Authorization: Bearer <token>`; on **401**, clear token + redirect to `/login`.
- Sidebar: show current user + account, a Logout action, and (owner) a Team link. All new strings go through the i18n `t()` system (en + hi).

## 8. Guardrail / spec updates (required when built)
- **Root `CLAUDE.md`**: remove "No auth for MVP"; document accounts + per-account scoping.
- **`client/CLAUDE.md`**: remove "no auth"; add AuthContext + ProtectedRoute + Bearer-token interceptor conventions.
- **`server/CLAUDE.md`**: replace "No auth (every request anonymous)" with the `requireAuth`/`requireOwner` contract and the scoping rule; update the cross-package "No auth" contract to "Authorization: Bearer required".
- **`docs/backend.md`**: add `accounts`/`users` tables, `/api/auth/*` + `/api/members` endpoints, 401/403 to the error section.
- **`docs/frontend.md`**: add Login/Signup/Team pages + auth service.

## 9. Testing
- Stand up the **Vitest + Supertest** harness the server `CLAUDE.md` already specifies.
- Non-negotiable test: **cross-account isolation** — a token for account A must get 404/403 on account B's sites/workers/children (read, update, delete).
- Plus: signup creates owner; login returns JWT; bad password → 401; supervisor delete → 403; unauthenticated → 401.

## 10. Migration (chosen: migrate existing rows)
- Idempotent: create the `accounts` + `users` tables; add `account_id` to sites/workers; if any account-less rows exist, create a **default account + default owner** and backfill them. Safe to re-run.

## 11. Build order (on `feature/auth` off `development`)
1. Migration + `accounts`/`users` tables + `account_id` columns.
2. `auth` model + `bcrypt`/`jsonwebtoken`; `/api/auth/*` routes; `requireAuth`/`requireOwner` middleware.
3. Scope **every** existing model/route by account; add ownership checks on `:id` routes.
4. `/api/members` routes (owner-only).
5. Client: AuthContext, Login/Signup, ProtectedRoute, axios interceptor, sidebar user/logout.
6. Team page + role-gated UI.
7. Vitest+Supertest, cross-account isolation test.
8. Spec/CLAUDE.md updates (§8).

## 12. Out of scope (v1)
Email invite links, password reset via email, SSO/OAuth, password-change UI (members keep temp password until a later enhancement), audit logs, more than two roles.

## Open items to confirm before build
- None blocking. Defaults chosen: supervisor cannot delete or manage members (§3); invites via temp password (§5). Revisit if the contractor workflow needs supervisors to delete.
