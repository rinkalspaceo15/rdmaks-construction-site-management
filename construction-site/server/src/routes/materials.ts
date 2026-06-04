import { Router } from 'express';
import * as materialsModel from '../models/materials';

const router = Router();

router.get('/:siteId/materials', async (req, res, next) => {
  try {
    const result = await materialsModel.getBySite(req.params.siteId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post('/:siteId/materials', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const result = await materialsModel.create(req.params.siteId, req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
