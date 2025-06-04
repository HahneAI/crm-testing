import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const MobileJobView = () => {
  const { id } = useParams();
  
  // Mock data - in a real app, this would come from your API/Supabase
  const job = {
    id,
    title: "HVAC Repair - Downtown Office",
    status: "in_progress",
    priority: "high",
    location: "123 Main St, Downtown",
    description: "Fix the AC unit in the server room. Unit is not cooling properly and making unusual noises.",
    scheduled_end: "2023-08-15T23:59:59Z",
    assigned_to: "John Smith"
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="mb-4 flex items-center">
        <Link to="/jobs" className="mr-2">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold">Job Details</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{job.title}</h2>
          <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium">
            {job.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <MapPin size={20} className="mr-2 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">Location</p>
              <p className="text-gray-600 dark:text-gray-400">{job.location}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock size={20} className="mr-2 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">Due Date</p>
              <p className="text-gray-600 dark:text-gray-400">{new Date(job.scheduled_end).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <User size={20} className="mr-2 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">Assigned To</p>
              <p className="text-gray-600 dark:text-gray-400">{job.assigned_to}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <AlertCircle size={20} className="mr-2 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">Priority</p>
              <p className="text-gray-600 dark:text-gray-400 capitalize">{job.priority}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <h3 className="font-medium mb-2">Description</h3>
        <p className="text-gray-600 dark:text-gray-400">{job.description}</p>
      </div>
      
      <div className="space-y-3">
        <Button variant="primary" fullWidth>
          Log Time
        </Button>
        
        <Button variant="outline" fullWidth>
          Add Materials
        </Button>
        
        <Button variant="success" fullWidth>
          Mark as Complete
        </Button>
      </div>
      
      <div className="fixed bottom-4 left-0 right-0 flex justify-center">
        <Link to="/dashboard" className="bg-primary-600 text-white py-3 px-6 rounded-full shadow-lg hover:bg-primary-700 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default MobileJobView;