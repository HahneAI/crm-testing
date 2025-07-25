import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { DashboardData, DashboardFilters } from '../types/dashboard';
import { calculateTrends, analyzeGeographic, analyzeProfitability } from '../utils/dashboard';

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  filters: DashboardFilters;
  realTimeEnabled: boolean;
}

interface DashboardFilters {
  timeRange: '7d' | '30d' | '90d' | '1y';
  includeAI: boolean;
  clients: string[];
  jobStatuses: string[];
}

type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: DashboardData }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'UPDATE_FILTERS'; payload: Partial<DashboardFilters> }
  | { type: 'TOGGLE_REALTIME'; payload: boolean };

const initialState: DashboardState = {
  data: null,
  loading: true,
  error: null,
  filters: {
    timeRange: '30d',
    includeAI: true,
    clients: [],
    jobStatuses: []
  },
  realTimeEnabled: true
};

const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DATA':
      return { ...state, data: action.payload, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'TOGGLE_REALTIME':
      return { ...state, realTimeEnabled: action.payload };
    default:
      return state;
  }
};

const DashboardContext = createContext<{
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  refreshData: () => Promise<void>;
}>({
  state: initialState,
  dispatch: () => {},
  refreshData: async () => {}
});

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { userProfile } = useAuth();

  const refreshData = async () => {
    if (!userProfile?.company_id) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Fetch dashboard data based on current filters
      const dashboardData = await fetchDashboardData(userProfile.company_id, state.filters);
      dispatch({ type: 'SET_DATA', payload: dashboardData });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!userProfile?.company_id || !state.realTimeEnabled) return;

    const subscriptions = [
      // Subscribe to jobs changes
      supabase
        .channel(`dashboard_jobs_${userProfile.company_id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'jobs',
            filter: `company_id=eq.${userProfile.company_id}`
          },
          () => refreshData()
        )
        .subscribe(),

      // Subscribe to quotes changes
      supabase
        .channel(`dashboard_quotes_${userProfile.company_id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'quotes',
            filter: `company_id=eq.${userProfile.company_id}`
          },
          () => refreshData()
        )
        .subscribe()
    ];

    return () => {
      subscriptions.forEach(sub => supabase.removeChannel(sub));
    };
  }, [userProfile?.company_id, state.realTimeEnabled]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [userProfile?.company_id, state.filters]);

  return (
    <DashboardContext.Provider value={{ state, dispatch, refreshData }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

const fetchDashboardData = async (companyId: string, filters: DashboardFilters): Promise<DashboardData> => {
  // Implementation would fetch all necessary dashboard data
  // This is a simplified version - the actual implementation would be more comprehensive

  const endDate = new Date();
  const startDate = new Date();

  switch (filters.timeRange) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  // Fetch all data in parallel
  const [jobs, quotes, clients, materials] = await Promise.all([
    supabase.from('jobs').select('*').eq('company_id', companyId)
      .gte('created_at', startDate.toISOString()),
    supabase.from('quotes').select('*').eq('company_id', companyId)
      .gte('created_at', startDate.toISOString()),
    supabase.from('clients').select('*').eq('company_id', companyId),
    supabase.from('materials').select('*').eq('company_id', companyId)
  ]);

  // Process and return structured data
  return {
    summary: {
      totalRevenue: quotes.data?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0,
      activeJobs: jobs.data?.filter(j => j.status === 'in_progress').length || 0,
      totalClients: clients.data?.length || 0,
      pendingQuotes: quotes.data?.filter(q => q.status === 'pending').length || 0
    },
    trends: calculateTrends(jobs.data, quotes.data),
    geographic: await analyzeGeographic(companyId),
    profitability: await analyzeProfitability(jobs.data),
    lastUpdated: new Date().toISOString()
  };
};
