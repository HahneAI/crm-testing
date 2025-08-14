import { useEffect, useState } from 'react';
import { LayoutDashboard, Clock, Package, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatsCard from '../../components/dashboard/StatsCard';
import JobStatusCard from '../../components/dashboard/JobStatusCard';
import RecentJobsList from '../../components/dashboard/RecentJobsList';
import LaborHoursChart from '../../components/dashboard/LaborHoursChart';
import LoadingScreen from '../../components/common/LoadingScreen';
import { useAuth } from '../../context/AuthContext';
import { getJobStatusCounts, fetchJobs, getLaborStatistics } from '../../services/mockData';

const Dashboard = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [jobStats, setJobStats] = useState({
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    total: 0
  });
  const [laborHoursData, setLaborHoursData] = useState({
    labels: [],
    datasets: {
      actual: [],
      projected: []
    }
  });
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch job status counts
        const { data: statusData, error: statusError } = await getJobStatusCounts();
        if (statusError) throw statusError;
        if (statusData) setJobStats(statusData);
        
        // Fetch recent jobs
        const { data: jobsData, error: jobsError } = await fetchJobs();
        if (jobsError) throw jobsError;
        if (jobsData) setRecentJobs(jobsData.slice(0, 5));
        
        // Fetch labor hours data
        const { data: laborData, error: laborError } = await getLaborStatistics();
        if (laborError) throw laborError;
        if (laborData) setLaborHoursData(laborData);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  // Prepare job status data for the job status card
  const jobStatusData = [
    { name: 'Pending', count: jobStats.pending, color: 'bg-gray-400' },
    { name: 'In Progress', count: jobStats.in_progress, color: 'bg-primary-500' },
    { name: 'Completed', count: jobStats.completed, color: 'bg-success-500' },
    { name: 'Cancelled', count: jobStats.cancelled, color: 'bg-error-500' },
  ];
  
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome message */}
        <div>
          <h1 className="text-2xl font-bold">Welcome, {userProfile?.full_name || 'User'}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's an overview of your field service operations</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Jobs"
            value={jobStats.total}
            icon={<Briefcase size={24} />}
            trend={8}
            trendLabel="vs last month"
          />
          <StatsCard
            title="In Progress"
            value={jobStats.in_progress}
            icon={<LayoutDashboard size={24} />}
            trend={15}
            trendLabel="vs last month"
          />
          <StatsCard
            title="Labor Hours"
            value="164.5"
            subtitle="This month"
            icon={<Clock size={24} />}
            trend={-3}
            trendLabel="vs last month"
          />
          <StatsCard
            title="Materials Used"
            value="$12,480"
            subtitle="This month"
            icon={<Package size={24} />}
            trend={5}
            trendLabel="vs last month"
          />
        </div>
        
        {/* Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Labor Hours Chart */}
          <div className="lg:col-span-2">
            <LaborHoursChart data={laborHoursData} />
          </div>
          
          {/* Job Status */}
          <div>
            <JobStatusCard 
              statuses={jobStatusData} 
              total={jobStats.total} 
            />
          </div>
        </div>
        
        {/* Recent Jobs */}
        <div>
          <RecentJobsList jobs={recentJobs} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;