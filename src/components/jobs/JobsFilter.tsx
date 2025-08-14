import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

interface JobsFilterProps {
  onFilter: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  status: string;
  priority: string;
  dateRange: string;
}

const JobsFilter = ({ onFilter }: JobsFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    priority: '',
    dateRange: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
    
    // Auto-apply search filter
    onFilter({
      ...filters,
      search: e.target.value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };
  
  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      priority: '',
      dateRange: '',
    };
    setFilters(clearedFilters);
    onFilter(clearedFilters);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          {/* Search Input - Always visible */}
          <div className="flex items-center gap-2">
            <Input
              type="text"
              name="search"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={handleSearchChange}
              fullWidth
              leftIcon={<Search size={18} className="text-gray-400" />}
            />
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? "Hide filters" : "Show filters"}
            >
              <Filter size={18} />
            </Button>
          </div>
          
          {/* Expandable Filters */}
          {isOpen && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={filters.priority}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <select
                  id="dateRange"
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Filter Actions */}
          {isOpen && (
            <div className="mt-4 flex justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                leftIcon={<X size={16} />}
              >
                Clear Filters
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                Apply Filters
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default JobsFilter;