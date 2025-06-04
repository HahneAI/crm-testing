import { useState } from 'react';
import { Clock, FileText } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

interface TimeEntryFormProps {
  jobId?: string;
  onSubmit: (data: TimeEntryData) => Promise<void>;
  isMobile?: boolean;
}

export interface TimeEntryData {
  jobId: string;
  startTime: string;
  endTime: string;
  notes: string;
  hourlyRate?: number;
  breakDuration?: number;
}

const TimeEntryForm = ({ jobId = '', onSubmit, isMobile = false }: TimeEntryFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TimeEntryData>({
    jobId,
    startTime: '',
    endTime: '',
    notes: '',
    hourlyRate: 0,
    breakDuration: 0
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleStartNow = () => {
    const now = new Date();
    const timeString = now.toISOString().substring(0, 16); // Format: YYYY-MM-DDTHH:MM
    
    setFormData(prev => ({
      ...prev,
      startTime: timeString
    }));
  };
  
  const handleEndNow = () => {
    const now = new Date();
    const timeString = now.toISOString().substring(0, 16); // Format: YYYY-MM-DDTHH:MM
    
    setFormData(prev => ({
      ...prev,
      endTime: timeString
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        jobId,
        startTime: '',
        endTime: '',
        notes: '',
        hourlyRate: 0,
        breakDuration: 0
      });
    } catch (error) {
      console.error('Error submitting time entry:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card 
      title="Log Time" 
      subtitle="Track your hours for this job"
      className={isMobile ? 'max-w-lg mx-auto' : ''}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!jobId && (
          <div>
            <label htmlFor="jobId\" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Job
            </label>
            <select
              id="jobId"
              name="jobId"
              value={formData.jobId}
              onChange={handleChange}
              required
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a job</option>
              {/* Job options would be populated from a jobs query */}
              <option value="job1">Job #1 - HVAC Installation</option>
              <option value="job2">Job #2 - Plumbing Repair</option>
              <option value="job3">Job #3 - Electrical Upgrade</option>
            </select>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Time
            </label>
            <div className="flex gap-2">
              <Input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                fullWidth
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartNow}
              >
                Now
              </Button>
            </div>
          </div>
          
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Time
            </label>
            <div className="flex gap-2">
              <Input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                fullWidth
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEndNow}
              >
                Now
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hourly Rate ($)
            </label>
            <Input
              type="number"
              id="hourlyRate"
              name="hourlyRate"
              value={formData.hourlyRate?.toString() || '0'}
              onChange={handleChange}
              fullWidth
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label htmlFor="breakDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Break Duration (minutes)
            </label>
            <Input
              type="number"
              id="breakDuration"
              name="breakDuration"
              value={formData.breakDuration?.toString() || '0'}
              onChange={handleChange}
              fullWidth
              min="0"
              step="1"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="What did you work on?"
            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Clock size={18} />}
          >
            {formData.endTime ? 'Log Time' : 'Start Timer'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TimeEntryForm;