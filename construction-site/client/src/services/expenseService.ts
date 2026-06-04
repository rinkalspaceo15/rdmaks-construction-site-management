import api from './api';
import { Expense } from '../types';

export const getExpenses = (siteId: string) =>
  api.get<Expense[]>(`/sites/${siteId}/expenses`);

export const createExpense = (siteId: string, data: Partial<Expense>) =>
  api.post<Expense>(`/sites/${siteId}/expenses`, data);

export const updateExpense = (id: string, data: Partial<Expense>) =>
  api.put<Expense>(`/expenses/${id}`, data);

export const deleteExpense = (id: string) => api.delete(`/expenses/${id}`);
