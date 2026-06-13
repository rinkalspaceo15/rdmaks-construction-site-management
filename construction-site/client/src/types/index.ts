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
  // DECIMAL — pg driver returns as string; convert with Number() for math
  daily_wage: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  site_id: string;
  worker_id: string;
  date: string;
  status: 'present' | 'absent' | 'half_day';
  // DECIMAL — pg driver returns as string; convert with Number() for math
  overtime_hours: string;
}

export interface Material {
  id: string;
  site_id: string;
  name: string;
  // DECIMAL — pg driver returns as string; convert with Number() for math
  quantity: string;
  unit: string;
  // DECIMAL — pg driver returns as string; convert with Number() for math
  unit_price: string;
  vendor: string;
  date: string;
}

export interface Expense {
  id: string;
  site_id: string;
  category: 'material' | 'labor' | 'transport' | 'misc';
  description: string;
  // DECIMAL — pg driver returns as string; convert with Number() for math
  amount: string;
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

// Request-body shapes for create/update endpoints. DECIMAL fields travel as
// `number` on the way out (forms convert via `Number(form.x)` before sending);
// the GET responses come back with DECIMALs as `string` per the pg driver.
export interface WorkerInput {
  name: string;
  role?: string;
  phone?: string;
  daily_wage?: number;
}

export interface MaterialInput {
  name: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  vendor?: string;
  date?: string;
}

export interface ExpenseInput {
  category: 'material' | 'labor' | 'transport' | 'misc';
  description?: string;
  amount: number;
  date?: string;
}

// Payroll is computed server-side from attendance + workers.daily_wage.
// DECIMAL aggregates (overtime_hours, wage, total) arrive as strings (pg driver);
// counts arrive as numbers (cast to int server-side).
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

export interface PayrollSummary {
  from: string;
  to: string;
  rows: PayrollRow[];
  total: string;
}
