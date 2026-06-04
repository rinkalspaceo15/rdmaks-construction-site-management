import api from './api';
import { Site } from '../types';

export const getSites = () => api.get<Site[]>('/sites');
export const getSite = (id: string) => api.get<Site>(`/sites/${id}`);
export const createSite = (data: Partial<Site>) => api.post<Site>('/sites', data);
export const updateSite = (id: string, data: Partial<Site>) => api.put<Site>(`/sites/${id}`, data);
export const deleteSite = (id: string) => api.delete(`/sites/${id}`);
