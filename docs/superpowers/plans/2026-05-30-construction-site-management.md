# Construction Site Management MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack construction site management MVP with daily reports, attendance, material tracking, and expense tracking.

**Architecture:** React frontend (Vite + Tailwind) communicating via REST API with an Express backend backed by PostgreSQL. Two independent folders — `client/` and `server/` — each with their own `package.json`. No auth for MVP.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, React Router v6, Axios, Express, pg (node-postgres), PostgreSQL

---

## File Structure

### Server (`server/`)

```
server/
├── src/
│   ├── index.ts                    # Express app entry point
│   ├── db/
│   │   ├── connection.ts           # PostgreSQL pool config
│   │   └── migrate.ts              # Run migrations on startup
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # All 6 tables
│   ├── routes/
│   │   ├── sites.ts                # /api/sites routes
│   │   ├── workers.ts              # /api/workers routes
│   │   ├── attendance.ts           # /api/sites/:siteId/attendance routes
│   │   ├── materials.ts            # /api/sites/:siteId/materials routes
│   │   ├── expenses.ts             # /api/sites/:siteId/expenses routes
│   │   └── reports.ts              # /api/sites/:siteId/reports routes
│   ├── models/
│   │   ├── sites.ts                # Sites DB queries
│   │   ├── workers.ts              # Workers DB queries
│   │   ├── attendance.ts           # Attendance DB queries
│   │   ├── materials.ts            # Materials DB queries
│   │   ├── expenses.ts             # Expenses DB queries
│   │   └── reports.ts              # Reports DB queries
│   ├── middleware/
│   │   └── errorHandler.ts         # Centralized error handler
│   └── types/
│       └── index.ts                # Shared TypeScript interfaces
├── tests/
│   ├── routes/
│   │   ├── sites.test.ts
│   │   ├── workers.test.ts
│   │   ├── attendance.test.ts
│   │   ├── materials.test.ts
│   │   ├── expenses.test.ts
│   │   └── reports.test.ts
│   └── setup.ts                    # Test DB setup/teardown
├── package.json
└── tsconfig.json
```

### Client (`client/`)

```
client/
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Router setup
│   ├── components/
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── PageHeader.tsx          # Title + action button
│   │   ├── DataTable.tsx           # Sortable table
│   │   ├── StatCard.tsx            # Dashboard metric card
│   │   ├── Modal.tsx               # Modal dialog
│   │   ├── StatusBadge.tsx         # Colored status badge
│   │   ├── EmptyState.tsx          # No data message
│   │   └── Toast.tsx               # Notification toast
│   ├── pages/
│   │   ├── Dashboard.tsx           # / — overview
│   │   ├── SitesList.tsx           # /sites — all sites
│   │   ├── SiteDetail.tsx          # /sites/:id — tabbed detail
│   │   ├── Attendance.tsx          # Attendance tab content
│   │   ├── Materials.tsx           # Materials tab content
│   │   ├── Expenses.tsx            # Expenses tab content
│   │   └── DailyReports.tsx        # Reports tab content
│   ├── services/
│   │   ├── api.ts                  # Axios instance + interceptor
│   │   ├── sites.ts                # Sites API calls
│   │   ├── workers.ts              # Workers API calls
│   │   ├── attendance.ts           # Attendance API calls
│   │   ├── materials.ts            # Materials API calls
│   │   ├── expenses.ts             # Expenses API calls
│   │   └── reports.ts              # Reports API calls
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   └── index.css                   # Tailwind imports
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Task 1: Server Project Setup

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/src/index.ts`
- Create: `server/src/middleware/errorHandler.ts`
- Create: `server/src/types/index.ts`

- [ ] **Step 1: Initialize server project**

```bash
cd /Users/sotsys337/LEarning
mkdir -p server/src/{db,routes,models,middleware,types,migrations} server/tests/routes
```

- [ ] **Step 2: Create package.json**

Create `server/package.json`:

```json
{
  "name": "construction-site-server",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.21.0",
    "pg": "^8.13.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/pg": "^8.11.10",
    "@types/uuid": "^10.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

Create `server/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 4: Create TypeScript interfaces**

Create `server/src/types/index.ts`:

```typescript
export interface Site {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'completed' | 'on_hold';
  start_date: string;
  created_at: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  phone: string;
  daily_wage: number;
  created_at: string;
}

export interface Attendance {
  id: string;
  site_id: string;
  worker_id: string;
  date: string;
  status: 'present' | 'absent' | 'half_day';
  overtime_hours: number;
}

export interface Material {
  id: string;
  site_id: string;
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vendor: string;
  date: string;
}

export interface Expense {
  id: string;
  site_id: string;
  category: 'material' | 'labor' | 'transport' | 'misc';
  description: string;
  amount: number;
  date: string;
}

export interface DailyReport {
  id: string;
  site_id: string;
  date: string;
  weather: 'sunny' | 'rainy' | 'cloudy';
  summary: string;
  issues: string;
  created_at: string;
}

export interface CreateSiteInput {
  name: string;
  address: string;
  status?: 'active' | 'completed' | 'on_hold';
  start_date: string;
}

export interface CreateWorkerInput {
  name: string;
  role: string;
  phone: string;
  daily_wage: number;
}

export interface CreateAttendanceInput {
  worker_id: string;
  date: string;
  status: 'present' | 'absent' | 'half_day';
  overtime_hours?: number;
}

export interface CreateMaterialInput {
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vendor: string;
  date: string;
}

export interface CreateExpenseInput {
  category: 'material' | 'labor' | 'transport' | 'misc';
  description: string;
  amount: number;
  date: string;
}

export interface CreateReportInput {
  date: string;
  weather: 'sunny' | 'rainy' | 'cloudy';
  summary: string;
  issues?: string;
}
```

- [ ] **Step 5: Create error handler middleware**

Create `server/src/middleware/errorHandler.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Route not found' });
}
```

- [ ] **Step 6: Create Express app entry point**

Create `server/src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { runMigrations } from './db/migrate';
import sitesRouter from './routes/sites';
import workersRouter from './routes/workers';
import attendanceRouter from './routes/attendance';
import materialsRouter from './routes/materials';
import expensesRouter from './routes/expenses';
import reportsRouter from './routes/reports';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sites', sitesRouter);
app.use('/api/workers', workersRouter);
app.use('/api/sites', attendanceRouter);
app.use('/api/sites', materialsRouter);
app.use('/api/sites', expensesRouter);
app.use('/api/sites', reportsRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await runMigrations();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);

export default app;
```

- [ ] **Step 7: Install dependencies and verify compilation**

```bash
cd /Users/sotsys337/LEarning/server
npm install
npx tsc --noEmit
```

