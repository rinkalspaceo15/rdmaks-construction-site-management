import { Router } from 'express';
import * as reportsModel from '../models/reports';

const router = Router();

router.put('/:id', async (req, res, next) => {
  try {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    const result = await reportsModel.update(req.params.id, req.body);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
