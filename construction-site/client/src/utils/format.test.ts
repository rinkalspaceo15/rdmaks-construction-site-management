import { describe, it, expect } from 'vitest';
import { formatINR } from './format';

describe('formatINR', () => {
  it('formats one lakh with Indian grouping and ₹ prefix', () => {
    expect(formatINR(100000)).toBe('₹1,00,000');
  });
});
