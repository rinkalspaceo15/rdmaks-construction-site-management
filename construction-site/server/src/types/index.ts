export interface Site {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'completed' | 'on_hold';
  start_date: string;
  created_at: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  phone: string;
  daily_wage: number;
  created_at: string;
}

export interface Attendance {
  id: string;
  site_id: string;
  worker_id: string;
  date: string;
  status: 'present' | 'absent' | 'half_day';
  overtime_hours: number;
}

export interface Material {
  id: string;
  site_id: string;
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vendor: string;
  date: string;
}

export interface Expense {
  id: string;
  site_id: string;
  category: 'material' | 'labor' | 'transport' | 'misc';
  description: string;
  amount: number;
  date: string;
}

export interface DailyReport {
  id: string;
  site_id: string;
  date: string;
  weather: 'sunny' | 'rainy' | 'cloudy';
  summary: string;
  issues: string;
  created_at: string;
}

export interface CreateSiteInput {
  name: string;
  address?: string;
  status?: 'active' | 'completed' | 'on_hold';
  start_date?: string;
}

export interface CreateWorkerInput {
  name: string;
  role?: string;
  phone?: string;
  daily_wage?: number;
}

export interface AttendanceRecord {
  worker_id: string;
  status: 'present' | 'absent' | 'half_day';
  overtime_hours?: number;
}

export interface CreateMaterialInput {
  name: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  vendor?: string;
  date?: string;
}

export interface CreateExpenseInput {
  category: 'material' | 'labor' | 'transport' | 'misc';
  description?: string;
  amount: number;
  date?: string;
}

export interface CreateReportInput {
  date: string;
  weather?: 'sunny' | 'rainy' | 'cloudy';
  summary?: string;
  issues?: string;
}

// Payroll is computed (no table) from attendance + workers.daily_wage.
// DECIMAL aggregates come back from pg as strings; counts are cast to int.
export interface PayrollRow {
  worker_id: string;
  name: string;
  role: string;
  present_days: number;
  half_days: number;
  absent_days: number;
  overtime_hours: string;
  wage: string;
}
