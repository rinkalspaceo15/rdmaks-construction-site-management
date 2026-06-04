import pool from '../db/pool';
import { CreateWorkerInput } from '../types';

export function getAll() {
  return pool.query('SELECT * FROM workers ORDER BY created_at DESC');
}

export function create(input: CreateWorkerInput) {
  const { name, role, phone, daily_wage } = input;
  return pool.query(
    'INSERT INTO workers (name, role, phone, daily_wage) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, role, phone, daily_wage]
  );
}

export function update(id: string, input: CreateWorkerInput) {
  const { name, role, phone, daily_wage } = input;
  return pool.query(
    'UPDATE workers SET name = $1, role = $2, phone = $3, daily_wage = $4 WHERE id = $5 RETURNING *',
    [name, role, phone, daily_wage, id]
  );
}

export function remove(id: string) {
  return pool.query('DELETE FROM workers WHERE id = $1 RETURNING *', [id]);
}
