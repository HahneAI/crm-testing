import { Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Card from '../common/Card';

export interface Job {
  id: string;
  title: string;
  status: string;
  location: string;
  scheduled_end: string | null;
  priority: string;
}

interface RecentJobsListProps {
  jobs: Job[];
  className?: string;
}

const priorityClasses = {
  high: 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300',
  medium: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300',
  low: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300',
  urgent: 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300',
};

const statusClasses = {
  pending: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  in_progress: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
  completed: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300',
  cancelled: 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300',
};

const RecentJobsList = ({ jobs, className = '' }: RecentJobsListProps) => {
  return (
    <Card 
      title="Recent Jobs" 
      className={className}
      footer={
        <Link 
          to="/jobs" 
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center"
        >
          View all jobs
          <ExternalLink size={14} className="ml-1" />
        </Link>
      }
    >
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No jobs available</p>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <Link 
                key={job.id} 
                to={`/jobs/${job.id}`}
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{job.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{job.location}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusClasses[job.status as keyof typeof statusClasses] || statusClasses.pending}`}>
                      {job.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${priorityClasses[job.priority as keyof typeof priorityClasses] || priorityClasses.medium}`}>
                      {job.priority}
                    </span>
                  </div>
                </div>
                
                {job.scheduled_end && (
                  <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={14} className="mr-1" />
                    <span>Due: {format(new Date(job.scheduled_end), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecentJobsList;