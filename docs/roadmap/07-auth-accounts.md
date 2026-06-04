# Feature 07 — Auth: Signup / Login & Accounts

| | |
|---|---|
| **Phase** | 2 — the FIRST Phase-2 piece (gates the others) |
| **MVP-safe?** | ❌ No — **lifts the "No auth / no accounts" guardrail** (the single biggest MVP boundary) |
| **Effort** | Large (~1.5–2 weeks for a solid v1) |

## Goal
Give each builder/contractor their own account so they can **securely access their sites from anywhere**, invite their team, and have their data isolated from every other business — instead of today's "anyone with the app link can see everything."

## Why this is Phase 2's keystone
Three already-documented Phase-2/3 features **depend on auth** and cannot ship without it:
- **GST billing** ([`05-gst-billing-ledgers.md`](05-gst-billing-ledgers.md)) — invoices need a legal seller identity tied to an account.
- **Paid plans / pricing tiers** (README §3) — tiers can't be enforced without accounts.
- **Bill-photo capture** ([`04-bill-photo-capture.md`](04-bill-photo-capture.md)) — uploaded financial documents shouldn't be world-readable.

So auth is sequenced **first in Phase 2**. Build it before the rest.

## Market rationale
The current "share a URL" model is fine for a single supervisor but blocks the contractor persona the product targets (managing 3–10 sites, multiple supervisors). Every competitor (Powerplay, Onsite) is account-based with roles. "Access anywhere, securely" is table-stakes the moment more than one person touches the data.

## ⚠️ Guardrail this lifts + what it changes
Current rule (CLAUDE.md / specs): **"No auth, no role-based access, no login flows."** Building this means:
- Adding a real identity layer (sessions or JWT), password hashing, and auth middleware on **every** API route.
- **Multi-tenancy**: every existing table (`sites`, `workers`, `attendance`, …) needs an owning account/org, and every query must scope by it — server-side, never client-trusted. This is the largest change, touching all existing models.
- Client: login/signup screens, an auth context, protected routes, token storage, and logout.

## Scope (when built) — phased internally
1. **Single-user accounts first**: email + password signup/login, hashed passwords, session/JWT, all data scoped to the account. Smallest secure step.
2. **Team & roles second**: invite supervisors to an org; roles (owner / supervisor) gate who can edit vs view.
3. **Password reset / account recovery** (email) — needs an email provider.

## Data-model sketch
```
accounts (
  id UUID PK, name VARCHAR(255), email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW()
)
-- Multi-tenancy: add owner to every existing table, e.g.
ALTER TABLE sites    ADD COLUMN account_id UUID REFERENCES accounts(id);
ALTER TABLE workers  ADD COLUMN account_id UUID REFERENCES accounts(id);
-- (and attendance/materials/expenses/daily_reports, or scope via site ownership)

-- Phase 2.2 — team & roles
memberships ( id UUID PK, account_id UUID, user_id UUID, role VARCHAR(20)
  CHECK (role IN ('owner','supervisor')) )
```

## API sketch
```
POST /api/auth/signup   { name, email, password }            → 201 { token }
POST /api/auth/login    { email, password }                  → 200 { token }
POST /api/auth/logout                                        → 204
GET  /api/auth/me                                            → 200 { account }
```
- All existing `/api/...` routes gain an auth middleware: reject without a valid token (401), and **scope every query by the caller's account**.
- Client: `Authorization: Bearer <token>` on every request (today there are no auth headers by design — this reverses that cross-package contract).

## Dependencies (new — need sign-off)
- Backend: a hashing lib (`bcrypt`), a token lib (`jsonwebtoken`) or a session store. An email provider only for password reset (phase 2.3).
- Client: auth context + protected-route wrapper (no new lib needed — React Context, already the chosen pattern).

## Acceptance criteria (when built)
- [ ] `CLAUDE.md` + `docs/frontend.md` + `docs/backend.md` updated to remove the "no auth" rule and document the new `Authorization` contract + multi-tenancy.
- [ ] Passwords hashed (never stored or logged in plain text); secrets in `.env`.
- [ ] Every API route rejects unauthenticated requests and scopes data to the account **server-side** (verified with a cross-account access test).
- [ ] No existing data leaks across accounts after the migration.
- [ ] Client: unauthenticated users are redirected to login; token persists across reloads; logout clears it.
- [ ] `npm run build` passes on both packages.

## Open decisions
1. **Session vs JWT** — recommend JWT for a stateless API (simplest with the current Express setup); revisit if refresh-token complexity grows.
2. **Migration of existing data** — on launch, assign existing rows to a first account, or start fresh? Recommend: since it's pre-launch, start fresh (no production data to migrate).
3. **Single-user v1 vs team/roles immediately** — recommend ship single-user accounts first, add roles in 2.2.
4. Build auth as its **own feature branch** (`feature/auth`) off `development`, given how broadly it touches every route/model.
