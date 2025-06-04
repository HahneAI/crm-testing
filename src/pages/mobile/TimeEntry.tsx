import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TimeEntryForm, { TimeEntryData } from '../../components/labor/TimeEntryForm';
import { createLaborEntry } from '../../services/laborService';
import { useAuth } from '../../context/AuthContext';

const MobileTimeEntry = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const handleTimeEntrySubmit = async (data: TimeEntryData) => {
    if (!user) {
      toast.error('You must be logged in to submit time entries');
      return;
    }
    
    try {
      setLoading(true);
      
      const { data: entryData, error } = await createLaborEntry(data, user.id);
      
      if (error) throw error;
      
      toast.success('Time entry added successfully');
    } catch (error) {
      console.error('Error submitting time entry:', error);
      toast.error('Failed to submit time entry');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="mb-4 flex items-center">
        <Link to="/dashboard" className="mr-2">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold">Time Entry</h1>
      </div>
      
      <TimeEntryForm onSubmit={handleTimeEntrySubmit} isMobile />
      
      <div className="mt-6">
        <Card>
          <h3 className="text-lg font-medium mb-2">Recent Time Entries</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">HVAC Repair - Downtown Office</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Today, 2:30 PM - 4:45 PM</p>
                </div>
                <div className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-2 py-1 rounded text-sm font-medium">
                  2.25h
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Plumbing Installation - Riverside</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Yesterday, 9:00 AM - 12:30 PM</p>
                </div>
                <div className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-2 py-1 rounded text-sm font-medium">
                  3.5h
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Electrical Repair - Main St Cafe</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Jun 12, 1:15 PM - 3:45 PM</p>
                </div>
                <div className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-2 py-1 rounded text-sm font-medium">
                  2.5h
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm" rightIcon={<Send size={16} />}>
              View All Entries
            </Button>
          </div>
        </Card>
      </div>
      
      <div className="fixed bottom-4 left-0 right-0 flex justify-center">
        <Link to="/dashboard" className="bg-primary-600 text-white py-3 px-6 rounded-full shadow-lg hover:bg-primary-700 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default MobileTimeEntry;