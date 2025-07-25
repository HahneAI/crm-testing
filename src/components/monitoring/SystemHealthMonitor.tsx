import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { PerformanceMonitor } from '../../utils/monitoring/PerformanceMonitor';
import { ErrorLogger } from '../../utils/monitoring/ErrorLogger';
import { WebhookRetrySystem } from '../../utils/monitoring/WebhookRetry';

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  performance: {
    averagePageLoad: number;
    averageAPICall: number;
    errorRate: number;
  };
  errors: {
    recentErrors: number;
    unresolvedErrors: number;
  };
  webhooks: {
    queueLength: number;
    failingWebhooks: number;
  };
  lastChecked: string;
}

const SystemHealthMonitor: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    try {
      const performanceMonitor = PerformanceMonitor.getInstance();
      const performanceSummary = performanceMonitor.getPerformanceSummary();

      const recentErrors = await ErrorLogger.getInstance().getRecentErrors(100);
      const unresolvedErrors = recentErrors.filter(e => !e.resolved);

      const webhookStatus = WebhookRetrySystem.getInstance().getQueueStatus();

      const healthData: SystemHealth = {
        overall: determineOverallHealth(performanceSummary, unresolvedErrors.length, webhookStatus.queueLength),
        performance: {
          averagePageLoad: performanceSummary.averagePageLoad,
          averageAPICall: performanceSummary.averageAPICall,
          errorRate: performanceSummary.errorRate
        },
        errors: {
          recentErrors: recentErrors.length,
          unresolvedErrors: unresolvedErrors.length
        },
        webhooks: {
          queueLength: webhookStatus.queueLength,
          failingWebhooks: webhookStatus.failingWebhooks.length
        },
        lastChecked: new Date().toISOString()
      };

      setHealth(healthData);
    } catch (error) {
      console.error('Failed to check system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const determineOverallHealth = (
    performance: any,
    unresolvedErrors: number,
    webhookQueue: number
  ): 'healthy' | 'warning' | 'critical' => {
    if (
      unresolvedErrors > 10 ||
      performance.errorRate > 10 ||
      performance.averagePageLoad > 5000 ||
      webhookQueue > 50
    ) {
      return 'critical';
    }

    if (
      unresolvedErrors > 5 ||
      performance.errorRate > 5 ||
      performance.averagePageLoad > 3000 ||
      webhookQueue > 20
    ) {
      return 'warning';
    }

    return 'healthy';
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'critical': return <AlertCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-center text-gray-500">
          Unable to load system health data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">System Health</h3>
        <div className={`flex items-center px-3 py-1 rounded-full ${getHealthColor(health.overall)}`}>
          {getHealthIcon(health.overall)}
          <span className="ml-2 text-sm font-medium capitalize">
            {health.overall}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Performance
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Page Load:</span>
              <span className={`font-medium ${health.performance.averagePageLoad > 3000 ? 'text-red-600' : 'text-green-600'}`}>
                {health.performance.averagePageLoad.toFixed(0)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg API Call:</span>
              <span className={`font-medium ${health.performance.averageAPICall > 5000 ? 'text-red-600' : 'text-green-600'}`}>
                {health.performance.averageAPICall.toFixed(0)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Error Rate:</span>
              <span className={`font-medium ${health.performance.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                {health.performance.errorRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            System Status
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Recent Errors:</span>
              <span className={`font-medium ${health.errors.recentErrors > 10 ? 'text-red-600' : 'text-gray-900'}`}>
                {health.errors.recentErrors}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Unresolved:</span>
              <span className={`font-medium ${health.errors.unresolvedErrors > 5 ? 'text-red-600' : 'text-gray-900'}`}>
                {health.errors.unresolvedErrors}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Webhook Queue:</span>
              <span className={`font-medium ${health.webhooks.queueLength > 20 ? 'text-red-600' : 'text-gray-900'}`}>
                {health.webhooks.queueLength}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        Last checked: {new Date(health.lastChecked).toLocaleString()}
      </div>
    </div>
  );
};

export default SystemHealthMonitor;
