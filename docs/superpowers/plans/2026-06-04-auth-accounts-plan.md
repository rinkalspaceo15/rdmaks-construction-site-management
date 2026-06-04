# Auth & Accounts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **STATUS: NOT FOR BUILD YET.** Documented 2026-06-04 to manage Phase 2 later. Build on a `feature/auth` branch off `development`. Source of truth: [`../specs/2026-06-04-auth-accounts-design.md`](../specs/2026-06-04-auth-accounts-design.md).

**Goal:** Add JWT-based accounts with owner/supervisor roles and strict per-account data isolation across the existing Construction Site Management API and client.

**Architecture:** Stateless JWT (`Authorization: Bearer`). `accounts` own data; `users` belong to one account with a role. `requireAuth` middleware scopes every `/api/*` route by `account_id`; `sites`/`workers` carry `account_id`, child tables scope via a `site_id → sites` join. React `AuthContext` + `ProtectedRoute` on the client.

**Tech Stack:** Express + TypeScript + node-postgres; new: `bcrypt`, `jsonwebtoken`, `vitest`, `supertest`. Client: React + Axios + Context.

---

## File Structure

**Server (create):**
- `server/src/db/pool.ts` — add `JWT_SECRET` usage stays in auth util (no change to pool)
- `server/src/models/auth.ts` — account+user queries, password hashing
- `server/src/models/members.ts` — list/create/delete users in an account
- `server/src/middleware/auth.ts` — `requireAuth`, `requireOwner`, JWT sign/verify
- `server/src/routes/auth.ts` — `/api/auth/*`
- `server/src/routes/members.ts` — `/api/members`
- `server/vitest.config.ts`, `server/src/__tests__/*.test.ts`

**Server (modify):** `db/migrate.ts` (tables + columns + backfill), `app.ts` (mount auth/members, apply `requireAuth`), every `models/*.ts` and route to add account scoping, `types/index.ts` (Account, User, AuthedRequest).

**Client (create):** `src/context/AuthContext.tsx`, `src/services/authService.ts`, `src/pages/Login.tsx`, `src/pages/Signup.tsx`, `src/pages/Team.tsx`, `src/components/ProtectedRoute.tsx`.

**Client (modify):** `services/api.ts` (Bearer + 401 interceptor), `App.tsx` (auth routes + ProtectedRoute), `main.tsx` (AuthProvider), `Sidebar.tsx` (user + logout + Team link), `i18n/en.json` + `hi.json` (auth strings).

**Docs (modify):** root/client/server `CLAUDE.md`, `docs/backend.md`, `docs/frontend.md`.

---

## Task 1: Dependencies + env

**Files:** Modify `server/package.json`, create `server/.env.example`

- [ ] **Step 1: Install deps**
```bash
cd construction-site/server
npm i bcrypt jsonwebtoken && npm i -D @types/bcrypt @types/jsonwebtoken vitest supertest @types/supertest
```
- [ ] **Step 2: Add JWT_SECRET to `.env.example`**
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=construction_site
DB_USER=sotsys337
DB_PASSWORD=
JWT_SECRET=change-me-in-production
```
- [ ] **Step 3: Add test script to `package.json`** → `"test": "vitest run"`
- [ ] **Step 4: Commit** — `chore(server): add auth + test dependencies`

---

## Task 2: Migration — accounts, users, account_id columns, backfill

**Files:** Modify `server/src/db/migrate.ts`

- [ ] **Step 1: Append tables + columns to the `migration` SQL string** (idempotent)
```sql
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'supervisor' CHECK (role IN ('owner','supervisor')),
  created_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE sites   ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id);
