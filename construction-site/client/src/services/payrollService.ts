import api from './api';
import { PayrollSummary } from '../types';

export const getPayroll = (siteId: string, from: string, to: string) =>
  api.get<PayrollSummary>(`/sites/${siteId}/payroll`, { params: { from, to } });
