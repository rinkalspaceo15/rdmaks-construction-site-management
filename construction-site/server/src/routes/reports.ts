import { Router } from 'express';
import * as reportsModel from '../models/reports';

const ALLOWED_WEATHER = ['sunny', 'rainy', 'cloudy'] as const;

const router = Router();

router.get('/:siteId/reports', async (req, res, next) => {
  try {
    const result = await reportsModel.getBySite(req.params.siteId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:siteId/reports/:id', async (req, res, next) => {
  try {
    const result = await reportsModel.getById(req.params.id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/:siteId/reports', async (req, res, next) => {
  try {
    const { date, weather } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    if (weather !== undefined && !ALLOWED_WEATHER.includes(weather)) {
      return res.status(400).json({
        error: `weather must be one of ${ALLOWED_WEATHER.join(', ')}`,
      });
    }
    const result = await reportsModel.create(req.params.siteId, req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
