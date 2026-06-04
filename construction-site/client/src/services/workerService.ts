import api from './api';
import { Worker } from '../types';

export const getWorkers = () => api.get<Worker[]>('/workers');
export const getWorker = (id: string) => api.get<Worker>(`/workers/${id}`);
export const createWorker = (data: Partial<Worker>) => api.post<Worker>('/workers', data);
export const updateWorker = (id: string, data: Partial<Worker>) => api.put<Worker>(`/workers/${id}`, data);
export const deleteWorker = (id: string) => api.delete(`/workers/${id}`);
