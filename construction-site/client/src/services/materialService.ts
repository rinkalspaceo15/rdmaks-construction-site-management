import api from './api';
import { Material } from '../types';

export const getMaterials = (siteId: string) =>
  api.get<Material[]>(`/sites/${siteId}/materials`);

export const createMaterial = (siteId: string, data: Partial<Material>) =>
  api.post<Material>(`/sites/${siteId}/materials`, data);

export const updateMaterial = (id: string, data: Partial<Material>) =>
  api.put<Material>(`/materials/${id}`, data);

export const deleteMaterial = (id: string) => api.delete(`/materials/${id}`);