```
- [ ] **Step 2: Add a backfill block after the migration query runs** in `runMigration()` — create a default account+owner if any account-less rows exist, then backfill:
```ts
const { rows } = await pool.query(
  `SELECT count(*)::int AS n FROM sites WHERE account_id IS NULL`
);
if (rows[0].n > 0) {
  const acct = await pool.query(
    `INSERT INTO accounts (name) VALUES ('Default Account') RETURNING id`
  );
  const accountId = acct.rows[0].id;
  // password hash for 'changeme' — replace post-migration
  await pool.query(
    `INSERT INTO users (account_id, name, email, password_hash, role)
     VALUES ($1,'Default Owner','owner@example.com',$2,'owner')
     ON CONFLICT (email) DO NOTHING`,
    [accountId, '$2b$10$REPLACE_WITH_REAL_BCRYPT_HASH']
  );
  await pool.query(`UPDATE sites   SET account_id=$1 WHERE account_id IS NULL`, [accountId]);
  await pool.query(`UPDATE workers SET account_id=$1 WHERE account_id IS NULL`, [accountId]);
}
```
  *(Generate the real bcrypt hash with `node -e "console.log(require('bcrypt').hashSync('changeme',10))"` and paste it.)*
- [ ] **Step 3: Run** `npm run migrate` — Expected: "Migration completed successfully", `\d users` shows the table, existing sites have `account_id` set.
- [ ] **Step 4: Commit** — `feat(db): accounts/users tables + account_id columns + backfill`

---

## Task 3: Types

**Files:** Modify `server/src/types/index.ts`

- [ ] **Step 1: Add interfaces**
```ts
export interface Account { id: string; name: string; created_at: string; }
export interface User {
  id: string; account_id: string; name: string; email: string;
  role: 'owner' | 'supervisor'; created_at: string;
}
export interface JwtPayload { user_id: string; account_id: string; role: 'owner' | 'supervisor'; }
```
- [ ] **Step 2: Commit** — `feat(types): account/user/jwt types`

---

## Task 4: Auth middleware (JWT sign/verify, requireAuth, requireOwner)

**Files:** Create `server/src/middleware/auth.ts`; Test `server/src/__tests__/middleware.test.ts`

- [ ] **Step 1: Write failing test** for `signToken`/`verifyToken` round-trip
```ts
import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../middleware/auth';
describe('jwt', () => {
  it('round-trips a payload', () => {
    const t = signToken({ user_id: 'u1', account_id: 'a1', role: 'owner' });
    expect(verifyToken(t)).toMatchObject({ user_id: 'u1', account_id: 'a1', role: 'owner' });
  });
  it('rejects a bad token', () => {
    expect(() => verifyToken('garbage')).toThrow();
  });
});
```
- [ ] **Step 2: Run** `npm test -- middleware` → FAIL (module not found)
- [ ] **Step 3: Implement `middleware/auth.ts`**
```ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}

export interface AuthedRequest extends Request {
  accountId?: string; userId?: string; role?: 'owner' | 'supervisor';
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
  try {
    const p = verifyToken(header.slice(7));
    req.userId = p.user_id; req.accountId = p.account_id; req.role = p.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
export function requireOwner(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.role !== 'owner') return res.status(403).json({ error: 'Owner access required' });
  next();
}
```
- [ ] **Step 4: Run** `npm test -- middleware` → PASS
- [ ] **Step 5: Commit** — `feat(auth): jwt util + requireAuth/requireOwner middleware`

---

## Task 5: Auth model

**Files:** Create `server/src/models/auth.ts`

- [ ] **Step 1: Implement** (no separate unit test; covered by route tests in Task 11)
```ts
import bcrypt from 'bcrypt';
import pool from '../db/pool';

export async function createAccountWithOwner(businessName: string, name: string, email: string, password: string) {
  const hash = await bcrypt.hash(password, 10);
  const acct = await pool.query(`INSERT INTO accounts (name) VALUES ($1) RETURNING *`, [businessName]);
  const accountId = acct.rows[0].id;
  const user = await pool.query(
    `INSERT INTO users (account_id, name, email, password_hash, role)
     VALUES ($1,$2,$3,$4,'owner') RETURNING id, account_id, name, email, role, created_at`,
    [accountId, name, email, hash]
  );
  return { account: acct.rows[0], user: user.rows[0] };
}

export async function findUserByEmail(email: string) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return rows[0] ?? null;
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function getAccount(id: string) {
  const { rows } = await pool.query(`SELECT * FROM accounts WHERE id = $1`, [id]);
  return rows[0] ?? null;
}
```
- [ ] **Step 2: Commit** — `feat(auth): account/user model with bcrypt`

---

## Task 6: Auth routes

**Files:** Create `server/src/routes/auth.ts`; mount in `app.ts`

- [ ] **Step 1: Implement `routes/auth.ts`**
```ts
import { Router } from 'express';
import * as authModel from '../models/auth';
import { signToken, requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

router.post('/signup', async (req, res, next) => {
  try {
    const { name, businessName, email, password } = req.body;
    if (!businessName || !email || !password) return res.status(400).json({ error: 'businessName, email and password are required' });
    if (await authModel.findUserByEmail(email)) return res.status(400).json({ error: 'Email already registered' });
    const { account, user } = await authModel.createAccountWithOwner(businessName, name ?? '', email, password);
    const token = signToken({ user_id: user.id, account_id: account.id, role: 'owner' });
    res.status(201).json({ token, user });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
    const u = await authModel.findUserByEmail(email);
    if (!u || !(await authModel.verifyPassword(password, u.password_hash))) return res.status(401).json({ error: 'Invalid email or password' });
    const token = signToken({ user_id: u.id, account_id: u.account_id, role: u.role });
    res.json({ token, user: { id: u.id, account_id: u.account_id, name: u.name, email: u.email, role: u.role } });
  } catch (err) { next(err); }
});

router.get('/me', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const account = await authModel.getAccount(req.accountId!);
    res.json({ user: { id: req.userId, account_id: req.accountId, role: req.role }, account });
  } catch (err) { next(err); }
});

