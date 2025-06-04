import { Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';

interface JobStatus {
  name: string;
  count: number;
  color: string;
}

interface JobStatusCardProps {
  statuses: JobStatus[];
  total: number;
  className?: string;
}

const JobStatusCard = ({ statuses, total, className = '' }: JobStatusCardProps) => {
  return (
    <Card 
      title="Job Status" 
      subtitle={`${total} total jobs`}
      className={className}
      footer={
        <Link 
          to="/jobs" 
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          View all jobs
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Progress bar showing proportional distribution */}
        <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
          {statuses.map((status, index) => (
            <div 
              key={index}
              className={`h-full ${status.color}`} 
              style={{ 
                width: `${(status.count / total) * 100}%`,
                transition: 'width 1s ease-in-out'
              }}
            />
          ))}
        </div>
        
        {/* Status breakdown */}
        <div className="space-y-3">
          {statuses.map((status, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${status.color} mr-2`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{status.name}</span>
              </div>
              <span className="text-sm font-medium">{status.count}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default JobStatusCard;