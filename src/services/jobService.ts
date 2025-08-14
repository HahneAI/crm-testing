import { getSupabase, handleSupabaseError } from './supabase';
import { Job, JobsFilter } from '../types/job';

export const fetchJobs = async (filters?: JobsFilter) => {
  try {
    const supabase = getSupabase();
    
    let query = supabase
      .from('jobs')
      .select(`
        *,
        assigned_user:users(id, full_name, email)
      `);
    
    // Apply filters
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      
      if (filters.dateRange) {
        const now = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            const today = now.toISOString().split('T')[0];
            query = query.eq('scheduled_end', today);
            break;
          
          case 'this_week': {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            query = query.gte('scheduled_end', startOfWeek.toISOString().split('T')[0])
                         .lte('scheduled_end', endOfWeek.toISOString().split('T')[0]);
            break;
          }
          
          case 'this_month': {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            query = query.gte('scheduled_end', startOfMonth.toISOString().split('T')[0])
                         .lte('scheduled_end', endOfMonth.toISOString().split('T')[0]);
            break;
          }
          
          case 'overdue':
            query = query.lt('scheduled_end', now.toISOString().split('T')[0])
                         .not('status', 'eq', 'completed')
                         .not('status', 'eq', 'cancelled');
            break;
        }
      }
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return { data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const fetchJobById = async (id: string) => {
  try {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        assigned_user:users!jobs_assigned_to_fkey(id, full_name, email),
        created_by_user:users!jobs_created_by_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return { data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const createJob = async (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('jobs')
      .insert(job)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return { data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const updateJob = async (id: string, updates: Partial<Job>) => {
  try {
    const supabase = getSupabase();
    
    // Set updated_at timestamp
    updates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return { data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const deleteJob = async (id: string) => {
  try {
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const getJobStatusCounts = async () => {
  try {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('jobs')
      .select('status');
    
    if (error) {
      throw error;
    }
    
    const counts = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      total: data.length
    };
    
    data.forEach(job => {
      if (job.status in counts) {
        counts[job.status as keyof typeof counts] += 1;
      }
    });
    
    return { data: counts };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Fetch job photos
export const fetchJobPhotos = async (jobId: string) => {
  try {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('job_photos')
      .select(`
        *,
        photographer:users(id, full_name)
      `)
      .eq('job_id', jobId)
      .order('taken_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return { data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Add a job photo
export const addJobPhoto = async (photo: {
  job_id: string;
  photo_url: string;
  caption?: string;
  taken_by: string;
  taken_at?: string;
}) => {
  try {
    const supabase = getSupabase();
    
    // Set taken_at to now if not provided
    if (!photo.taken_at) {
      photo.taken_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('job_photos')
      .insert(photo)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return { data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Delete a job photo
export const deleteJobPhoto = async (photoId: string) => {
  try {
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('job_photos')
      .delete()
      .eq('id', photoId);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    return handleSupabaseError(error);
  }
};