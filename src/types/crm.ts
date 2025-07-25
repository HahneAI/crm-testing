export interface Client {
    id: string;
    company_id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: Address;
    client_type: 'residential' | 'commercial';
    status: 'active' | 'inactive' | 'prospect';
    created_at: string;
    updated_at: string;
    client_contacts?: ClientContact[];
    jobs?: Job[];
    billing_address?: Address | null;
    notes?: string;
    preferred_contact_method?: 'email' | 'phone' | 'text';
  }

  export interface ClientContact {
    id: string;
    client_id: string;
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    is_primary: boolean;
  }

  export interface Address {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  }

  export interface ClientFilters {
    status?: 'active' | 'inactive' | 'prospect';
    type?: 'residential' | 'commercial';
  }

  export type ClientSortOptions = 'name' | 'recent' | 'created_at';

  export interface Job {
    id: string;
    company_id: string;
    client_id: string;
    title: string;
    description?: string;
    status: JobStatus;
    budget?: number;
    start_date?: string;
    end_date?: string;
    created_at: string;
    updated_at: string;
    clients?: Client;
    job_materials?: JobMaterial[];
    labor_entries?: LaborEntry[];
    assigned_to?: string[];
    actual_hours?: number;
    estimated_hours?: number;
  }

  export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

  export interface JobFilters {
    status?: JobStatus[];
    client_id?: string;
    assigned_to?: string;
    start_date?: string;
    end_date?: string;
  }

  export interface JobMaterial {
    id: string;
    job_id: string;
    material_id: string;
    quantity: number;
    unit_cost: number;
  }

  export interface LaborEntry {
    id: string;
    job_id: string;
    user_id: string;
    hours: number;
    hourly_rate: number;
    date: string;
    users?: { first_name: string; last_name: string };
  }

  export interface Material {
    id: string;
    company_id: string;
    name: string;
    current_stock: number;
  }