router.post('/logout', (_req, res) => res.status(204).end());

export default router;
```
- [ ] **Step 2: Mount in `app.ts`** — `app.use('/api/auth', authRouter);` **before** the `requireAuth` block (Task 8).
- [ ] **Step 3: Commit** — `feat(auth): /api/auth signup/login/me/logout`

---

## Task 7: Scope existing models by account

**Files:** Modify every `server/src/models/*.ts` + their routes

- [ ] **Step 1: Sites/workers** — add `accountId` param and `WHERE account_id = $n` to every SELECT/UPDATE/DELETE; set `account_id` on INSERT. Example `models/sites.ts` `getAll`:
```ts
export const getAll = (accountId: string) =>
  pool.query(`SELECT * FROM sites WHERE account_id = $1 ORDER BY created_at DESC`, [accountId]);
export const getById = (id: string, accountId: string) =>
  pool.query(`SELECT * FROM sites WHERE id = $1 AND account_id = $2`, [id, accountId]);
export const create = (data, accountId: string) =>
  pool.query(`INSERT INTO sites (name,address,status,start_date,account_id) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [data.name, data.address, data.status, data.start_date, accountId]);
```
- [ ] **Step 2: Child tables** (attendance/materials/expenses/reports/payroll) — scope by joining to `sites`, and on writes verify the parent site belongs to the account:
```ts
// example guard used in child routes before insert/update
export const siteBelongsToAccount = async (siteId: string, accountId: string) => {
  const { rows } = await pool.query(`SELECT 1 FROM sites WHERE id=$1 AND account_id=$2`, [siteId, accountId]);
  return rows.length > 0;
};
// example child read (materials)
export const getBySite = (siteId: string, accountId: string) =>
  pool.query(
    `SELECT m.* FROM materials m JOIN sites s ON m.site_id=s.id
     WHERE m.site_id=$1 AND s.account_id=$2 ORDER BY m.date DESC`, [siteId, accountId]);
```
- [ ] **Step 3: Routes** — read `req.accountId` (from `AuthedRequest`) and pass to every model call; return **404** when an `:id` lookup misses (don't leak existence). Standalone `:id` routes (materials/expenses/etc.) must join-check ownership too.
- [ ] **Step 4: Run** `npm run build` → Expected: PASS.
- [ ] **Step 5: Commit** — `feat(auth): scope all data access by account`

---

## Task 8: Apply requireAuth globally

**Files:** Modify `server/src/app.ts`

- [ ] **Step 1: Insert `requireAuth` after `/api/auth` mount, before resource routers**
```ts
import authRouter from './routes/auth';
import { requireAuth } from './middleware/auth';
// ...
app.use('/api/auth', authRouter);
app.use('/api', requireAuth);          // everything below requires a token
app.use('/api/sites', sitesRouter);
// ...existing mounts unchanged...
```
- [ ] **Step 2: Run** `npm run build` → PASS
- [ ] **Step 3: Commit** — `feat(auth): require authentication on all /api routes`

---

## Task 9: Members routes (owner-only)

**Files:** Create `server/src/models/members.ts`, `server/src/routes/members.ts`; mount in `app.ts`

- [ ] **Step 1: Implement model** — `listByAccount(accountId)`, `createMember(accountId, {name,email,role,password})` (bcrypt hash), `deleteMember(id, accountId)`.
- [ ] **Step 2: Implement routes** with `requireAuth` + `requireOwner`:
```ts
router.get('/', requireAuth, requireOwner, /* list */);
router.post('/', requireAuth, requireOwner, /* create — reject duplicate email 400 */);
router.delete('/:id', requireAuth, requireOwner, /* delete, not self */);
```
- [ ] **Step 3: Mount** `app.use('/api/members', membersRouter);`
- [ ] **Step 4: Commit** — `feat(auth): owner-only member management`

---

## Task 10: App/server test harness + cross-account isolation test

**Files:** Create `server/vitest.config.ts`, `server/src/__tests__/auth.test.ts`

- [ ] **Step 1: vitest.config.ts** (node env, single fork so the shared DB isn't raced).
- [ ] **Step 2: Write the isolation test** (import `app` from `./app`, never `./index`):
```ts
// signup A and B; create a site as A; assert B gets 404 on A's site (read/update/delete)
// assert unauthenticated request -> 401; supervisor delete -> 403; bad login -> 401
```
- [ ] **Step 3: Run** `npm test` → PASS (all auth + isolation cases green).
- [ ] **Step 4: Commit** — `test(auth): cross-account isolation + auth flows`

---

## Task 11: Client — AuthContext + service + interceptor

**Files:** Create `client/src/context/AuthContext.tsx`, `client/src/services/authService.ts`; modify `client/src/services/api.ts`, `client/src/main.tsx`

- [ ] **Step 1: authService.ts** — `signup`, `login`, `me` calling `/api/auth/*`.
- [ ] **Step 2: AuthContext.tsx** — holds `{ token, user }`, `localStorage` key `sm_token`; `login/signup/logout`; on mount, if token present call `me()` to rehydrate (else clear).
- [ ] **Step 3: api.ts interceptors**
```ts
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('sm_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use((r) => r, (err) => {
  if (err.response?.status === 401) {
    localStorage.removeItem('sm_token');
    if (location.pathname.startsWith('/app') || location.pathname.startsWith('/sites') || location.pathname.startsWith('/workers')) location.assign('/login');
  }
  return Promise.reject(err);
});
```
- [ ] **Step 4: Wrap `<App/>` in `<AuthProvider>` in main.tsx** (inside `<LanguageProvider>`).
- [ ] **Step 5: Run** `npm run build` → PASS. **Commit** — `feat(auth): client auth context + token interceptor`

---

## Task 12: Client — Login/Signup pages + ProtectedRoute + routes

**Files:** Create `client/src/pages/Login.tsx`, `Signup.tsx`, `client/src/components/ProtectedRoute.tsx`; modify `App.tsx`

- [ ] **Step 1: ProtectedRoute** — if no `user` in AuthContext, `<Navigate to="/login" />`; else render children.
- [ ] **Step 2: Login/Signup** — forms using the existing input styles; call `login`/`signup`; on success `navigate('/app')`; show inline error on failure. All strings via `t()`.
- [ ] **Step 3: App.tsx** — add public routes `/login`, `/signup` (no AppLayout); wrap the AppLayout routes block in `<ProtectedRoute>`.
- [ ] **Step 4: Run** `npm run build` → PASS. **Commit** — `feat(auth): login/signup pages + protected routes`

---

## Task 13: Client — Team page, role-gated UI, sidebar logout

**Files:** Create `client/src/pages/Team.tsx`, `client/src/services/memberService.ts`; modify `Sidebar.tsx`, `App.tsx`

- [ ] **Step 1: memberService** — `getMembers`, `createMember`, `deleteMember`.
- [ ] **Step 2: Team page** (owner-only; hide route/link for supervisors) — list members + add-member modal + delete.
- [ ] **Step 3: Sidebar** — show user name + account, a Logout button (calls `logout` → `/login`), and a Team link only when `role === 'owner'`.
- [ ] **Step 4: Role-gate delete buttons** — hide site/worker delete for supervisors (server still enforces 403).
- [ ] **Step 5: Run** `npm run build` → PASS. **Commit** — `feat(auth): team management + role-gated UI + logout`

---

## Task 14: i18n keys for auth UI

**Files:** Modify `client/src/i18n/en.json`, `hi.json`

- [ ] **Step 1:** Add `auth.*` keys (login/signup labels, errors, logout, team, member form) in both catalogs (Hindi draft — flag for native review).
- [ ] **Step 2: Commit** — `feat(i18n): auth UI strings (en + hi)`

---

## Task 15: Guardrail / spec + CLAUDE.md updates

**Files:** Modify root `CLAUDE.md`, `client/CLAUDE.md`, `server/CLAUDE.md`, `docs/backend.md`, `docs/frontend.md`

- [ ] **Step 1:** Remove every "no auth / anonymous" statement; document the `Authorization: Bearer` contract, `accounts`/`users` tables, `/api/auth` + `/api/members` endpoints, 401/403 errors, `requireAuth`/`requireOwner`, and per-account scoping. Update the cross-package "No auth" contract in `construction-site/CLAUDE.md`.
- [ ] **Step 2: Commit** — `docs: lift no-auth guardrail; document accounts + auth contract`

---

## Self-Review

- **Spec coverage:** data model (T2-3), roles (T4,T9,T13), auth flow (T4-6), members (T9), multi-tenancy (T7-8), client (T11-13), guardrail updates (T15), testing incl. cross-account isolation (T10), migration (T2). All spec §1-12 mapped. ✅
- **Placeholder scan:** the only intentional fill-in is the bcrypt hash in T2 (with the exact command to generate it) — acceptable, not a logic placeholder.
- **Type consistency:** `AuthedRequest.accountId`/`userId`/`role`, `JwtPayload {user_id,account_id,role}`, `signToken/verifyToken` used consistently across T4/T6/T7/T8. ✅

## Out of scope (per spec §12)
Email invites, password reset, OAuth/SSO, password-change UI, audit logs, >2 roles.
