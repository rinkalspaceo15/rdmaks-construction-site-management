import pool from '../db/pool';

// Wage per attendance day:
//   present  → daily_wage
//   half_day → daily_wage * 0.5
//   absent   → 0
//   overtime → overtime_hours * (daily_wage / 8)   (8-hour standard day)
// Summed per worker over the [from, to] date range for one site.
export const getBySiteAndRange = (siteId: string, from: string, to: string) => {
  return pool.query(
    `SELECT
       w.id   AS worker_id,
       w.name,
       w.role,
       COUNT(*) FILTER (WHERE a.status = 'present')::int  AS present_days,
       COUNT(*) FILTER (WHERE a.status = 'half_day')::int AS half_days,
       COUNT(*) FILTER (WHERE a.status = 'absent')::int   AS absent_days,
       COALESCE(SUM(a.overtime_hours), 0) AS overtime_hours,
       COALESCE(SUM(
         CASE a.status
           WHEN 'present'  THEN COALESCE(w.daily_wage, 0)
           WHEN 'half_day' THEN COALESCE(w.daily_wage, 0) * 0.5
           ELSE 0
         END
         + COALESCE(a.overtime_hours, 0) * (COALESCE(w.daily_wage, 0) / 8.0)
       ), 0)::numeric(12,2) AS wage
     FROM attendance a
     JOIN workers w ON a.worker_id = w.id
     WHERE a.site_id = $1 AND a.date BETWEEN $2 AND $3
     GROUP BY w.id, w.name, w.role
     ORDER BY w.name`,
    [siteId, from, to]
  );
};
