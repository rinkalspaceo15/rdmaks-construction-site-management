import { Router } from 'express';
import * as attendanceModel from '../models/attendance';

const router = Router();

// PUT /api/attendance/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, overtime_hours } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }
    const result = await attendanceModel.updateById(id, status, overtime_hours ?? 0);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
