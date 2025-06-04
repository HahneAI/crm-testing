import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { PlusCircle, Calendar, ChevronDown } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LaborHoursChart from '../../components/dashboard/LaborHoursChart';
import TimeEntryForm, { TimeEntryData } from '../../components/labor/TimeEntryForm';
import LoadingScreen from '../../components/common/LoadingScreen';
import { fetchLaborEntries, getLaborStatistics, createLaborEntry } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';

const Labor = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [laborEntries, setLaborEntries] = useState<any[]>([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: {
      actual: [],
      projected: []
    }
  });
  
  useEffect(() => {
    loadLaborData();
  }, [timeframe]);
  
  const loadLaborData = async () => {
    try {
      setLoading(true);
      
      // Fetch labor entries
      const { data: entriesData, error: entriesError } = await fetchLaborEntries();
      if (entriesError) throw entriesError;
      if (entriesData) setLaborEntries(entriesData);
      
      // Fetch labor statistics for the chart
      const { data: statsData, error: statsError } = await getLaborStatistics();
      if (statsError) throw statsError;
      if (statsData) setChartData(statsData);
      
    } catch (error) {
      console.error('Error loading labor data:', error);
      toast.error('Failed to load labor data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTimeEntrySubmit = async (data: TimeEntryData) => {
    if (!user) {
      toast.error('You must be logged in to submit time entries');
      return;
    }
    
    try {
      const { data: entryData, error } = await createLaborEntry(data);
      
      if (error) throw error;
      
      toast.success('Time entry added successfully');
      setShowForm(false);
      
      // Reload labor data
      loadLaborData();
    } catch (error) {
      console.error('Error submitting time entry:', error);
      toast.error('Failed to submit time entry');
    }
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  const totalHours = laborEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
  
  return (
    <DashboardLayout title="Labor Hours">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Labor Hours</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage time spent on jobs</p>
          </div>
          
          <Button
            variant="primary"
            leftIcon={<PlusCircle size={18} />}
            onClick={() => setShowForm(!showForm)}
          >
            Log Time
          </Button>
        </div>
        
        {/* Time Entry Form */}
        {showForm && (
          <div className="mb-6">
            <TimeEntryForm onSubmit={handleTimeEntrySubmit} />
          </div>
        )}
        
        {/* Labor Hours Summary */}
        <Card title="Labor Hours Summary" className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <p className="text-3xl font-bold">{totalHours.toFixed(1)} hours</p>
              <p className="text-gray-500 dark:text-gray-400">Total hours logged</p>
            </div>
            
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={16} className="inline mr-1" />
                View:
              </span>
              <div className="relative">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'year')}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-64">
            <LaborHoursChart data={chartData} />
          </div>
        </Card>
        
        {/* Recent Time Entries */}
        <Card title="Recent Time Entries">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hours</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {laborEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                      No time entries found
                    </td>
                  </tr>
                ) : (
                  laborEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 whitespace-nowrap">{entry.user.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{entry.job.title}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(entry.start_time).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{entry.hours?.toFixed(1) || 'In progress'}</td>
                      <td className="px-4 py-3 truncate max-w-xs">{entry.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Labor;