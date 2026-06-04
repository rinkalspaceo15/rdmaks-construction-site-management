import pool from '../db/pool';
import { CreateMaterialInput } from '../types';

export const getBySite = (siteId: string) => {
  return pool.query('SELECT * FROM materials WHERE site_id = $1 ORDER BY date DESC', [siteId]);
};

export const create = (siteId: string, input: CreateMaterialInput) => {
  const { name, quantity, unit, unit_price, vendor, date } = input;
  return pool.query(
    'INSERT INTO materials (site_id, name, quantity, unit, unit_price, vendor, date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [siteId, name, quantity, unit, unit_price, vendor, date]
  );
};

export const update = (id: string, input: CreateMaterialInput) => {
  const { name, quantity, unit, unit_price, vendor, date } = input;
  return pool.query(
    'UPDATE materials SET name = $1, quantity = $2, unit = $3, unit_price = $4, vendor = $5, date = $6 WHERE id = $7 RETURNING *',
    [name, quantity, unit, unit_price, vendor, date, id]
  );
};

export const remove = (id: string) => {
  return pool.query('DELETE FROM materials WHERE id = $1 RETURNING *', [id]);
};
