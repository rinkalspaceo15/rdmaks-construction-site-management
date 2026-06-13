import api from './api';
import { Material, MaterialInput } from '../types';

export const getMaterials = (siteId: string) =>
  api.get<Material[]>(`/sites/${siteId}/materials`);

export const createMaterial = (siteId: string, data: MaterialInput) =>
  api.post<Material>(`/sites/${siteId}/materials`, data);

export const updateMaterial = (id: string, data: MaterialInput) =>
  api.put<Material>(`/materials/${id}`, data);

export const deleteMaterial = (id: string) => api.delete(`/materials/${id}`);
