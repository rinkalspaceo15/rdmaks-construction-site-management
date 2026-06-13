import api from './api';
import { Worker, WorkerInput } from '../types';

export const getWorkers = () => api.get<Worker[]>('/workers');
export const getWorker = (id: string) => api.get<Worker>(`/workers/${id}`);
export const createWorker = (data: WorkerInput) => api.post<Worker>('/workers', data);
export const updateWorker = (id: string, data: WorkerInput) => api.put<Worker>(`/workers/${id}`, data);
export const deleteWorker = (id: string) => api.delete(`/workers/${id}`);
