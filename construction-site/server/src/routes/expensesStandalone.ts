import { Router } from 'express';
import * as expensesModel from '../models/expenses';

const router = Router();

// PUT /api/expenses/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { category, description, amount, date } = req.body;
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    const result = await expensesModel.update(req.params.id, { category, description, amount, date });
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await expensesModel.remove(req.params.id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
