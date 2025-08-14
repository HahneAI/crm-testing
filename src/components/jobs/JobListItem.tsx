import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronRight, MapPin, Clock, User } from 'lucide-react';
import { Job } from '../../types/job';

interface JobListItemProps {
  job: Job;
}

const statusClasses = {
  pending: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  in_progress: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
  completed: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300',
  cancelled: 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300',
};

const priorityClasses = {
  high: 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300',
  medium: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300',
  low: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300',
  urgent: 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300',
};

const JobListItem = ({ job }: JobListItemProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    setExpanded(!expanded);
  };
  
  return (
    <Link 
      to={`/jobs/${job.id}`} 
      className="block rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200"
    >
      <div className="p-4 bg-white dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-lg text-gray-900 dark:text-white">{job.title}</h3>
            
            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin size={16} className="mr-1" />
              <span>{job.location}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${statusClasses[job.status as keyof typeof statusClasses] || statusClasses.pending}`}>
              {job.status.replace('_', ' ')}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${priorityClasses[job.priority as keyof typeof priorityClasses] || priorityClasses.medium}`}>
              {job.priority}
            </span>
            <button 
              onClick={toggleExpand}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight 
                size={20} 
                className={`transform transition-transform ${expanded ? 'rotate-90' : ''}`} 
              />
            </button>
          </div>
        </div>
        
        {job.scheduled_end && (
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock size={16} className="mr-1" />
            <span>Due: {format(new Date(job.scheduled_end), 'MMM d, yyyy')}</span>
          </div>
        )}
        
        {job.assigned_to && (
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <User size={16} className="mr-1" />
            <span>Assigned to: {job.assigned_to}</span>
          </div>
        )}
        
        {expanded && job.description && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">{job.description}</p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default JobListItem;