Expected: Compilation errors for missing route/db files (expected at this stage — they'll be created in subsequent tasks).

- [ ] **Step 8: Commit**

```bash
git add server/
git commit -m "feat: scaffold server project with Express, types, and error handling"
```

---

## Task 2: Database Setup & Migrations

**Files:**
- Create: `server/src/db/connection.ts`
- Create: `server/src/db/migrate.ts`
- Create: `server/src/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create database connection pool**

Create `server/src/db/connection.ts`:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'construction_site',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

export default pool;
```

- [ ] **Step 2: Create migration SQL**

Create `server/src/migrations/001_initial_schema.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold')),
  start_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  daily_wage DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half_day')),
  overtime_hours DECIMAL(4,1) DEFAULT 0,
  UNIQUE(site_id, worker_id, date)
);

CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  vendor VARCHAR(255) NOT NULL,
  date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('material', 'labor', 'transport', 'misc')),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weather VARCHAR(20) NOT NULL CHECK (weather IN ('sunny', 'rainy', 'cloudy')),
  summary TEXT NOT NULL,
  issues TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(site_id, date)
);
```

- [ ] **Step 3: Create migration runner**

Create `server/src/db/migrate.ts`:

```typescript
import fs from 'fs';
import path from 'path';
import pool from './connection';

export async function runMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (file.endsWith('.sql')) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await pool.query(sql);
      console.log(`Migration applied: ${file}`);
    }
  }
}
```

- [ ] **Step 4: Create the PostgreSQL database**

```bash
createdb construction_site
```

If `createdb` is not available or errors, run:
```bash
psql -U postgres -c "CREATE DATABASE construction_site;"
```

- [ ] **Step 5: Test the migration runs**

```bash
cd /Users/sotsys337/LEarning/server
npx tsx src/db/migrate.ts
```

Expected: `Migration applied: 001_initial_schema.sql`

- [ ] **Step 6: Verify tables exist**

```bash
psql -d construction_site -c "\dt"
```

Expected: 6 tables listed (sites, workers, attendance, materials, expenses, daily_reports).

- [ ] **Step 7: Commit**

```bash
git add server/src/db/ server/src/migrations/
git commit -m "feat: add PostgreSQL connection and initial schema migration"
```

---

## Task 3: Sites Model & Routes

**Files:**
- Create: `server/src/models/sites.ts`
- Create: `server/src/routes/sites.ts`
- Create: `server/tests/setup.ts`
- Create: `server/tests/routes/sites.test.ts`

- [ ] **Step 1: Create test setup**

Create `server/tests/setup.ts`:

```typescript
import pool from '../src/db/connection';
import { runMigrations } from '../src/db/migrate';

export async function setupTestDb() {
  await runMigrations();
}

export async function cleanTestDb() {
  await pool.query('DELETE FROM daily_reports');
  await pool.query('DELETE FROM expenses');
  await pool.query('DELETE FROM materials');
  await pool.query('DELETE FROM attendance');
  await pool.query('DELETE FROM workers');
  await pool.query('DELETE FROM sites');
}

export async function teardownTestDb() {
  await pool.end();
}
```

- [ ] **Step 2: Write failing test for Sites API**

Create `server/tests/routes/sites.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { setupTestDb, cleanTestDb, teardownTestDb } from '../setup';

describe('Sites API', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  describe('POST /api/sites', () => {
    it('creates a new site', async () => {
      const res = await request(app)
        .post('/api/sites')
        .send({
          name: 'Test Site',
          address: '123 Main St',
          start_date: '2026-01-15',
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Test Site');
      expect(res.body.address).toBe('123 Main St');
      expect(res.body.status).toBe('active');
      expect(res.body.id).toBeDefined();
    });

    it('returns 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/sites')
        .send({ name: 'Test Site' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/sites', () => {
    it('returns all sites', async () => {
      await request(app).post('/api/sites').send({
        name: 'Site A',
        address: 'Address A',
        start_date: '2026-01-01',
      });
      await request(app).post('/api/sites').send({
        name: 'Site B',
        address: 'Address B',
        start_date: '2026-02-01',
      });

      const res = await request(app).get('/api/sites');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('GET /api/sites/:id', () => {
    it('returns a single site', async () => {
      const created = await request(app).post('/api/sites').send({
        name: 'Site A',
        address: 'Address A',
        start_date: '2026-01-01',
      });

      const res = await request(app).get(`/api/sites/${created.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Site A');
    });

    it('returns 404 for non-existent site', async () => {
      const res = await request(app).get('/api/sites/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/sites/:id', () => {
    it('updates a site', async () => {
      const created = await request(app).post('/api/sites').send({
        name: 'Site A',
        address: 'Address A',
        start_date: '2026-01-01',
      });

      const res = await request(app)
        .put(`/api/sites/${created.body.id}`)
        .send({ name: 'Updated Site', address: 'New Address', start_date: '2026-01-01', status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Site');
      expect(res.body.status).toBe('completed');
    });
  });

  describe('DELETE /api/sites/:id', () => {
    it('deletes a site', async () => {
      const created = await request(app).post('/api/sites').send({
        name: 'Site A',
        address: 'Address A',
        start_date: '2026-01-01',
      });

      const res = await request(app).delete(`/api/sites/${created.body.id}`);
      expect(res.status).toBe(204);

      const check = await request(app).get(`/api/sites/${created.body.id}`);
      expect(check.status).toBe(404);
    });
  });
});
```

- [ ] **Step 3: Install supertest**

```bash
cd /Users/sotsys337/LEarning/server
npm install -D supertest @types/supertest
```

- [ ] **Step 4: Run test to verify it fails**

```bash
cd /Users/sotsys337/LEarning/server
npx vitest run tests/routes/sites.test.ts
```

Expected: FAIL — routes not implemented yet.

- [ ] **Step 5: Create Sites model**

Create `server/src/models/sites.ts`:

```typescript
import pool from '../db/connection';
import { Site, CreateSiteInput } from '../types';

export async function getAllSites(): Promise<Site[]> {
  const result = await pool.query('SELECT * FROM sites ORDER BY created_at DESC');
  return result.rows;
}

export async function getSiteById(id: string): Promise<Site | null> {
  const result = await pool.query('SELECT * FROM sites WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createSite(input: CreateSiteInput): Promise<Site> {
  const { name, address, start_date, status } = input;
  const result = await pool.query(
    `INSERT INTO sites (name, address, start_date, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, address, start_date, status || 'active']
  );
  return result.rows[0];
}

export async function updateSite(id: string, input: CreateSiteInput & { status: string }): Promise<Site | null> {
  const { name, address, start_date, status } = input;
  const result = await pool.query(
    `UPDATE sites SET name = $1, address = $2, start_date = $3, status = $4
     WHERE id = $5 RETURNING *`,
    [name, address, start_date, status, id]
  );
  return result.rows[0] || null;
}

export async function deleteSite(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM sites WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
```

- [ ] **Step 6: Create Sites route**

Create `server/src/routes/sites.ts`:

```typescript
import { Router, Request, Response } from 'express';
import * as sitesModel from '../models/sites';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const sites = await sitesModel.getAllSites();
  res.json(sites);
});

router.get('/:id', async (req: Request, res: Response) => {
  const site = await sitesModel.getSiteById(req.params.id);
  if (!site) {
    return res.status(404).json({ error: 'Site not found' });
  }
  res.json(site);
});

router.post('/', async (req: Request, res: Response) => {
  const { name, address, start_date } = req.body;
  if (!name || !address || !start_date) {
    return res.status(400).json({ error: 'name, address, and start_date are required' });
  }
  const site = await sitesModel.createSite(req.body);
  res.status(201).json(site);
});

router.put('/:id', async (req: Request, res: Response) => {
  const site = await sitesModel.updateSite(req.params.id, req.body);
  if (!site) {
    return res.status(404).json({ error: 'Site not found' });
  }
  res.json(site);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const deleted = await sitesModel.deleteSite(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Site not found' });
  }
  res.status(204).send();
});

export default router;
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
cd /Users/sotsys337/LEarning/server
npx vitest run tests/routes/sites.test.ts
```

Expected: All 6 tests PASS.

- [ ] **Step 8: Commit**

```bash
git add server/src/models/sites.ts server/src/routes/sites.ts server/tests/
git commit -m "feat: add Sites CRUD API with tests"
```

---

## Task 4: Workers Model & Routes

**Files:**
- Create: `server/src/models/workers.ts`
- Create: `server/src/routes/workers.ts`
- Create: `server/tests/routes/workers.test.ts`

- [ ] **Step 1: Write failing test for Workers API**

Create `server/tests/routes/workers.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { setupTestDb, cleanTestDb, teardownTestDb } from '../setup';

describe('Workers API', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  describe('POST /api/workers', () => {
    it('creates a new worker', async () => {
      const res = await request(app)
        .post('/api/workers')
        .send({
          name: 'Rajesh Kumar',
          role: 'mason',
          phone: '9876543210',
          daily_wage: 800,
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Rajesh Kumar');
      expect(res.body.role).toBe('mason');
      expect(res.body.daily_wage).toBe('800.00');
    });

    it('returns 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/workers')
        .send({ name: 'Test' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/workers', () => {
    it('returns all workers', async () => {
      await request(app).post('/api/workers').send({
        name: 'Worker A', role: 'mason', phone: '1111111111', daily_wage: 700,
      });
      await request(app).post('/api/workers').send({
        name: 'Worker B', role: 'laborer', phone: '2222222222', daily_wage: 500,
      });

      const res = await request(app).get('/api/workers');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('PUT /api/workers/:id', () => {
    it('updates a worker', async () => {
      const created = await request(app).post('/api/workers').send({
        name: 'Worker A', role: 'mason', phone: '1111111111', daily_wage: 700,
      });

      const res = await request(app)
        .put(`/api/workers/${created.body.id}`)
        .send({ name: 'Updated Worker', role: 'electrician', phone: '1111111111', daily_wage: 900 });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Worker');
      expect(res.body.role).toBe('electrician');
    });
  });

  describe('DELETE /api/workers/:id', () => {
    it('deletes a worker', async () => {
      const created = await request(app).post('/api/workers').send({
        name: 'Worker A', role: 'mason', phone: '1111111111', daily_wage: 700,
      });

      const res = await request(app).delete(`/api/workers/${created.body.id}`);
      expect(res.status).toBe(204);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/sotsys337/LEarning/server
npx vitest run tests/routes/workers.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create Workers model**

Create `server/src/models/workers.ts`:

```typescript
import pool from '../db/connection';
import { Worker, CreateWorkerInput } from '../types';

export async function getAllWorkers(): Promise<Worker[]> {
  const result = await pool.query('SELECT * FROM workers ORDER BY created_at DESC');
  return result.rows;
}

export async function getWorkerById(id: string): Promise<Worker | null> {
  const result = await pool.query('SELECT * FROM workers WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createWorker(input: CreateWorkerInput): Promise<Worker> {
  const { name, role, phone, daily_wage } = input;
  const result = await pool.query(
    `INSERT INTO workers (name, role, phone, daily_wage)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, role, phone, daily_wage]
  );
  return result.rows[0];
}

export async function updateWorker(id: string, input: CreateWorkerInput): Promise<Worker | null> {
  const { name, role, phone, daily_wage } = input;
  const result = await pool.query(
    `UPDATE workers SET name = $1, role = $2, phone = $3, daily_wage = $4
     WHERE id = $5 RETURNING *`,
    [name, role, phone, daily_wage, id]
  );
  return result.rows[0] || null;
}

export async function deleteWorker(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM workers WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
```

- [ ] **Step 4: Create Workers route**

Create `server/src/routes/workers.ts`:

```typescript
import { Router, Request, Response } from 'express';
import * as workersModel from '../models/workers';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const workers = await workersModel.getAllWorkers();
  res.json(workers);
});

router.post('/', async (req: Request, res: Response) => {
  const { name, role, phone, daily_wage } = req.body;
  if (!name || !role || !phone || daily_wage === undefined) {
    return res.status(400).json({ error: 'name, role, phone, and daily_wage are required' });
  }
  const worker = await workersModel.createWorker(req.body);
  res.status(201).json(worker);
});

router.put('/:id', async (req: Request, res: Response) => {
  const worker = await workersModel.updateWorker(req.params.id, req.body);
  if (!worker) {
    return res.status(404).json({ error: 'Worker not found' });
  }
  res.json(worker);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const deleted = await workersModel.deleteWorker(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Worker not found' });
  }
  res.status(204).send();
});

export default router;
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /Users/sotsys337/LEarning/server
npx vitest run tests/routes/workers.test.ts
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add server/src/models/workers.ts server/src/routes/workers.ts server/tests/routes/workers.test.ts
git commit -m "feat: add Workers CRUD API with tests"
```

---

## Task 5: Attendance Model & Routes

**Files:**
- Create: `server/src/models/attendance.ts`
- Create: `server/src/routes/attendance.ts`
- Create: `server/tests/routes/attendance.test.ts`

- [ ] **Step 1: Write failing test for Attendance API**

Create `server/tests/routes/attendance.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { setupTestDb, cleanTestDb, teardownTestDb } from '../setup';

describe('Attendance API', () => {
  let siteId: string;
  let workerId: string;

  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanTestDb();
    const site = await request(app).post('/api/sites').send({
      name: 'Test Site', address: 'Test Address', start_date: '2026-01-01',
    });
    siteId = site.body.id;

    const worker = await request(app).post('/api/workers').send({
      name: 'Worker A', role: 'mason', phone: '1111111111', daily_wage: 700,
    });
    workerId = worker.body.id;
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  describe('POST /api/sites/:siteId/attendance', () => {
    it('marks attendance for multiple workers', async () => {
      const worker2 = await request(app).post('/api/workers').send({
        name: 'Worker B', role: 'laborer', phone: '2222222222', daily_wage: 500,
      });

      const res = await request(app)
        .post(`/api/sites/${siteId}/attendance`)
        .send({
          date: '2026-01-15',
          records: [
            { worker_id: workerId, status: 'present', overtime_hours: 2 },
            { worker_id: worker2.body.id, status: 'absent', overtime_hours: 0 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].status).toBe('present');
      expect(res.body[1].status).toBe('absent');
    });
  });

  describe('GET /api/sites/:siteId/attendance', () => {
    it('returns attendance for a date', async () => {
      await request(app)
        .post(`/api/sites/${siteId}/attendance`)
        .send({
          date: '2026-01-15',
          records: [{ worker_id: workerId, status: 'present', overtime_hours: 0 }],
        });

      const res = await request(app)
        .get(`/api/sites/${siteId}/attendance?date=2026-01-15`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].worker_id).toBe(workerId);
    });
  });

  describe('PUT /api/attendance/:id', () => {
    it('updates an attendance record', async () => {
      const created = await request(app)
        .post(`/api/sites/${siteId}/attendance`)
        .send({
          date: '2026-01-15',
          records: [{ worker_id: workerId, status: 'present', overtime_hours: 0 }],
        });

      const res = await request(app)
        .put(`/api/attendance/${created.body[0].id}`)
        .send({ status: 'half_day', overtime_hours: 1 });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('half_day');
      expect(res.body.overtime_hours).toBe('1.0');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/sotsys337/LEarning/server
npx vitest run tests/routes/attendance.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create Attendance model**

Create `server/src/models/attendance.ts`:

```typescript
import pool from '../db/connection';
import { Attendance, CreateAttendanceInput } from '../types';

export async function getAttendanceBySiteAndDate(siteId: string, date: string): Promise<Attendance[]> {
  const result = await pool.query(
    `SELECT a.*, w.name as worker_name, w.role as worker_role
     FROM attendance a
     JOIN workers w ON a.worker_id = w.id
     WHERE a.site_id = $1 AND a.date = $2
     ORDER BY w.name`,
    [siteId, date]
  );
  return result.rows;
}

export async function markAttendanceBulk(
  siteId: string,
  date: string,
  records: CreateAttendanceInput[]
): Promise<Attendance[]> {
  const results: Attendance[] = [];
  for (const record of records) {
    const result = await pool.query(
      `INSERT INTO attendance (site_id, worker_id, date, status, overtime_hours)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (site_id, worker_id, date)
       DO UPDATE SET status = $4, overtime_hours = $5
       RETURNING *`,
      [siteId, record.worker_id, date, record.status, record.overtime_hours || 0]
    );
    results.push(result.rows[0]);
  }
  return results;
}

export async function updateAttendance(
  id: string,
  status: string,
  overtimeHours: number
): Promise<Attendance | null> {
  const result = await pool.query(
    `UPDATE attendance SET status = $1, overtime_hours = $2
     WHERE id = $3 RETURNING *`,
    [status, overtimeHours, id]
  );
  return result.rows[0] || null;
}
```

- [ ] **Step 4: Create Attendance route**

Create `server/src/routes/attendance.ts`:

```typescript
import { Router, Request, Response } from 'express';
import * as attendanceModel from '../models/attendance';

const router = Router();

router.get('/:siteId/attendance', async (req: Request, res: Response) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'date query parameter is required' });
  }
  const records = await attendanceModel.getAttendanceBySiteAndDate(
    req.params.siteId,
    date as string
  );
  res.json(records);
});

router.post('/:siteId/attendance', async (req: Request, res: Response) => {
  const { date, records } = req.body;
  if (!date || !records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'date and records array are required' });
  }
  const result = await attendanceModel.markAttendanceBulk(
    req.params.siteId,
    date,
    records
  );
  res.status(201).json(result);
});

// Note: this route is mounted at /api/sites but we need /api/attendance/:id
// We'll handle this by also mounting a separate route in index.ts
router.put('/:id', async (req: Request, res: Response) => {
  const { status, overtime_hours } = req.body;
  const record = await attendanceModel.updateAttendance(
    req.params.id,
    status,
    overtime_hours || 0
  );
  if (!record) {
    return res.status(404).json({ error: 'Attendance record not found' });
  }
  res.json(record);
});

export default router;
```

- [ ] **Step 5: Update index.ts to mount attendance update route**

In `server/src/index.ts`, add after the existing attendance mount:

```typescript
import attendanceUpdateRouter from './routes/attendance';
// Add this line after existing routes:
app.use('/api/attendance', attendanceUpdateRouter);
```

Wait — this creates a conflict. Instead, create a separate mini-router. Update `server/src/index.ts` routes section to:

```typescript
// Routes
app.use('/api/sites', sitesRouter);
app.use('/api/workers', workersRouter);
app.use('/api/sites', attendanceRouter);
app.use('/api/attendance', attendanceRouter); // for PUT /api/attendance/:id
app.use('/api/sites', materialsRouter);
app.use('/api/materials', materialsRouter); // for PUT/DELETE /api/materials/:id
app.use('/api/sites', expensesRouter);
app.use('/api/expenses', expensesRouter); // for PUT/DELETE /api/expenses/:id
app.use('/api/sites', reportsRouter);
app.use('/api/reports', reportsRouter); // for PUT /api/reports/:id
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd /Users/sotsys337/LEarning/server
npx vitest run tests/routes/attendance.test.ts
```

Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add server/src/models/attendance.ts server/src/routes/attendance.ts server/src/index.ts server/tests/routes/attendance.test.ts
git commit -m "feat: add Attendance bulk-mark and query API with tests"
```

---

## Task 6: Materials Model & Routes

**Files:**
- Create: `server/src/models/materials.ts`
- Create: `server/src/routes/materials.ts`
- Create: `server/tests/routes/materials.test.ts`

- [ ] **Step 1: Write failing test for Materials API**

Create `server/tests/routes/materials.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { setupTestDb, cleanTestDb, teardownTestDb } from '../setup';

describe('Materials API', () => {
  let siteId: string;

  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanTestDb();
    const site = await request(app).post('/api/sites').send({
      name: 'Test Site', address: 'Test Address', start_date: '2026-01-01',
    });
    siteId = site.body.id;
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  describe('POST /api/sites/:siteId/materials', () => {
    it('adds a material entry', async () => {
      const res = await request(app)
        .post(`/api/sites/${siteId}/materials`)
        .send({
          name: 'Cement',
          quantity: 50,
          unit: 'bags',
          unit_price: 350,
          vendor: 'ABC Supplies',
          date: '2026-01-15',
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Cement');
      expect(res.body.quantity).toBe('50.00');
      expect(res.body.site_id).toBe(siteId);
    });
  });

  describe('GET /api/sites/:siteId/materials', () => {
    it('lists materials for a site', async () => {
      await request(app).post(`/api/sites/${siteId}/materials`).send({
        name: 'Cement', quantity: 50, unit: 'bags', unit_price: 350, vendor: 'ABC', date: '2026-01-15',
      });
      await request(app).post(`/api/sites/${siteId}/materials`).send({
        name: 'Steel', quantity: 100, unit: 'kg', unit_price: 80, vendor: 'XYZ', date: '2026-01-16',
      });

      const res = await request(app).get(`/api/sites/${siteId}/materials`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('PUT /api/materials/:id', () => {
    it('updates a material entry', async () => {
      const created = await request(app).post(`/api/sites/${siteId}/materials`).send({
        name: 'Cement', quantity: 50, unit: 'bags', unit_price: 350, vendor: 'ABC', date: '2026-01-15',
      });

      const res = await request(app)
        .put(`/api/materials/${created.body.id}`)
        .send({ name: 'Cement', quantity: 100, unit: 'bags', unit_price: 360, vendor: 'ABC', date: '2026-01-15' });

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe('100.00');
    });
  });

  describe('DELETE /api/materials/:id', () => {
    it('deletes a material entry', async () => {
      const created = await request(app).post(`/api/sites/${siteId}/materials`).send({
        name: 'Cement', quantity: 50, unit: 'bags', unit_price: 350, vendor: 'ABC', date: '2026-01-15',
      });

      const res = await request(app).delete(`/api/materials/${created.body.id}`);
      expect(res.status).toBe(204);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/routes/materials.test.ts
```

- [ ] **Step 3: Create Materials model**

Create `server/src/models/materials.ts`:

```typescript
import pool from '../db/connection';
import { Material, CreateMaterialInput } from '../types';

export async function getMaterialsBySite(siteId: string): Promise<Material[]> {
  const result = await pool.query(
    'SELECT * FROM materials WHERE site_id = $1 ORDER BY date DESC',
    [siteId]
  );
  return result.rows;
}

export async function createMaterial(siteId: string, input: CreateMaterialInput): Promise<Material> {
  const { name, quantity, unit, unit_price, vendor, date } = input;
  const result = await pool.query(
    `INSERT INTO materials (site_id, name, quantity, unit, unit_price, vendor, date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [siteId, name, quantity, unit, unit_price, vendor, date]
  );
  return result.rows[0];
}

export async function updateMaterial(id: string, input: CreateMaterialInput): Promise<Material | null> {
  const { name, quantity, unit, unit_price, vendor, date } = input;
  const result = await pool.query(
    `UPDATE materials SET name = $1, quantity = $2, unit = $3, unit_price = $4, vendor = $5, date = $6
     WHERE id = $7 RETURNING *`,
    [name, quantity, unit, unit_price, vendor, date, id]
  );
  return result.rows[0] || null;
}

export async function deleteMaterial(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM materials WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
```

- [ ] **Step 4: Create Materials route**

Create `server/src/routes/materials.ts`:

```typescript
import { Router, Request, Response } from 'express';
import * as materialsModel from '../models/materials';

const router = Router();

router.get('/:siteId/materials', async (req: Request, res: Response) => {
  const materials = await materialsModel.getMaterialsBySite(req.params.siteId);
  res.json(materials);
});

router.post('/:siteId/materials', async (req: Request, res: Response) => {
  const { name, quantity, unit, unit_price, vendor, date } = req.body;
  if (!name || quantity === undefined || !unit || unit_price === undefined || !vendor || !date) {
    return res.status(400).json({ error: 'All fields are required: name, quantity, unit, unit_price, vendor, date' });
  }
  const material = await materialsModel.createMaterial(req.params.siteId, req.body);
  res.status(201).json(material);
});

router.put('/:id', async (req: Request, res: Response) => {
  const material = await materialsModel.updateMaterial(req.params.id, req.body);
  if (!material) {
    return res.status(404).json({ error: 'Material not found' });
  }
  res.json(material);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const deleted = await materialsModel.deleteMaterial(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Material not found' });
  }
  res.status(204).send();
});

export default router;
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run tests/routes/materials.test.ts
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add server/src/models/materials.ts server/src/routes/materials.ts server/tests/routes/materials.test.ts
git commit -m "feat: add Materials CRUD API with tests"
```

---

## Task 7: Expenses Model & Routes

**Files:**
- Create: `server/src/models/expenses.ts`
- Create: `server/src/routes/expenses.ts`
- Create: `server/tests/routes/expenses.test.ts`

- [ ] **Step 1: Write failing test for Expenses API**

Create `server/tests/routes/expenses.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { setupTestDb, cleanTestDb, teardownTestDb } from '../setup';

describe('Expenses API', () => {
  let siteId: string;

  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanTestDb();
    const site = await request(app).post('/api/sites').send({
      name: 'Test Site', address: 'Test Address', start_date: '2026-01-01',
    });
    siteId = site.body.id;
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  describe('POST /api/sites/:siteId/expenses', () => {
    it('adds an expense', async () => {
      const res = await request(app)
        .post(`/api/sites/${siteId}/expenses`)
        .send({
          category: 'material',
          description: 'Cement purchase',
          amount: 17500,
          date: '2026-01-15',
        });

      expect(res.status).toBe(201);
      expect(res.body.category).toBe('material');
      expect(res.body.amount).toBe('17500.00');
    });
  });

  describe('GET /api/sites/:siteId/expenses', () => {
    it('lists expenses for a site', async () => {
      await request(app).post(`/api/sites/${siteId}/expenses`).send({
        category: 'material', description: 'Cement', amount: 17500, date: '2026-01-15',
      });
      await request(app).post(`/api/sites/${siteId}/expenses`).send({
        category: 'labor', description: 'Daily wages', amount: 8000, date: '2026-01-15',
      });

      const res = await request(app).get(`/api/sites/${siteId}/expenses`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('PUT /api/expenses/:id', () => {
    it('updates an expense', async () => {
      const created = await request(app).post(`/api/sites/${siteId}/expenses`).send({
        category: 'material', description: 'Cement', amount: 17500, date: '2026-01-15',
      });

      const res = await request(app)
        .put(`/api/expenses/${created.body.id}`)
        .send({ category: 'material', description: 'Cement (updated)', amount: 18000, date: '2026-01-15' });

      expect(res.status).toBe(200);
      expect(res.body.amount).toBe('18000.00');
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('deletes an expense', async () => {
      const created = await request(app).post(`/api/sites/${siteId}/expenses`).send({
        category: 'transport', description: 'Truck rental', amount: 5000, date: '2026-01-15',
      });

      const res = await request(app).delete(`/api/expenses/${created.body.id}`);
      expect(res.status).toBe(204);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/routes/expenses.test.ts
```

- [ ] **Step 3: Create Expenses model**

Create `server/src/models/expenses.ts`:

```typescript
import pool from '../db/connection';
import { Expense, CreateExpenseInput } from '../types';

export async function getExpensesBySite(siteId: string): Promise<Expense[]> {
  const result = await pool.query(
    'SELECT * FROM expenses WHERE site_id = $1 ORDER BY date DESC',
    [siteId]
  );
  return result.rows;
}

export async function createExpense(siteId: string, input: CreateExpenseInput): Promise<Expense> {
  const { category, description, amount, date } = input;
  const result = await pool.query(
    `INSERT INTO expenses (site_id, category, description, amount, date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [siteId, category, description, amount, date]
  );
  return result.rows[0];
}

export async function updateExpense(id: string, input: CreateExpenseInput): Promise<Expense | null> {
  const { category, description, amount, date } = input;
  const result = await pool.query(
    `UPDATE expenses SET category = $1, description = $2, amount = $3, date = $4
     WHERE id = $5 RETURNING *`,
    [category, description, amount, date, id]
  );
  return result.rows[0] || null;
}

export async function deleteExpense(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
```

- [ ] **Step 4: Create Expenses route**

Create `server/src/routes/expenses.ts`:

```typescript
import { Router, Request, Response } from 'express';
import * as expensesModel from '../models/expenses';

const router = Router();

router.get('/:siteId/expenses', async (req: Request, res: Response) => {
  const expenses = await expensesModel.getExpensesBySite(req.params.siteId);
  res.json(expenses);
});

router.post('/:siteId/expenses', async (req: Request, res: Response) => {
  const { category, description, amount, date } = req.body;
  if (!category || !description || amount === undefined || !date) {
    return res.status(400).json({ error: 'category, description, amount, and date are required' });
  }
  const expense = await expensesModel.createExpense(req.params.siteId, req.body);
  res.status(201).json(expense);
});

router.put('/:id', async (req: Request, res: Response) => {
  const expense = await expensesModel.updateExpense(req.params.id, req.body);
  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.json(expense);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const deleted = await expensesModel.deleteExpense(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.status(204).send();
});

export default router;
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run tests/routes/expenses.test.ts
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add server/src/models/expenses.ts server/src/routes/expenses.ts server/tests/routes/expenses.test.ts
git commit -m "feat: add Expenses CRUD API with tests"
```

---

## Task 8: Daily Reports Model & Routes

**Files:**
- Create: `server/src/models/reports.ts`
- Create: `server/src/routes/reports.ts`
- Create: `server/tests/routes/reports.test.ts`

- [ ] **Step 1: Write failing test for Reports API**

Create `server/tests/routes/reports.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { setupTestDb, cleanTestDb, teardownTestDb } from '../setup';

describe('Daily Reports API', () => {
  let siteId: string;

  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanTestDb();
    const site = await request(app).post('/api/sites').send({
      name: 'Test Site', address: 'Test Address', start_date: '2026-01-01',
    });
    siteId = site.body.id;
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  describe('POST /api/sites/:siteId/reports', () => {
    it('creates a daily report', async () => {
      const res = await request(app)
        .post(`/api/sites/${siteId}/reports`)
        .send({
          date: '2026-01-15',
          weather: 'sunny',
          summary: 'Foundation work completed for block A',
          issues: 'Delayed cement delivery',
        });

      expect(res.status).toBe(201);
      expect(res.body.weather).toBe('sunny');
      expect(res.body.summary).toContain('Foundation');
    });
  });

  describe('GET /api/sites/:siteId/reports', () => {
    it('lists reports for a site', async () => {
      await request(app).post(`/api/sites/${siteId}/reports`).send({
        date: '2026-01-15', weather: 'sunny', summary: 'Day 1 work', issues: '',
      });
      await request(app).post(`/api/sites/${siteId}/reports`).send({
        date: '2026-01-16', weather: 'cloudy', summary: 'Day 2 work', issues: '',
      });

      const res = await request(app).get(`/api/sites/${siteId}/reports`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('GET /api/sites/:siteId/reports/:id', () => {
    it('returns a single report', async () => {
      const created = await request(app).post(`/api/sites/${siteId}/reports`).send({
        date: '2026-01-15', weather: 'sunny', summary: 'Day 1', issues: '',
      });

      const res = await request(app).get(`/api/sites/${siteId}/reports/${created.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body.summary).toBe('Day 1');
    });
  });

  describe('PUT /api/reports/:id', () => {
    it('updates a report', async () => {
      const created = await request(app).post(`/api/sites/${siteId}/reports`).send({
        date: '2026-01-15', weather: 'sunny', summary: 'Day 1', issues: '',
      });

      const res = await request(app)
        .put(`/api/reports/${created.body.id}`)
        .send({ date: '2026-01-15', weather: 'rainy', summary: 'Day 1 (updated)', issues: 'Rain delay' });

      expect(res.status).toBe(200);
      expect(res.body.weather).toBe('rainy');
      expect(res.body.issues).toBe('Rain delay');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/routes/reports.test.ts
```

- [ ] **Step 3: Create Reports model**

Create `server/src/models/reports.ts`:

```typescript
import pool from '../db/connection';
import { DailyReport, CreateReportInput } from '../types';

export async function getReportsBySite(siteId: string): Promise<DailyReport[]> {
  const result = await pool.query(
    'SELECT * FROM daily_reports WHERE site_id = $1 ORDER BY date DESC',
    [siteId]
  );
  return result.rows;
}

export async function getReportById(siteId: string, id: string): Promise<DailyReport | null> {
  const result = await pool.query(
    'SELECT * FROM daily_reports WHERE id = $1 AND site_id = $2',
    [id, siteId]
  );
  return result.rows[0] || null;
}

export async function createReport(siteId: string, input: CreateReportInput): Promise<DailyReport> {
  const { date, weather, summary, issues } = input;
  const result = await pool.query(
    `INSERT INTO daily_reports (site_id, date, weather, summary, issues)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [siteId, date, weather, summary, issues || '']
  );
  return result.rows[0];
}

export async function updateReport(id: string, input: CreateReportInput): Promise<DailyReport | null> {
  const { date, weather, summary, issues } = input;
  const result = await pool.query(
    `UPDATE daily_reports SET date = $1, weather = $2, summary = $3, issues = $4
     WHERE id = $5 RETURNING *`,
    [date, weather, summary, issues || '', id]
  );
  return result.rows[0] || null;
}
```

- [ ] **Step 4: Create Reports route**

Create `server/src/routes/reports.ts`:

```typescript
import { Router, Request, Response } from 'express';
import * as reportsModel from '../models/reports';

const router = Router();

router.get('/:siteId/reports', async (req: Request, res: Response) => {
  const reports = await reportsModel.getReportsBySite(req.params.siteId);
  res.json(reports);
});

router.get('/:siteId/reports/:id', async (req: Request, res: Response) => {
  const report = await reportsModel.getReportById(req.params.siteId, req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(report);
});

router.post('/:siteId/reports', async (req: Request, res: Response) => {
  const { date, weather, summary } = req.body;
  if (!date || !weather || !summary) {
    return res.status(400).json({ error: 'date, weather, and summary are required' });
  }
  const report = await reportsModel.createReport(req.params.siteId, req.body);
  res.status(201).json(report);
});

router.put('/:id', async (req: Request, res: Response) => {
  const report = await reportsModel.updateReport(req.params.id, req.body);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(report);
});

export default router;
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run tests/routes/reports.test.ts
```

Expected: All tests PASS.

- [ ] **Step 6: Run all server tests**

```bash
cd /Users/sotsys337/LEarning/server
npx vitest run
```

Expected: All tests across all route files PASS.

- [ ] **Step 7: Commit**

```bash
git add server/src/models/reports.ts server/src/routes/reports.ts server/tests/routes/reports.test.ts
git commit -m "feat: add Daily Reports CRUD API with tests"
```

---

## Task 9: Client Project Setup

**Files:**
- Create: `client/package.json`
- Create: `client/tsconfig.json`
- Create: `client/vite.config.ts`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `client/index.html`
- Create: `client/src/index.css`
- Create: `client/src/main.tsx`
- Create: `client/src/App.tsx`
- Create: `client/src/types/index.ts`

- [ ] **Step 1: Create client directory structure**

```bash
cd /Users/sotsys337/LEarning
mkdir -p client/src/{components,pages,services,types}
```

- [ ] **Step 2: Create package.json**

Create `client/package.json`:

```json
{
  "name": "construction-site-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.0",
    "lucide-react": "^0.460.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

Create `client/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create vite.config.ts**

Create `client/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 5: Create Tailwind config**

Create `client/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
};
```

Create `client/postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create index.html**

Create `client/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ConstructionHub — Site Management</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏗️</text></svg>" />
  </head>
  <body class="bg-gray-50">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create CSS entry with Tailwind directives**

Create `client/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply text-gray-900 antialiased;
}
```

- [ ] **Step 8: Create TypeScript interfaces (shared with server)**

Create `client/src/types/index.ts`:

```typescript
export interface Site {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'completed' | 'on_hold';
  start_date: string;
  created_at: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  phone: string;
  daily_wage: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  site_id: string;
  worker_id: string;
  worker_name?: string;
  worker_role?: string;
  date: string;
  status: 'present' | 'absent' | 'half_day';
  overtime_hours: string;
}

export interface Material {
  id: string;
  site_id: string;
  name: string;
  quantity: string;
  unit: string;
  unit_price: string;
  vendor: string;
  date: string;
}

export interface Expense {
  id: string;
  site_id: string;
  category: 'material' | 'labor' | 'transport' | 'misc';
  description: string;
  amount: string;
  date: string;
}

export interface DailyReport {
  id: string;
  site_id: string;
  date: string;
  weather: 'sunny' | 'rainy' | 'cloudy';
  summary: string;
  issues: string;
  created_at: string;
}
```

Note: `daily_wage`, `quantity`, `unit_price`, `amount`, `overtime_hours` are `string` on the client because PostgreSQL DECIMAL comes back as strings via pg driver.

- [ ] **Step 9: Create main.tsx**

Create `client/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 10: Create App.tsx with router skeleton**

Create `client/src/App.tsx`:

```tsx
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SitesList from './pages/SitesList';
import SiteDetail from './pages/SiteDetail';

export default function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sites" element={<SitesList />} />
          <Route path="/sites/:id" element={<SiteDetail />} />
        </Routes>
      </main>
    </div>
  );
}
```

- [ ] **Step 11: Install dependencies and verify**

```bash
cd /Users/sotsys337/LEarning/client
npm install
npx tsc --noEmit
```

Expected: May show errors for missing component files — that's fine, they're created in the next tasks.

- [ ] **Step 12: Commit**

```bash
git add client/
git commit -m "feat: scaffold React client with Vite, Tailwind, and routing"
```

---

## Task 10: API Service Layer (Client)

**Files:**
- Create: `client/src/services/api.ts`
- Create: `client/src/services/sites.ts`
- Create: `client/src/services/workers.ts`
- Create: `client/src/services/attendance.ts`
- Create: `client/src/services/materials.ts`
- Create: `client/src/services/expenses.ts`
- Create: `client/src/services/reports.ts`

- [ ] **Step 1: Create Axios instance with interceptor**

Create `client/src/services/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;
```

- [ ] **Step 2: Create Sites service**

Create `client/src/services/sites.ts`:

```typescript
import api from './api';
import { Site } from '../types';

export async function getSites(): Promise<Site[]> {
  const { data } = await api.get('/sites');
  return data;
}

export async function getSite(id: string): Promise<Site> {
  const { data } = await api.get(`/sites/${id}`);
  return data;
}

export async function createSite(input: Omit<Site, 'id' | 'created_at'>): Promise<Site> {
  const { data } = await api.post('/sites', input);
  return data;
}

export async function updateSite(id: string, input: Omit<Site, 'id' | 'created_at'>): Promise<Site> {
  const { data } = await api.put(`/sites/${id}`, input);
  return data;
}

export async function deleteSite(id: string): Promise<void> {
  await api.delete(`/sites/${id}`);
}
```

- [ ] **Step 3: Create Workers service**

Create `client/src/services/workers.ts`:

```typescript
import api from './api';
import { Worker } from '../types';

export async function getWorkers(): Promise<Worker[]> {
  const { data } = await api.get('/workers');
  return data;
}

export async function createWorker(input: { name: string; role: string; phone: string; daily_wage: number }): Promise<Worker> {
  const { data } = await api.post('/workers', input);
  return data;
}

export async function updateWorker(id: string, input: { name: string; role: string; phone: string; daily_wage: number }): Promise<Worker> {
  const { data } = await api.put(`/workers/${id}`, input);
  return data;
}

export async function deleteWorker(id: string): Promise<void> {
  await api.delete(`/workers/${id}`);
}
```

- [ ] **Step 4: Create Attendance service**

Create `client/src/services/attendance.ts`:

```typescript
import api from './api';
import { Attendance } from '../types';

export async function getAttendance(siteId: string, date: string): Promise<Attendance[]> {
  const { data } = await api.get(`/sites/${siteId}/attendance?date=${date}`);
  return data;
}

export async function markAttendance(
  siteId: string,
  date: string,
  records: { worker_id: string; status: string; overtime_hours: number }[]
): Promise<Attendance[]> {
  const { data } = await api.post(`/sites/${siteId}/attendance`, { date, records });
  return data;
}

export async function updateAttendance(
  id: string,
  status: string,
  overtimeHours: number
): Promise<Attendance> {
  const { data } = await api.put(`/attendance/${id}`, { status, overtime_hours: overtimeHours });
  return data;
}
```

- [ ] **Step 5: Create Materials service**

Create `client/src/services/materials.ts`:

```typescript
import api from './api';
import { Material } from '../types';

export async function getMaterials(siteId: string): Promise<Material[]> {
  const { data } = await api.get(`/sites/${siteId}/materials`);
  return data;
}

export async function createMaterial(siteId: string, input: Omit<Material, 'id' | 'site_id'>): Promise<Material> {
  const { data } = await api.post(`/sites/${siteId}/materials`, input);
  return data;
}

export async function updateMaterial(id: string, input: Omit<Material, 'id' | 'site_id'>): Promise<Material> {
  const { data } = await api.put(`/materials/${id}`, input);
  return data;
}

export async function deleteMaterial(id: string): Promise<void> {
  await api.delete(`/materials/${id}`);
}
```

- [ ] **Step 6: Create Expenses service**

Create `client/src/services/expenses.ts`:

```typescript
import api from './api';
import { Expense } from '../types';

export async function getExpenses(siteId: string): Promise<Expense[]> {
  const { data } = await api.get(`/sites/${siteId}/expenses`);
  return data;
}

export async function createExpense(siteId: string, input: Omit<Expense, 'id' | 'site_id'>): Promise<Expense> {
  const { data } = await api.post(`/sites/${siteId}/expenses`, input);
  return data;
}

export async function updateExpense(id: string, input: Omit<Expense, 'id' | 'site_id'>): Promise<Expense> {
  const { data } = await api.put(`/expenses/${id}`, input);
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/expenses/${id}`);
}
```

- [ ] **Step 7: Create Reports service**

Create `client/src/services/reports.ts`:

```typescript
import api from './api';
import { DailyReport } from '../types';

export async function getReports(siteId: string): Promise<DailyReport[]> {
  const { data } = await api.get(`/sites/${siteId}/reports`);
  return data;
}

export async function getReport(siteId: string, id: string): Promise<DailyReport> {
  const { data } = await api.get(`/sites/${siteId}/reports/${id}`);
  return data;
}

export async function createReport(siteId: string, input: Omit<DailyReport, 'id' | 'site_id' | 'created_at'>): Promise<DailyReport> {
  const { data } = await api.post(`/sites/${siteId}/reports`, input);
  return data;
}

export async function updateReport(id: string, input: Omit<DailyReport, 'id' | 'site_id' | 'created_at'>): Promise<DailyReport> {
  const { data } = await api.put(`/reports/${id}`, input);
  return data;
}
```

- [ ] **Step 8: Commit**

```bash
git add client/src/services/
git commit -m "feat: add API service layer for all resources"
```

---

## Task 11: Reusable UI Components

**Files:**
- Create: `client/src/components/Sidebar.tsx`
- Create: `client/src/components/PageHeader.tsx`
- Create: `client/src/components/StatCard.tsx`
- Create: `client/src/components/DataTable.tsx`
- Create: `client/src/components/Modal.tsx`
- Create: `client/src/components/StatusBadge.tsx`
- Create: `client/src/components/EmptyState.tsx`
- Create: `client/src/components/Toast.tsx`

- [ ] **Step 1: Create Sidebar component**

Create `client/src/components/Sidebar.tsx`:

```tsx
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, HardHat } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sites', icon: Building2, label: 'Sites' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <HardHat className="w-8 h-8 text-yellow-400" />
          <div>
            <h1 className="text-lg font-bold">ConstructionHub</h1>
            <p className="text-xs text-gray-400">Site Management</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 px-4 py-2">
          <Users className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-400">No auth (MVP)</span>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create PageHeader component**

Create `client/src/components/PageHeader.tsx`:

```tsx
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
```

- [ ] **Step 3: Create StatCard component**

Create `client/src/components/StatCard.tsx`:

```tsx
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
};

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create DataTable component**

Create `client/src/components/DataTable.tsx`:

```tsx
import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  actions?: (item: T) => ReactNode;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  actions,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3"
              >
                {col.header}
              </th>
            ))}
            {actions && (
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm text-gray-700">
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 text-right">{actions(item)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 5: Create Modal component**

Create `client/src/components/Modal.tsx`:

```tsx
import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create StatusBadge component**

Create `client/src/components/StatusBadge.tsx`:

```tsx
interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  on_hold: 'bg-yellow-100 text-yellow-700',
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  half_day: 'bg-orange-100 text-orange-700',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700';
  const label = status.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
      {label}
    </span>
  );
}
```

- [ ] **Step 7: Create EmptyState component**

Create `client/src/components/EmptyState.tsx`:

```tsx
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-gray-100 rounded-full mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Create Toast component**

Create `client/src/components/Toast.tsx`:

```tsx
import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <XCircle className="w-5 h-5" />
        )}
        {message}
        <button onClick={onClose} className="ml-2 hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add client/src/components/
git commit -m "feat: add reusable UI components (Sidebar, DataTable, Modal, StatCard, etc.)"
```

---

## Task 12: Dashboard Page

**Files:**
- Create: `client/src/pages/Dashboard.tsx`

- [ ] **Step 1: Create Dashboard page**

Create `client/src/pages/Dashboard.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, IndianRupee, FileText } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { getSites } from '../services/sites';
import { Site } from '../types';

export default function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getSites()
      .then(setSites)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeSites = sites.filter((s) => s.status === 'active').length;
  const completedSites = sites.filter((s) => s.status === 'completed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of all construction sites"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Sites" value={sites.length} icon={Building2} color="blue" />
        <StatCard title="Active Sites" value={activeSites} icon={Building2} color="green" />
        <StatCard title="Completed" value={completedSites} icon={FileText} color="purple" />
        <StatCard
          title="On Hold"
          value={sites.filter((s) => s.status === 'on_hold').length}
          icon={IndianRupee}
          color="yellow"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Sites</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {sites.slice(0, 5).map((site) => (
            <div
              key={site.id}
              onClick={() => navigate(`/sites/${site.id}`)}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{site.name}</p>
                <p className="text-sm text-gray-500">{site.address}</p>
              </div>
              <StatusBadge status={site.status} />
            </div>
          ))}
          {sites.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No sites yet. Create your first site to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/Dashboard.tsx
git commit -m "feat: add Dashboard page with stats and recent sites"
```

---

## Task 13: Sites List Page

**Files:**
- Create: `client/src/pages/SitesList.tsx`

- [ ] **Step 1: Create SitesList page**

Create `client/src/pages/SitesList.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, MapPin, Calendar } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { getSites, createSite, deleteSite } from '../services/sites';
import { Site } from '../types';

export default function SitesList() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState({ name: '', address: '', start_date: '', status: 'active' as const });
  const navigate = useNavigate();

  const loadSites = () => {
    getSites()
      .then(setSites)
      .catch(() => setToast({ message: 'Failed to load sites', type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSites(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.address || !form.start_date) {
      setToast({ message: 'Please fill all required fields', type: 'error' });
      return;
    }
    try {
      await createSite(form);
      setShowModal(false);
      setForm({ name: '', address: '', start_date: '', status: 'active' });
      setToast({ message: 'Site created successfully', type: 'success' });
      loadSites();
    } catch {
      setToast({ message: 'Failed to create site', type: 'error' });
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this site?')) return;
    try {
      await deleteSite(id);
      setToast({ message: 'Site deleted', type: 'success' });
      loadSites();
    } catch {
      setToast({ message: 'Failed to delete site', type: 'error' });
    }
  };

  const filtered = filter === 'all' ? sites : sites.filter((s) => s.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Sites"
        subtitle={`${sites.length} total sites`}
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Site
          </button>
        }
      />

      <div className="flex gap-2 mb-6">
        {['all', 'active', 'completed', 'on_hold'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No sites found"
          description="Create your first construction site to start tracking"
          icon={Building2}
          action={{ label: 'Add Site', onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((site) => (
            <div
              key={site.id}
              onClick={() => navigate(`/sites/${site.id}`)}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{site.name}</h3>
                <StatusBadge status={site.status} />
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {site.address}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Started: {new Date(site.start_date).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={(e) => handleDelete(site.id, e)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Site">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Villa Project - Phase 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Plot 42, Sector 15, Pune"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Site
            </button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/SitesList.tsx
git commit -m "feat: add Sites list page with create, filter, and delete"
```

---

## Task 14: Site Detail Page (Tabbed)

**Files:**
- Create: `client/src/pages/SiteDetail.tsx`
- Create: `client/src/pages/Attendance.tsx`
- Create: `client/src/pages/Materials.tsx`
- Create: `client/src/pages/Expenses.tsx`
- Create: `client/src/pages/DailyReports.tsx`

- [ ] **Step 1: Create SiteDetail page with tabs**

Create `client/src/pages/SiteDetail.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Attendance from './Attendance';
import Materials from './Materials';
import Expenses from './Expenses';
import DailyReports from './DailyReports';
import { getSite } from '../services/sites';
import { Site } from '../types';

const tabs = ['Overview', 'Attendance', 'Materials', 'Expenses', 'Reports'] as const;
type Tab = (typeof tabs)[number];

export default function SiteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  useEffect(() => {
    if (!id) return;
    getSite(id)
      .then(setSite)
      .catch(() => navigate('/sites'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading || !site) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/sites')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sites
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {site.address}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Started: {new Date(site.start_date).toLocaleDateString()}
              </span>
            </div>
          </div>
          <StatusBadge status={site.status} />
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'Overview' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Site Overview</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <p className="font-medium">{site.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p className="mt-1"><StatusBadge status={site.status} /></p>
              </div>
              <div>
                <span className="text-gray-500">Address:</span>
                <p className="font-medium">{site.address}</p>
              </div>
              <div>
                <span className="text-gray-500">Start Date:</span>
                <p className="font-medium">{new Date(site.start_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'Attendance' && <Attendance siteId={site.id} />}
        {activeTab === 'Materials' && <Materials siteId={site.id} />}
        {activeTab === 'Expenses' && <Expenses siteId={site.id} />}
        {activeTab === 'Reports' && <DailyReports siteId={site.id} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Attendance tab page**

Create `client/src/pages/Attendance.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { UserCheck, UserX, Clock } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { getAttendance, markAttendance } from '../services/attendance';
import { getWorkers } from '../services/workers';
import { Attendance as AttendanceType, Worker } from '../types';

interface AttendanceProps {
  siteId: string;
}

export default function Attendance({ siteId }: AttendanceProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceType[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [draft, setDraft] = useState<Record<string, { status: string; overtime_hours: number }>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [attendanceData, workersData] = await Promise.all([
        getAttendance(siteId, date),
        getWorkers(),
      ]);
      setRecords(attendanceData);
      setWorkers(workersData);

      const newDraft: Record<string, { status: string; overtime_hours: number }> = {};
      workersData.forEach((w) => {
        const existing = attendanceData.find((a) => a.worker_id === w.id);
        newDraft[w.id] = {
          status: existing?.status || 'present',
          overtime_hours: existing ? parseFloat(existing.overtime_hours) : 0,
        };
      });
      setDraft(newDraft);
    } catch {
      setToast({ message: 'Failed to load attendance', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [siteId, date]);

  const handleSave = async () => {
    const attendanceRecords = Object.entries(draft).map(([worker_id, data]) => ({
      worker_id,
      status: data.status,
      overtime_hours: data.overtime_hours,
    }));

    try {
      await markAttendance(siteId, date, attendanceRecords);
      setToast({ message: 'Attendance saved', type: 'success' });
      loadData();
    } catch {
      setToast({ message: 'Failed to save attendance', type: 'error' });
    }
  };

  const markAll = (status: string) => {
    const updated = { ...draft };
    Object.keys(updated).forEach((id) => {
      updated[id] = { ...updated[id], status };
    });
    setDraft(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => markAll('present')}
              className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
            >
              All Present
            </button>
            <button
              onClick={() => markAll('absent')}
              className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              All Absent
            </button>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Save Attendance
        </button>
      </div>

      {workers.length === 0 ? (
        <EmptyState
          title="No workers"
          description="Add workers first to mark attendance"
          icon={UserCheck}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Worker</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Role</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Status</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Overtime (hrs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workers.map((worker) => {
                const d = draft[worker.id];
                if (!d) return null;
                return (
                  <tr key={worker.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{worker.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">{worker.role}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {(['present', 'absent', 'half_day'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() =>
                              setDraft({ ...draft, [worker.id]: { ...d, status: s } })
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              d.status === s
                                ? s === 'present'
                                  ? 'bg-green-600 text-white'
                                  : s === 'absent'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {s === 'half_day' ? 'Half' : s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        max="12"
                        step="0.5"
                        value={d.overtime_hours}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            [worker.id]: { ...d, overtime_hours: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="w-20 mx-auto block px-2 py-1 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
```

- [ ] **Step 3: Create Materials tab page**

Create `client/src/pages/Materials.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '../services/materials';
import { Material } from '../types';

interface MaterialsProps {
  siteId: string;
}

const emptyForm = { name: '', quantity: '', unit: '', unit_price: '', vendor: '', date: '' };

export default function Materials({ siteId }: MaterialsProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadMaterials = () => {
    getMaterials(siteId)
      .then(setMaterials)
      .catch(() => setToast({ message: 'Failed to load materials', type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMaterials(); }, [siteId]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEdit = (m: Material) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      quantity: m.quantity,
      unit: m.unit,
      unit_price: m.unit_price,
      vendor: m.vendor,
      date: m.date.split('T')[0],
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.quantity || !form.unit || !form.unit_price || !form.vendor || !form.date) {
      setToast({ message: 'Please fill all fields', type: 'error' });
      return;
    }
    try {
      const payload = {
        name: form.name,
        quantity: form.quantity,
        unit: form.unit,
        unit_price: form.unit_price,
        vendor: form.vendor,
        date: form.date,
      };
      if (editingId) {
        await updateMaterial(editingId, payload);
        setToast({ message: 'Material updated', type: 'success' });
      } else {
        await createMaterial(siteId, payload);
        setToast({ message: 'Material added', type: 'success' });
      }
      setShowModal(false);
      loadMaterials();
    } catch {
      setToast({ message: 'Failed to save material', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this material entry?')) return;
    try {
      await deleteMaterial(id);
      setToast({ message: 'Material deleted', type: 'success' });
      loadMaterials();
    } catch {
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  };

  const total = materials.reduce(
    (sum, m) => sum + parseFloat(m.quantity) * parseFloat(m.unit_price),
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Materials</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Material
        </button>
      </div>

      {materials.length === 0 ? (
        <EmptyState
          title="No materials tracked"
          description="Start tracking material purchases and deliveries"
          icon={Package}
          action={{ label: 'Add Material', onClick: openCreate }}
        />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Material</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Qty</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Unit</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Unit Price</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Vendor</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Total</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {materials.map((m) => (
                  <tr key={m.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{m.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{m.unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{parseFloat(m.unit_price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{m.vendor}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{new Date(m.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {(parseFloat(m.quantity) * parseFloat(m.unit_price)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(m)} className="p-1 hover:bg-gray-100 rounded">
                          <Pencil className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="p-1 hover:bg-gray-100 rounded">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <span className="text-sm text-gray-500">Total: </span>
            <span className="text-lg font-bold text-gray-900">{total.toLocaleString()}</span>
          </div>
        </>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Material' : 'Add Material'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Cement, Steel bars" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              <input type="text" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="bags, kg, pieces" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
              <input type="number" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor *</label>
              <input type="text" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
              {editingId ? 'Update' : 'Add'} Material
            </button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
```

- [ ] **Step 4: Create Expenses tab page**

Create `client/src/pages/Expenses.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Receipt } from 'lucide-react';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/expenses';
import { Expense } from '../types';

interface ExpensesProps {
  siteId: string;
}

const categories = ['material', 'labor', 'transport', 'misc'] as const;
const emptyForm = { category: 'material' as const, description: '', amount: '', date: '' };

export default function Expenses({ siteId }: ExpensesProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadExpenses = () => {
    getExpenses(siteId)
      .then(setExpenses)
      .catch(() => setToast({ message: 'Failed to load expenses', type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadExpenses(); }, [siteId]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEdit = (e: Expense) => {
    setEditingId(e.id);
    setForm({ category: e.category, description: e.description, amount: e.amount, date: e.date.split('T')[0] });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.description || !form.amount || !form.date) {
      setToast({ message: 'Please fill all fields', type: 'error' });
      return;
    }
    try {
      if (editingId) {
        await updateExpense(editingId, form);
        setToast({ message: 'Expense updated', type: 'success' });
      } else {
        await createExpense(siteId, form);
        setToast({ message: 'Expense added', type: 'success' });
      }
      setShowModal(false);
      loadExpenses();
    } catch {
      setToast({ message: 'Failed to save expense', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      setToast({ message: 'Expense deleted', type: 'success' });
      loadExpenses();
    } catch {
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  };

  const filtered = filterCat === 'all' ? expenses : expenses.filter((e) => e.category === filterCat);
  const totalByCategory = categories.reduce((acc, cat) => {
    acc[cat] = expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + parseFloat(e.amount), 0);
    return acc;
  }, {} as Record<string, number>);
  const grandTotal = Object.values(totalByCategory).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {categories.map((cat) => (
          <div key={cat} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase font-medium">{cat}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{totalByCategory[cat].toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {['all', ...categories].map((cat) => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterCat === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No expenses" description="Track your site expenses" icon={Receipt}
          action={{ label: 'Add Expense', onClick: openCreate }} />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Description</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Date</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((exp) => (
                  <tr key={exp.id}>
                    <td className="px-6 py-4 text-sm capitalize text-gray-700">{exp.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{exp.description}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{parseFloat(exp.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(exp)} className="p-1 hover:bg-gray-100 rounded">
                          <Pencil className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => handleDelete(exp.id)} className="p-1 hover:bg-gray-100 rounded">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <span className="text-sm text-gray-500">Grand Total: </span>
            <span className="text-lg font-bold text-gray-900">{grandTotal.toLocaleString()}</span>
          </div>
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Expense' : 'Add Expense'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Expense['category'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              {categories.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Cement purchase from vendor" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
              {editingId ? 'Update' : 'Add'} Expense
            </button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
```

- [ ] **Step 5: Create Daily Reports tab page**

Create `client/src/pages/DailyReports.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { Plus, FileText, Sun, Cloud, CloudRain, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { getReports, createReport, updateReport } from '../services/reports';
import { DailyReport } from '../types';

interface DailyReportsProps {
  siteId: string;
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
};

const emptyForm = { date: '', weather: 'sunny' as const, summary: '', issues: '' };

export default function DailyReports({ siteId }: DailyReportsProps) {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadReports = () => {
    getReports(siteId)
      .then(setReports)
      .catch(() => setToast({ message: 'Failed to load reports', type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReports(); }, [siteId]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEdit = (r: DailyReport) => {
    setEditingId(r.id);
    setForm({ date: r.date.split('T')[0], weather: r.weather, summary: r.summary, issues: r.issues });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.date || !form.summary) {
      setToast({ message: 'Date and summary are required', type: 'error' });
      return;
    }
    try {
      if (editingId) {
        await updateReport(editingId, form);
        setToast({ message: 'Report updated', type: 'success' });
      } else {
        await createReport(siteId, form);
        setToast({ message: 'Report created', type: 'success' });
      }
      setShowModal(false);
      loadReports();
    } catch {
      setToast({ message: 'Failed to save report', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Daily Reports</h2>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" />
          New Report
        </button>
      </div>

      {reports.length === 0 ? (
        <EmptyState title="No reports yet" description="Create daily reports to track site progress"
          icon={FileText} action={{ label: 'Create Report', onClick: openCreate }} />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const WeatherIcon = weatherIcons[report.weather];
            const isExpanded = expandedId === report.id;
            return (
              <div key={report.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <WeatherIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(report.date).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{report.summary}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(report); }}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                      Edit
                    </button>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Summary</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.summary}</p>
                      </div>
                      {report.issues && (
                        <div>
                          <p className="text-xs font-semibold text-red-500 uppercase mb-1">Issues</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.issues}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Weather: {report.weather}</span>
                        <span>Created: {new Date(report.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Report' : 'New Daily Report'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weather *</label>
              <select value={form.weather} onChange={(e) => setForm({ ...form, weather: e.target.value as DailyReport['weather'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="sunny">Sunny</option>
                <option value="cloudy">Cloudy</option>
                <option value="rainy">Rainy</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary *</label>
            <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="What work was done today?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issues / Blockers</label>
            <textarea value={form.issues} onChange={(e) => setForm({ ...form, issues: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Any problems or delays?" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
              {editingId ? 'Update' : 'Create'} Report
            </button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
```

- [ ] **Step 6: Verify TypeScript compilation**

```bash
cd /Users/sotsys337/LEarning/client
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add client/src/pages/
git commit -m "feat: add all pages — Dashboard, SitesList, SiteDetail with Attendance, Materials, Expenses, DailyReports tabs"
```

---

## Task 15: Final Integration & Smoke Test

**Files:** No new files — verification only.

- [ ] **Step 1: Start PostgreSQL and verify database exists**

```bash
psql -d construction_site -c "SELECT count(*) FROM sites;"
```

Expected: `count = 0` (empty table, no errors).

- [ ] **Step 2: Start the server**

```bash
cd /Users/sotsys337/LEarning/server
npm run dev
```

Expected: `Server running on http://localhost:3001` and `Migration applied: 001_initial_schema.sql`.

- [ ] **Step 3: Test API with curl (in a new terminal)**

```bash
# Create a site
curl -s -X POST http://localhost:3001/api/sites \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Site","address":"123 Main St","start_date":"2026-01-01"}' | head -c 200

# List sites
curl -s http://localhost:3001/api/sites | head -c 200
```

Expected: JSON responses with site data.

- [ ] **Step 4: Start the client**

```bash
cd /Users/sotsys337/LEarning/client
npm run dev
```

Expected: `Local: http://localhost:5173/` — open in browser and verify:
1. Sidebar with ConstructionHub branding
2. Dashboard loads with stat cards
3. Navigate to Sites → see the test site created via curl
4. Click into a site → tabs work (Overview, Attendance, Materials, Expenses, Reports)

- [ ] **Step 5: Run all server tests**

```bash
cd /Users/sotsys337/LEarning/server
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 6: Final commit**

```bash
cd /Users/sotsys337/LEarning
git add -A
git commit -m "feat: Construction Site Management MVP — complete full-stack app"
```
