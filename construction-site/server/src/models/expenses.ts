import pool from '../db/pool';
import { CreateExpenseInput } from '../types';

export const getBySite = (siteId: string) => {
  return pool.query('SELECT * FROM expenses WHERE site_id = $1 ORDER BY date DESC', [siteId]);
};

export const create = (siteId: string, input: CreateExpenseInput) => {
  const { category, description, amount, date } = input;
  return pool.query(
    'INSERT INTO expenses (site_id, category, description, amount, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [siteId, category, description, amount, date]
  );
};

export const update = (id: string, input: CreateExpenseInput) => {
  const { category, description, amount, date } = input;
  return pool.query(
    'UPDATE expenses SET category = $1, description = $2, amount = $3, date = $4 WHERE id = $5 RETURNING *',
    [category, description, amount, date, id]
  );
};

export const remove = (id: string) => {
  return pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
};
