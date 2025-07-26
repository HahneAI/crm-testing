import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { MobileCard } from '../../components/mobile/MobileCards';
import MobileHeader from '../../components/mobile/MobileHeader';
import MobileNav from '../../components/mobile/MobileNav';

const MobileJobView = () => {
  const { id } = useParams();
  
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <MobileHeader toggleSidebar={() => {}} />
      <div className="p-4">
        <div className="mb-4 flex items-center">
          <Link to="/jobs" className="mr-2">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold">Job Details</h1>
        </div>
        
        <MobileCard title={job.title}>
          <div className="flex justify-between items-start mb-4">
            <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium">
              {job.status.replace('_', ' ')}
            </span>
          </div>
          <div className="space-y-3">
            {/* Job details */}
          </div>
        </MobileCard>
        
        <MobileCard title="Description">
          <p className="text-gray-600 dark:text-gray-400">{job.description}</p>
        </MobileCard>
        
        <div className="space-y-3 mt-4">
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
      </div>
      <MobileNav />
    </div>
  );
};

export default MobileJobView;