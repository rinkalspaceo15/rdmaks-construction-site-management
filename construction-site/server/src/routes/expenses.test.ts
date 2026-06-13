import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('POST /api/sites/:siteId/expenses', () => {
  it('rejects an invalid category with 400 and a clear message', async () => {
    const siteId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .post(`/api/sites/${siteId}/expenses`)
      .send({ category: 'bogus', description: 'test', amount: 100, date: '2026-01-01' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'category must be one of material, labor, transport, misc',
    });
  });
});
