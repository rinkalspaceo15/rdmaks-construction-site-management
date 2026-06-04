import { Router } from 'express';
import * as expensesModel from '../models/expenses';

const router = Router();

// GET /api/sites/:siteId/expenses
router.get('/:siteId/expenses', async (req, res, next) => {
  try {
    const result = await expensesModel.getBySite(req.params.siteId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/sites/:siteId/expenses
router.post('/:siteId/expenses', async (req, res, next) => {
  try {
    const { category, description, amount, date } = req.body;
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    const result = await expensesModel.create(req.params.siteId, { category, description, amount, date });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
