import { Job } from '../types/job';
import { UserProfile } from '../types/user';

// Mock user profile
export const mockUserProfile: UserProfile = {
  id: 'user-1',
  email: 'admin@example.com',
  full_name: 'Admin User',
  role: 'admin',
  company_id: 'company-1',
  phone: '555-123-4567',
  is_active: true,
  created_at: '2023-06-01T00:00:00Z',
  updated_at: '2023-06-01T00:00:00Z'
};

// Mock jobs data
export const mockJobs: Job[] = [
  {
    id: 'job-1',
    title: 'HVAC Installation - City Center Office',
    status: 'in_progress',
    location: '123 Main St, Downtown',
    company_id: 'company-1',
    created_at: '2023-07-15T08:00:00Z',
    updated_at: '2023-07-15T08:00:00Z',
    description: 'Install new HVAC system in the main office area. Customer requested energy-efficient units with smart thermostats.',
    scheduled_end: '2023-07-22T23:59:59Z',
    assigned_to: 'user-2',
    priority: 'high',
    estimated_hours: 16,
    actual_hours: 0,
    estimated_cost: 3500,
    actual_cost: 0,
    created_by: 'user-1',
    scheduled_start: '2023-07-15T08:00:00Z',
    actual_start: null,
    actual_end: null,
    client_name: 'City Center LLC',
    client_phone: '555-987-6543',
    client_email: 'manager@citycenter.com',
    notes: 'Access code for building: 4321'
  },
  {
    id: 'job-2',
    title: 'Plumbing Repair - Riverside Apartments',
    status: 'pending',
    location: '456 River Ave, Westside',
    company_id: 'company-1',
    created_at: '2023-07-16T10:30:00Z',
    updated_at: '2023-07-16T10:30:00Z',
    description: 'Fix leaking pipes in units 101, 102, and 305. Water damage reported in ceiling of unit 101.',
    scheduled_end: '2023-07-20T23:59:59Z',
    assigned_to: 'user-3',
    priority: 'medium',
    estimated_hours: 8,
    actual_hours: 0,
    estimated_cost: 1200,
    actual_cost: 0,
    created_by: 'user-1',
    scheduled_start: '2023-07-18T09:00:00Z',
    actual_start: null,
    actual_end: null,
    client_name: 'Riverside Property Management',
    client_phone: '555-456-7890',
    client_email: 'maintenance@riverside.com',
    notes: 'Contact building manager for access to units.'
  },
  {
    id: 'job-3',
    title: 'Electrical Upgrade - Main St Cafe',
    status: 'completed',
    location: '789 Main St, Downtown',
    company_id: 'company-2',
    created_at: '2023-07-10T09:15:00Z',
    updated_at: '2023-07-15T16:00:00Z',
    description: 'Upgrade electrical panel to support new kitchen equipment. Add 4 new 20A circuits.',
    scheduled_end: '2023-07-15T23:59:59Z',
    assigned_to: 'user-4',
    priority: 'medium',
    estimated_hours: 6,
    actual_hours: 7.5,
    estimated_cost: 1800,
    actual_cost: 2100,
    created_by: 'user-2',
    scheduled_start: '2023-07-12T08:00:00Z',
    actual_start: '2023-07-12T08:30:00Z',
    actual_end: '2023-07-15T16:00:00Z',
    client_name: 'Main Street Cafe',
    client_phone: '555-789-0123',
    client_email: 'owner@mainstcafe.com',
    notes: 'Work must be done before opening hours (6 AM - 10 PM)'
  },
  {
    id: 'job-4',
    title: 'AC Repair - Lakeside Residence',
    status: 'cancelled',
    location: '321 Lake Dr, Eastside',
    company_id: 'company-1',
    created_at: '2023-07-05T14:00:00Z',
    updated_at: '2023-07-06T09:00:00Z',
    description: 'Diagnose and repair AC unit that is not cooling properly. Unit is 5 years old.',
    scheduled_end: '2023-07-08T23:59:59Z',
    assigned_to: 'user-2',
    priority: 'high',
    estimated_hours: 3,
    actual_hours: 0,
    estimated_cost: 350,
    actual_cost: 0,
    created_by: 'user-1',
    scheduled_start: '2023-07-08T10:00:00Z',
    actual_start: null,
    actual_end: null,
    client_name: 'John Homeowner',
    client_phone: '555-321-6547',
    client_email: 'john@example.com',
    notes: 'Cancelled by client - purchased new unit instead.'
  },
  {
    id: 'job-5',
    title: 'Roof Inspection - Highland School',
    status: 'pending',
    location: '555 Highland Ave, Northside',
    company_id: 'company-3',
    created_at: '2023-07-17T11:00:00Z',
    updated_at: '2023-07-17T11:00:00Z',
    description: 'Perform annual roof inspection and maintenance. Check for storm damage from recent weather.',
    scheduled_end: '2023-07-25T23:59:59Z',
    assigned_to: null,
    priority: 'low',
    estimated_hours: 4,
    actual_hours: 0,
    estimated_cost: 800,
    actual_cost: 0,
    created_by: 'user-3',
    scheduled_start: '2023-07-25T08:00:00Z',
    actual_start: null,
    actual_end: null,
    client_name: 'Highland School District',
    client_phone: '555-555-5555',
    client_email: 'facilities@highland.edu',
    notes: 'Coordinate with principal for access during summer break.'
  }
];

