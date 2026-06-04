import api from './api';
import { DailyReport } from '../types';

export const getReports = (siteId: string) =>
  api.get<DailyReport[]>(`/sites/${siteId}/reports`);

export const getReport = (siteId: string, id: string) =>
  api.get<DailyReport>(`/sites/${siteId}/reports/${id}`);

export const createReport = (siteId: string, data: Partial<DailyReport>) =>
  api.post<DailyReport>(`/sites/${siteId}/reports`, data);

export const updateReport = (id: string, data: Partial<DailyReport>) =>
  api.put<DailyReport>(`/reports/${id}`, data);
