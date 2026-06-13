import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('POST /api/sites', () => {
  it('rejects an invalid status with 400 and a clear message', async () => {
    const res = await request(app)
      .post('/api/sites')
      .send({ name: 'Test Site', status: 'bogus' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'status must be one of active, completed, on_hold',
    });
  });
});
