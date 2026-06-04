import { Pool, types } from 'pg';

// Return DATE columns (oid 1082) as the raw 'YYYY-MM-DD' string instead of a JS
// Date. Otherwise the driver builds a Date at local midnight and serializes it to
// UTC, shifting it back by the IST offset (e.g. 2026-01-15 -> 2026-01-14T18:30Z),
// which makes dates render one day early on the client. TIMESTAMP (created_at) is
// a different oid (1114) and is unaffected.
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'construction_site',
  user: process.env.DB_USER || 'sotsys337',
  password: process.env.DB_PASSWORD || '',
});

export default pool;
