import pool from '../db/pool';
import { AttendanceRecord } from '../types';

export const getBySiteAndDate = (siteId: string, date: string) => {
  return pool.query(
    `SELECT a.*, w.name as worker_name, w.role as worker_role, w.daily_wage
     FROM attendance a
     JOIN workers w ON a.worker_id = w.id
     WHERE a.site_id = $1 AND a.date = $2
     ORDER BY w.name`,
    [siteId, date]
  );
};

export const markBulk = async (siteId: string, date: string, records: AttendanceRecord[]) => {
  const results = await Promise.all(
    records.map((record) =>
      pool.query(
        `INSERT INTO attendance (site_id, worker_id, date, status, overtime_hours)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (site_id, worker_id, date)
         DO UPDATE SET status = $4, overtime_hours = $5
         RETURNING *`,
        [siteId, record.worker_id, date, record.status, record.overtime_hours ?? 0]
      )
    )
  );
  return results.map((r) => r.rows[0]);
};

export const updateById = (id: string, status: string, overtimeHours: number) => {
  return pool.query(
    'UPDATE attendance SET status = $1, overtime_hours = $2 WHERE id = $3 RETURNING *',
    [status, overtimeHours, id]
  );
};
