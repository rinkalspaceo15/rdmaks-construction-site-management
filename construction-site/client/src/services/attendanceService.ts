import api from './api';
import { Attendance } from '../types';

export const getAttendance = (siteId: string, date: string) =>
  api.get<Attendance[]>(`/sites/${siteId}/attendance?date=${date}`);

export const markAttendance = (
  siteId: string,
  data: { date: string; records: Array<{ worker_id: string; status: string; overtime_hours?: number }> }
) => api.post<Attendance[]>(`/sites/${siteId}/attendance`, data);

export const updateAttendance = (id: string, data: { status: string; overtime_hours?: number }) =>
  api.put<Attendance>(`/attendance/${id}`, data);
