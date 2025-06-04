export interface Job {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent' | null;
  location: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  company_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface JobsFilter {
  status?: string;
  priority?: string;
  search?: string;
  dateRange?: string;
  assignedTo?: string;
}