import { Router } from 'express';
import * as payrollModel from '../models/payroll';

const router = Router();

// GET /api/sites/:siteId/payroll?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/:siteId/payroll', async (req, res, next) => {
  try {
    const { siteId } = req.params;
    const { from, to } = req.query;
    if (!from || !to) {
      return res
        .status(400)
        .json({ error: 'from and to date query parameters are required' });
    }
    // ISO YYYY-MM-DD strings compare lexicographically in date order.
    if ((from as string) > (to as string)) {
      return res
        .status(400)
        .json({ error: 'from date must be on or before to date' });
    }
    const result = await payrollModel.getBySiteAndRange(
      siteId,
      from as string,
      to as string
    );
    const total = result.rows
      .reduce((sum, r) => sum + Number(r.wage), 0)
      .toFixed(2);
    res.json({ from, to, rows: result.rows, total });
  } catch (err) {
    next(err);
  }
});

export default router;
