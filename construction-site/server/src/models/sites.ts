import pool from '../db/pool';
import { CreateSiteInput } from '../types';

export const getAll = () => {
  return pool.query('SELECT * FROM sites ORDER BY created_at DESC');
};

export const getById = (id: string) => {
  return pool.query('SELECT * FROM sites WHERE id = $1', [id]);
};

export const create = (input: CreateSiteInput) => {
  const { name, address, status, start_date } = input;
  return pool.query(
    'INSERT INTO sites (name, address, status, start_date) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, address, status, start_date]
  );
};

export const update = (id: string, input: CreateSiteInput) => {
  const { name, address, status, start_date } = input;
  return pool.query(
    'UPDATE sites SET name = $1, address = $2, status = $3, start_date = $4 WHERE id = $5 RETURNING *',
    [name, address, status, start_date, id]
  );
};

export const remove = (id: string) => {
  return pool.query('DELETE FROM sites WHERE id = $1 RETURNING *', [id]);
};
