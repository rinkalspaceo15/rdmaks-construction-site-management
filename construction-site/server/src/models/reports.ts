import pool from '../db/pool';
import { CreateReportInput } from '../types';

export const getBySite = (siteId: string) => {
  return pool.query(
    'SELECT * FROM daily_reports WHERE site_id = $1 ORDER BY date DESC',
    [siteId]
  );
};

export const getById = (id: string) => {
  return pool.query('SELECT * FROM daily_reports WHERE id = $1', [id]);
};

export const create = (siteId: string, input: CreateReportInput) => {
  const { date, weather, summary, issues } = input;
  return pool.query(
    'INSERT INTO daily_reports (site_id, date, weather, summary, issues) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [siteId, date, weather, summary, issues]
  );
};

export const update = (id: string, input: CreateReportInput) => {
  const { date, weather, summary, issues } = input;
  return pool.query(
    'UPDATE daily_reports SET date = $1, weather = $2, summary = $3, issues = $4 WHERE id = $5 RETURNING *',
    [date, weather, summary, issues, id]
  );
};
