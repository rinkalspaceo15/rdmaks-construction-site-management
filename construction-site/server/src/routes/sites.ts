import { Router } from 'express';
import * as sitesModel from '../models/sites';

const router = Router();

// GET /api/sites
router.get('/', async (_req, res, next) => {
  try {
    const result = await sitesModel.getAll();
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/sites/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await sitesModel.getById(req.params.id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/sites
router.post('/', async (req, res, next) => {
  try {
    const { name, address, status, start_date } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const result = await sitesModel.create({ name, address, status, start_date });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/sites/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, address, status, start_date } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const result = await sitesModel.update(req.params.id, { name, address, status, start_date });
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/sites/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await sitesModel.remove(req.params.id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
