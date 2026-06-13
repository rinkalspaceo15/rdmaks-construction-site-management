import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('POST /api/sites/:siteId/reports', () => {
  it('rejects an invalid weather with 400 and a clear message', async () => {
    const siteId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .post(`/api/sites/${siteId}/reports`)
      .send({ date: '2026-01-01', weather: 'snowy', summary: 'x', issues: 'y' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'weather must be one of sunny, rainy, cloudy',
    });
  });
});
