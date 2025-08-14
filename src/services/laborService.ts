import { getSupabase, handleSupabaseError } from './supabase';
import { TimeEntryData } from '../components/labor/TimeEntryForm';

export const fetchLaborEntries = async (filters?: { userId?: string; jobId?: string; startDate?: string; endDate?: string }) => {
  try {
    const supabase = getSupabase();
    
    let query = supabase
      .from('labor_entries')
      .select(`
        *,
        user:users(id, full_name),
        job:jobs(id, title)
      `);
    
    // Apply filters
    if (filters) {
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters.jobId) {
        query = query.eq('job_id', filters.jobId);
      }
      
      if (filters.startDate) {
        query = query.gte('start_time', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('start_time', filters.endDate);
      }
    }
    
    const { data, error } = await query.order('start_time', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return { data };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const createLaborEntry = async (entry: TimeEntryData, userId: string) => {
  try {
    const supabase = getSupabase();
    
    // Calculate hours if both start and end time are provided
    let hours = null;
    let totalCost = null;
    
    if (entry.startTime && entry.endTime) {
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);
      const diffMs = end.getTime() - start.getTime();
      hours = diffMs / (1000 * 60 * 60); // Convert ms to hours
      
      // Calculate total cost if hourly rate is provided
      if (entry.hourlyRate) {
        totalCost = hours * entry.hourlyRate;
      }
    }
    
    const { data, error } = await supabase
      .from('labor_entries')
      .insert({
        user_id: userId,
        job_id: entry.jobId,
        start_time: entry.startTime,
        end_time: entry.endTime || null,
        hours,
        hourly_rate: entry.hourlyRate || null,
        total_cost: totalCost,
        break_duration: entry.breakDuration || 0,
        notes: entry.notes,
        is_approved: false
      })
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

export const updateLaborEntry = async (id: string, updates: Partial<TimeEntryData>) => {
  try {
    const supabase = getSupabase();
    
    // Get current entry to use for calculations if needed
    const { data: currentEntry, error: fetchError } = await supabase
      .from('labor_entries')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Calculate hours if both start and end time are available
    let hours = currentEntry.hours;
    let totalCost = currentEntry.total_cost;
    
    const startTime = updates.startTime || currentEntry.start_time;
    const endTime = updates.endTime !== undefined ? updates.endTime : currentEntry.end_time;
    const hourlyRate = updates.hourlyRate !== undefined ? updates.hourlyRate : currentEntry.hourly_rate;
    
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end.getTime() - start.getTime();
      hours = diffMs / (1000 * 60 * 60); // Convert ms to hours
      
      // Calculate total cost if hourly rate is available
      if (hourlyRate) {
        totalCost = hours * hourlyRate;
      }
    }
    
    const updateData: any = {};
    
    if (updates.startTime) updateData.start_time = updates.startTime;
    if (updates.endTime !== undefined) updateData.end_time = updates.endTime || null;
    if (hours !== null) updateData.hours = hours;
    if (updates.hourlyRate !== undefined) updateData.hourly_rate = updates.hourlyRate;
    if (totalCost !== null) updateData.total_cost = totalCost;
    if (updates.breakDuration !== undefined) updateData.break_duration = updates.breakDuration;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    
    // Update the timestamp
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('labor_entries')
      .update(updateData)
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

export const deleteLaborEntry = async (id: string) => {
  try {
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('labor_entries')
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

export const getLaborStatistics = async (timeframe = 'week') => {
  try {
    const supabase = getSupabase();
    
    // Get current date
    const now = new Date();
    let startDate;
    let intervalType: 'day' | 'week' | 'month' = 'day';
    
    // Calculate start date based on timeframe
    switch (timeframe) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        intervalType = 'week';
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        intervalType = 'month';
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }
    
    // Format for Supabase query
    const startDateStr = startDate.toISOString();
    
    // Get labor entries for the time period
    const { data, error } = await supabase
      .from('labor_entries')
      .select('*')
      .gte('start_time', startDateStr)
      .order('start_time', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Process data for chart
    const laborData = {
      labels: [] as string[],
      datasets: {
        actual: [] as number[],
        projected: [] as number[],
      }
    };
    
    // Get labels based on timeframe
    const labelFormat = timeframe === 'week' ? 'EEE' : timeframe === 'month' ? 'MMM d' : 'MMM';
    
    // Generate labels and empty data points
    let current = new Date(startDate);
    const endDate = new Date(now);
    
    while (current <= endDate) {
      // Format the date for display
      const label = current.toLocaleDateString('en-US', { 
        weekday: timeframe === 'week' ? 'short' : undefined,
        month: 'short',
        day: timeframe !== 'year' ? 'numeric' : undefined,
      });
      
      laborData.labels.push(label);
      
      // Initialize with zero hours
      laborData.datasets.actual.push(0);
      
      // Next interval
      if (timeframe === 'week') {
        current.setDate(current.getDate() + 1);
      } else if (timeframe === 'month') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }
    
    // Fill in actual hours
    data.forEach(entry => {
      if (entry.hours) {
        const entryDate = new Date(entry.start_time);
        let index;
        
        if (timeframe === 'week') {
          // Calculate days since start
          const dayDiff = Math.floor((entryDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          index = dayDiff;
        } else if (timeframe === 'month') {
          // Calculate weeks since start
          const weekDiff = Math.floor((entryDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
          index = weekDiff;
        } else {
          // Calculate months since start
          const monthDiff = (entryDate.getFullYear() - startDate.getFullYear()) * 12 + 
                           (entryDate.getMonth() - startDate.getMonth());
          index = monthDiff;
        }
        
        if (index >= 0 && index < laborData.datasets.actual.length) {
          laborData.datasets.actual[index] += entry.hours;
        }
      }
    });
    
    // Generate projected data
    // For simplicity, using a basic projection based on average of actual hours
    const actualTotal = laborData.datasets.actual.reduce((sum, hours) => sum + hours, 0);
    const actualAvg = actualTotal / laborData.datasets.actual.filter(h => h > 0).length || 0;
    
    laborData.datasets.projected = laborData.datasets.actual.map((hours, i) => {
      // For past days, use actual hours
      if (i < laborData.datasets.actual.length - 1) {
        return hours;
      }
      // For current day and future, use projection based on average
      return actualAvg;
    });
    
    return { data: laborData };
  } catch (error) {
    return handleSupabaseError(error);
  }
};