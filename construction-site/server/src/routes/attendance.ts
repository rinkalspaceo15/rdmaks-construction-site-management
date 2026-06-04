import { Router } from 'express';
import * as attendanceModel from '../models/attendance';

const router = Router();

// GET /api/sites/:siteId/attendance?date=YYYY-MM-DD
router.get('/:siteId/attendance', async (req, res, next) => {
  try {
    const { siteId } = req.params;
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'date query parameter is required' });
    }
    const result = await attendanceModel.getBySiteAndDate(siteId, date as string);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/sites/:siteId/attendance
router.post('/:siteId/attendance', async (req, res, next) => {
  try {
    const { siteId } = req.params;
    const { date, records } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'records array is required and must not be empty' });
    }
    const results = await attendanceModel.markBulk(siteId, date, records);
    res.status(201).json(results);
  } catch (err) {
    next(err);
  }
});

export default router;
