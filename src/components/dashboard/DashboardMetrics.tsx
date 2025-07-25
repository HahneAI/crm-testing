import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import MetricCard from './MetricCard';
import TrendChart from './charts/TrendChart';
import GeographicDistribution from './charts/GeographicDistribution';
import ProfitabilityMatrix from './charts/ProfitabilityMatrix';
import { DashboardData, MetricDefinition } from '../../types/dashboard';
import {
    calculateTrends,
    calculateGrowthRate,
    calculateJobProfitMargin,
    calculateEfficiencyRatio,
    calculateTierEfficiency,
    getMetricValue,
    getMetricChange,
    getMetricTrend,
    fetchClientMetrics,
    fetchMaterialMetrics,
    fetchLaborMetrics
} from '../../utils/dashboard';

interface DashboardMetricsProps {
  timeRange?: '7d' | '30d' | '90d' | '1y';
  refreshInterval?: number;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  timeRange = '30d',
  refreshInterval = 30000 // 30 seconds
}) => {
  const { userProfile } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'total_revenue',
    'active_jobs',
    'profit_margin',
    'client_satisfaction'
  ]);

  useEffect(() => {
    if (userProfile?.company_id) {
      loadDashboardData();
      const interval = setInterval(loadDashboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [userProfile, timeRange]);

  const loadDashboardData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();

      // Calculate date range
      switch (timeRange) {
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

      // Fetch comprehensive dashboard data
      const [
        revenueData,
        jobsData,
        clientsData,
        materialsData,
        laborData,
        uuidAnalytics
      ] = await Promise.all([
        fetchRevenueMetrics(startDate, endDate),
        fetchJobMetrics(startDate, endDate),
        fetchClientMetrics(startDate, endDate),
        fetchMaterialMetrics(startDate, endDate),
        fetchLaborMetrics(startDate, endDate),
        fetchUUIDAnalytics(startDate, endDate)
      ]);

      setData({
        revenue: revenueData,
        jobs: jobsData,
        clients: clientsData,
        materials: materialsData,
        labor: laborData,
        geographic: uuidAnalytics.geographic,
        profitability: uuidAnalytics.profitability,
        trends: calculateTrends(revenueData, jobsData),
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueMetrics = async (startDate: Date, endDate: Date) => {
    const { data } = await supabase
      .from('quotes')
      .select(`
        total_amount,
        status,
        created_at,
        clients(id, name),
        ai_generated
      `)
      .eq('company_id', userProfile.company_id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('status', 'approved');

    const totalRevenue = data?.reduce((sum, quote) => sum + (quote.total_amount || 0), 0) || 0;
    const aiGeneratedRevenue = data?.filter(q => q.ai_generated)
      .reduce((sum, quote) => sum + (quote.total_amount || 0), 0) || 0;

    return {
      total: totalRevenue,
      aiGenerated: aiGeneratedRevenue,
      traditionalGenerated: totalRevenue - aiGeneratedRevenue,
      count: data?.length || 0,
      averageValue: data?.length ? totalRevenue / data.length : 0,
      growth: await calculateGrowthRate('revenue', startDate, endDate)
    };
  };

  const fetchJobMetrics = async (startDate: Date, endDate: Date) => {
    const { data } = await supabase
      .from('jobs')
      .select(`
        id,
        status,
        budget,
        actual_cost,
        estimated_hours,
        actual_hours,
        created_at,
        start_date,
        end_date,
        priority,
        clients(id, name)
      `)
      .eq('company_id', userProfile.company_id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const statusCounts = data?.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const completedJobs = data?.filter(job => job.status === 'completed') || [];
    const avgCompletionTime = completedJobs.length > 0
      ? completedJobs.reduce((sum, job) => {
          const start = new Date(job.start_date).getTime();
          const end = new Date(job.end_date).getTime();
          return sum + (end - start);
        }, 0) / completedJobs.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return {
      total: data?.length || 0,
      active: statusCounts['in_progress'] || 0,
      completed: statusCounts['completed'] || 0,
      pending: statusCounts['pending'] || 0,
      onHold: statusCounts['on_hold'] || 0,
      averageCompletionTime: Math.round(avgCompletionTime),
      profitMargin: calculateJobProfitMargin(data),
      efficiency: calculateEfficiencyRatio(data)
    };
  };

  const fetchUUIDAnalytics = async (startDate: Date, endDate: Date) => {
    // Leverage Task 1's UUID system for advanced analytics
    const { data: companies } = await supabase
      .from('companies')
      .select(`
        id,
        geo_code,
        profit_tier,
        new_id,
        jobs(
          id,
          budget,
          actual_cost,
          status,
          created_at
        ),
        clients(
          id,
          name,
          client_type
        )
      `)
      .eq('id', userProfile.company_id);

    if (!companies?.[0]) return { geographic: [], profitability: [] };

    const company = companies[0];

    // Geographic analysis using UUID geo encoding
    const geographicData = await analyzeGeographicPerformance(company);

    // Profitability analysis using UUID profit encoding
    const profitabilityData = await analyzeProfitabilityTiers(company);

    return {
      geographic: geographicData,
      profitability: profitabilityData
    };
  };

  const analyzeGeographicPerformance = async (company: any) => {
    // Extract geographic insights from UUID system
    const geoCode = company.geo_code || 'unknown';
    const jobs = company.jobs || [];

    const totalRevenue = jobs.reduce((sum: number, job: any) => sum + (job.budget || 0), 0);
    const completedJobs = jobs.filter((job: any) => job.status === 'completed');

    return [{
      region: geoCode,
      revenue: totalRevenue,
      jobCount: jobs.length,
      completionRate: jobs.length > 0 ? (completedJobs.length / jobs.length) * 100 : 0,
      averageJobValue: jobs.length > 0 ? totalRevenue / jobs.length : 0
    }];
  };

  const analyzeProfitabilityTiers = async (company: any) => {
    const profitTier = company.profit_tier || 'standard';
    const jobs = company.jobs || [];

    const profitMargin = jobs.reduce((sum: number, job: any) => {
      const profit = (job.budget || 0) - (job.actual_cost || 0);
      return sum + profit;
    }, 0);

    return [{
      tier: profitTier,
      totalProfit: profitMargin,
      averageMargin: jobs.length > 0 ? profitMargin / jobs.length : 0,
      jobCount: jobs.length,
      efficiency: calculateTierEfficiency(jobs)
    }];
  };

  const metricDefinitions: MetricDefinition[] = [
    {
      id: 'total_revenue',
      title: 'Total Revenue',
      description: 'Total approved quote value',
      format: 'currency',
      color: 'green'
    },
    {
      id: 'active_jobs',
      title: 'Active Jobs',
      description: 'Jobs currently in progress',
      format: 'number',
      color: 'blue'
    },
    {
      id: 'profit_margin',
      title: 'Profit Margin',
      description: 'Average profit margin across all jobs',
      format: 'percentage',
      color: 'purple'
    },
    {
      id: 'client_satisfaction',
      title: 'Client Satisfaction',
      description: 'Average client satisfaction score',
      format: 'percentage',
      color: 'orange'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricDefinitions.map(metric => (
          <MetricCard
            key={metric.id}
            title={metric.title}
            value={getMetricValue(data, metric.id)}
            change={getMetricChange(data, metric.id)}
            format={metric.format}
            color={metric.color}
            trend={getMetricTrend(data, metric.id)}
          />
        ))}
      </div>

      {/* Advanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
          <TrendChart
            data={data?.trends?.revenue || []}
            type="revenue"
            timeRange={timeRange}
          />
        </div>

        {/* Job Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Job Distribution</h3>
          <JobStatusChart
            data={data?.jobs || {}}
          />
        </div>

        {/* Geographic Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Geographic Performance</h3>
          <GeographicDistribution
            data={data?.geographic || []}
            uuidInsights={true}
          />
        </div>

        {/* Profitability Matrix */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibent mb-4">Profitability Analysis</h3>
          <ProfitabilityMatrix
            data={data?.profitability || []}
            uuidTiers={true}
          />
        </div>
      </div>

      {/* AI vs Traditional Performance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">AI Quote Engine Performance</h3>
        <AIPerformanceChart
          aiRevenue={data?.revenue?.aiGenerated || 0}
          traditionalRevenue={data?.revenue?.traditionalGenerated || 0}
        />
      </div>
    </div>
  );
};

export default DashboardMetrics;
