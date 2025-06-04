import { useState, useEffect } from 'react';
import { PlusCircle, Package, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import LoadingScreen from '../../components/common/LoadingScreen';
import { getSupabase } from '../../services/supabase';

interface Material {
  id: string;
  job_id: string;
  material_name: string;
  quantity: number;
  cost: number;
  created_at: string;
  added_by: string;
  job: {
    title: string;
  };
  user: {
    name: string;
  };
}

const Materials = () => {
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    loadMaterials();
  }, []);
  
  const loadMaterials = async () => {
    try {
      setLoading(true);
      
      const supabase = getSupabase();
      
      let query = supabase
        .from('materials_used')
        .select(`
          *,
          job:jobs(title),
          user:users!materials_used_added_by_fkey(name)
        `);
      
      if (searchTerm) {
        query = query.ilike('material_name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setMaterials(data || []);
    } catch (error) {
      console.error('Error loading materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMaterials();
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  const totalCost = materials.reduce((sum, material) => sum + material.cost, 0);
  
  return (
    <DashboardLayout title="Materials">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Materials</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track materials used in jobs</p>
          </div>
          
          <Button
            variant="primary"
            leftIcon={<PlusCircle size={18} />}
          >
            Add Materials
          </Button>
        </div>
        
        {/* Search and Filters */}
        <Card>
          <div className="space-y-4">
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  leftIcon={<Search size={18} className="text-gray-400" />}
                />
                
                <Button
                  type="submit"
                  variant="primary"
                >
                  Search
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={18} />
                </Button>
              </div>
            </form>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job
                  </label>
                  <select className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option value="">All Jobs</option>
                    <option value="job1">Job #1</option>
                    <option value="job2">Job #2</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Range
                  </label>
                  <select className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option value="">All Time</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                    <option value="this_year">This Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Added By
                  </label>
                  <select className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option value="">All Users</option>
                    <option value="user1">User 1</option>
                    <option value="user2">User 2</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </Card>
        
        {/* Materials Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="col-span-1 md:col-span-3">
            <div className="flex flex-col md:flex-row items-center justify-between p-2">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="mr-4 bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                  <Package size={24} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Total Materials Cost</h3>
                  <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                  <p className="text-xl font-bold">{materials.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Jobs Covered</p>
                  <p className="text-xl font-bold">
                    {new Set(materials.map(m => m.job_id)).size}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Materials List */}
        <Card title="Materials List">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Material</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Added By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                      No materials found
                    </td>
                  </tr>
                ) : (
                  materials.map(material => (
                    <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{material.material_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{material.job.title}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{material.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap">${material.cost.toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{material.user.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(material.created_at).toLocaleDateString()}
                      </td>
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

export default Materials;