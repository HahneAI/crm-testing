import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../services/supabase';
import { Job, JobFilters, JobStatus } from '../../../types/crm';

export const JobList: React.FC = () => {
  const { userProfile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({});

  useEffect(() => {
    if (userProfile?.company_id) {
      loadJobs();
    }
  }, [userProfile, filters]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          clients(*),
          job_materials(*),
          labor_entries(
            id,
            hours,
            hourly_rate,
            users(first_name, last_name)
          )
        `)
        .eq('company_id', userProfile.company_id);

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }
      if (filters.assigned_to) {
        query = query.contains('assigned_to', [filters.assigned_to]);
      }
      if (filters.start_date) {
        query = query.gte('start_date', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('end_date', filters.end_date);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, status: JobStatus) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;
      await loadJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const calculateJobProfit = (job: Job): number => {
    const laborCost = job.labor_entries?.reduce((sum, entry) =>
      sum + (entry.hours * entry.hourly_rate), 0) || 0;
    const materialCost = job.job_materials?.reduce((sum, material) =>
      sum + (material.quantity * material.unit_cost), 0) || 0;

    return (job.budget || 0) - laborCost - materialCost;
  };

  const getStatusColor = (status: JobStatus): string => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'on_hold': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="job-list">
      {/* Filter Controls */}
      <JobFilters filters={filters} onFiltersChange={setFilters} />

      {/* Job Cards/Table */}
      {loading ? (
        <div className="text-center py-8">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No jobs found matching your filters.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {job.clients?.name} • Created {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <JobStatusDropdown
                    currentStatus={job.status}
                    onStatusChange={(status) => updateJobStatus(job.id, status)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Budget</span>
                  <p className="font-medium">${job.budget?.toLocaleString() || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Progress</span>
                  <p className="font-medium">{job.actual_hours || 0}h / {job.estimated_hours || 0}h</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Profit</span>
                  <p className={`font-medium ${calculateJobProfit(job) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${calculateJobProfit(job).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Due Date</span>
                  <p className="font-medium">
                    {job.end_date ? new Date(job.end_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>

              {job.description && (
                <p className="text-sm text-gray-600 mb-4">{job.description}</p>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Materials: {job.job_materials?.length || 0}</span>
                  <span>Labor Entries: {job.labor_entries?.length || 0}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                    View Details
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    Edit Job
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
