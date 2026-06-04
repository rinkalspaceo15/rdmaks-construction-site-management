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
