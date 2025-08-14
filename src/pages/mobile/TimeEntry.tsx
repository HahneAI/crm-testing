import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MobileCard } from '../../components/mobile/MobileCards';
import Button from '../../components/common/Button';
import TimeEntryForm, { TimeEntryData } from '../../components/labor/TimeEntryForm';
import { createLaborEntry } from '../../services/laborService';
import { useAuth } from '../../context/AuthContext';
import MobileHeader from '../../components/mobile/MobileHeader';
import MobileNav from '../../components/mobile/MobileNav';

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
      
      const { error } = await createLaborEntry(data, user.id);
      
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <MobileHeader toggleSidebar={() => {}} />
      <div className="p-4">
        <div className="mb-4 flex items-center">
          <Link to="/dashboard" className="mr-2">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold">Time Entry</h1>
        </div>

        <TimeEntryForm onSubmit={handleTimeEntrySubmit} isMobile />

        <div className="mt-6">
          <MobileCard title="Recent Time Entries">
            <div className="space-y-3">
              {/* Mock Data */}
            </div>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" size="sm" rightIcon={<Send size={16} />}>
                View All Entries
              </Button>
            </div>
          </MobileCard>
        </div>
      </div>
      <MobileNav />
    </div>
  );
};

export default MobileTimeEntry;