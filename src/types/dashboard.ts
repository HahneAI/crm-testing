export interface DashboardData {
  revenue: RevenueData;
  jobs: JobData;
  clients: ClientData;
  materials: MaterialData;
  labor: LaborData;
  geographic: GeographicData[];
  profitability: ProfitabilityData[];
  trends: TrendData;
  lastUpdated: string;
  summary?: SummaryData;
}

export interface RevenueData {
  total: number;
  aiGenerated: number;
  traditionalGenerated: number;
  count: number;
  averageValue: number;
  growth: number;
}

export interface JobData {
  total: number;
  active: number;
  completed: number;
  pending: number;
  onHold: number;
  averageCompletionTime: number;
  profitMargin: number;
  efficiency: number;
}

export interface ClientData {
  total: number;
  new: number;
  retentionRate: number;
  satisfactionScore: number;
  lifetimeValue: number;
}

export interface MaterialData {
  totalCost: number;
  usageVariance: number;
  topItems: { name: string; cost: number }[];
}

export interface LaborData {
  totalHours: number;
  totalCost: number;
  efficiency: number;
  overtimeHours: number;
}

export interface GeographicData {
  region: string;
  revenue: number;
  jobCount: number;
  completionRate: number;
  averageJobValue: number;
}

export interface ProfitabilityData {
  tier: string;
  totalProfit: number;
  averageMargin: number;
  jobCount: number;
  efficiency: number;
}

export interface TrendData {
  revenue: { date: string; value: number }[];
  jobs: { date: string; value: number }[];
}

export interface MetricDefinition {
  id: string;
  title: string;
  description: string;
  format: 'currency' | 'number' | 'percentage';
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red';
}

export interface DashboardFilters {
  timeRange: '7d' | '30d' | '90d' | '1y';
  includeAI: boolean;
  clients: string[];
  jobStatuses: string[];
}

export interface SummaryData {
  totalRevenue: number;
  activeJobs: number;
  totalClients: number;
  pendingQuotes: number;
}
