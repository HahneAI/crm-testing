import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { PlusCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import JobsFilter, { FilterState } from '../../components/jobs/JobsFilter';
import JobListItem from '../../components/jobs/JobListItem';
import LoadingScreen from '../../components/common/LoadingScreen';
import { Job } from '../../types/job';
import { fetchJobs } from '../../services/mockData';

const Jobs = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    priority: '',
    dateRange: ''
  });
  
  useEffect(() => {
    loadJobs();
  }, []);
  
  const loadJobs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await fetchJobs();
      
      if (error) throw error;
      
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    
    // For demo purposes, we're just filtering the mock data client-side
    loadJobs();
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <DashboardLayout title="Jobs">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Jobs</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track your service jobs</p>
          </div>
          
          <Button
            variant="primary"
            leftIcon={<PlusCircle size={18} />}
          >
            Create Job
          </Button>
        </div>
        
        {/* Filters */}
        <JobsFilter onFilter={handleFilterChange} />
        
        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No jobs found</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {filters.search || filters.status || filters.priority || filters.dateRange
                  ? 'Try changing your filters or create a new job.'
                  : 'Get started by creating your first job.'}
              </p>
              <div className="mt-4">
                <Button
                  variant="primary"
                  leftIcon={<PlusCircle size={18} />}
                >
                  Create Job
                </Button>
              </div>
            </div>
          ) : (
            jobs.map(job => (
              <JobListItem key={job.id} job={job} />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Jobs;