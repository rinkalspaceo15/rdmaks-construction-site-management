import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('POST /api/sites/:siteId/attendance', () => {
  it('rejects a record with an invalid status with 400 and a clear message', async () => {
    const siteId = '00000000-0000-0000-0000-000000000000';
    const workerId = '00000000-0000-0000-0000-000000000001';
    const res = await request(app)
      .post(`/api/sites/${siteId}/attendance`)
      .send({
        date: '2026-01-01',
        records: [{ worker_id: workerId, status: 'bogus', overtime_hours: 0 }],
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'status must be one of present, absent, half_day',
    });
  });
});
