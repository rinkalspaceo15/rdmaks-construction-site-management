import { Router } from 'express';
import * as workersModel from '../models/workers';

const router = Router();

// GET /api/workers
router.get('/', async (_req, res, next) => {
  try {
    const result = await workersModel.getAll();
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/workers
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    const result = await workersModel.create(req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/workers/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    const result = await workersModel.update(req.params.id, req.body);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/workers/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await workersModel.remove(req.params.id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