// Mock job status count data
export const mockJobStatusCounts = {
  pending: 3,
  in_progress: 2,
  completed: 1,
  cancelled: 1,
  total: 7
};

// Mock labor hours data
export const mockLaborData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: {
    actual: [4.5, 6.2, 7.0, 5.5, 8.0, 3.0, 0],
    projected: [5.0, 6.0, 6.0, 5.0, 7.0, 3.0, 0]
  }
};

// Mock labor entries
export const mockLaborEntries = [
  {
    id: 'entry-1',
    start_time: '2023-07-15T09:00:00Z',
    end_time: '2023-07-15T13:30:00Z',
    hours: 4.5,
    hourly_rate: 65,
    total_cost: 292.5,
    break_duration: 30,
    notes: 'Initial HVAC assessment and planning',
    is_approved: true,
    approved_by: 'user-1',
    user: { id: 'user-2', name: 'John Technician' },
    job: { id: 'job-1', title: 'HVAC Installation - City Center Office' },
    created_at: '2023-07-15T13:35:00Z',
    updated_at: '2023-07-15T14:00:00Z'
  },
  {
    id: 'entry-2',
    start_time: '2023-07-16T08:30:00Z',
    end_time: '2023-07-16T15:00:00Z',
    hours: 6.5,
    hourly_rate: 65,
    total_cost: 422.5,
    break_duration: 60,
    notes: 'HVAC installation work - day 1',
    is_approved: false,
    approved_by: null,
    user: { id: 'user-2', name: 'John Technician' },
    job: { id: 'job-1', title: 'HVAC Installation - City Center Office' },
    created_at: '2023-07-16T15:05:00Z',
    updated_at: '2023-07-16T15:05:00Z'
  },
  {
    id: 'entry-3',
    start_time: '2023-07-15T10:00:00Z',
    end_time: '2023-07-15T14:00:00Z',
    hours: 4.0,
    hourly_rate: 75,
    total_cost: 300,
    break_duration: 15,
    notes: 'Diagnosed generator requirements, ordered parts',
    is_approved: true,
    approved_by: 'user-1',
    user: { id: 'user-3', name: 'Sarah Engineer' },
    job: { id: 'job-6', title: 'Generator Installation - Medical Clinic' },
    created_at: '2023-07-15T14:05:00Z',
    updated_at: '2023-07-15T16:30:00Z'
  }
];

// Update job service to use mock data if Supabase is not connected
export const getJobStatusCounts = async () => {
  try {
    // Check if Supabase is initialized properly
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // If not properly initialized or in development/test, use mock data
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-project-url') {
      return { data: mockJobStatusCounts, error: null };
    }
    
    // Otherwise, call the actual service (will be handled by the jobService)
    throw new Error('Supabase service should be called instead');
  } catch (error) {
    console.log('Using mock job status counts due to Supabase connection issue');
    return { data: mockJobStatusCounts, error: null };
  }
};

// Update job service to use mock data if Supabase is not connected
export const fetchJobs = async () => {
  try {
    // Check if Supabase is initialized properly
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // If not properly initialized or in development/test, use mock data
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-project-url') {
      return { data: mockJobs, error: null };
    }
    
    // Otherwise, call the actual service (will be handled by the jobService)
    throw new Error('Supabase service should be called instead');
  } catch (error) {
    console.log('Using mock jobs due to Supabase connection issue');
    return { data: mockJobs, error: null };
  }
};

// Update labor service to use mock data if Supabase is not connected
export const getLaborStatistics = async () => {
  try {
    // Check if Supabase is initialized properly
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // If not properly initialized or in development/test, use mock data
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-project-url') {
      return { data: mockLaborData, error: null };
    }
    
    // Otherwise, call the actual service (will be handled by the laborService)
    throw new Error('Supabase service should be called instead');
  } catch (error) {
    console.log('Using mock labor data due to Supabase connection issue');
    return { data: mockLaborData, error: null };
  }
};

export const fetchLaborEntries = async () => {
  try {
    // Check if Supabase is initialized properly
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // If not properly initialized or in development/test, use mock data
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-project-url') {
      return { data: mockLaborEntries, error: null };
    }
    
    // Otherwise, call the actual service
    throw new Error('Supabase service should be called instead');
  } catch (error) {
    console.log('Using mock labor entries due to Supabase connection issue');
    return { data: mockLaborEntries, error: null };
  }
};

export const createLaborEntry = async (data: any) => {
  try {
    // Mock successful creation
    const newEntry = {
      id: `entry-${Date.now()}`,
      start_time: data.startTime,
      end_time: data.endTime || null,
      hours: data.endTime ? calculateHours(data.startTime, data.endTime) : null,
      hourly_rate: data.hourlyRate || 0,
      total_cost: data.endTime ? (calculateHours(data.startTime, data.endTime) * (data.hourlyRate || 0)) : 0,
      break_duration: data.breakDuration || 0,
      notes: data.notes || null,
      is_approved: false,
      approved_by: null,
      user: { id: 'user-1', name: mockUserProfile.full_name },
      job: { id: data.jobId, title: 'Job Title' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return { data: newEntry, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Helper function to calculate hours between two datetime strings
function calculateHours(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}