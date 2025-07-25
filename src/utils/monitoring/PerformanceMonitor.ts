import { supabase } from '../../services/supabase';
import { ErrorLogger } from './ErrorLogger';

export interface PerformanceMetric {
  id: string;
  metric_type: 'page_load' | 'api_call' | 'component_render' | 'user_action';
  name: string;
  duration: number;
  success: boolean;
  error_message?: string;
  metadata: Record<string, any>;
  timestamp: string;
  user_id?: string;
  company_id?: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observer: PerformanceObserver | null = null;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
      PerformanceMonitor.instance.initialize();
    }
    return PerformanceMonitor.instance;
  }

  private initialize() {
    this.setupPerformanceObserver();
    this.monitorNetworkPerformance();
    this.monitorMemoryUsage();
  }

  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      // Observe various performance entry types
      try {
        this.observer.observe({
          entryTypes: ['navigation', 'resource', 'measure', 'mark']
        });
      } catch (error) {
        console.warn('Performance observer setup failed:', error);
      }
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry) {
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      metric_type: this.getMetricType(entry),
      name: entry.name,
      duration: entry.duration,
      success: true,
      metadata: {
        entryType: entry.entryType,
        startTime: entry.startTime
      },
      timestamp: new Date().toISOString()
    };

    // Add specific data based on entry type
    if (entry.entryType === 'navigation') {
      const navEntry = entry as PerformanceNavigationTiming;
      metric.metadata = {
        ...metric.metadata,
        domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
        loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
        domComplete: navEntry.domComplete - navEntry.domContentLoadedEventEnd
      };
    }

    if (entry.entryType === 'resource') {
      const resourceEntry = entry as PerformanceResourceTiming;
      metric.metadata = {
        ...metric.metadata,
        transferSize: resourceEntry.transferSize,
        encodedBodySize: resourceEntry.encodedBodySize,
        decodedBodySize: resourceEntry.decodedBodySize
      };
    }

    this.recordMetric(metric);
  }

  private getMetricType(entry: PerformanceEntry): PerformanceMetric['metric_type'] {
    if (entry.entryType === 'navigation') return 'page_load';
    if (entry.entryType === 'resource') return 'api_call';
    if (entry.entryType === 'measure') return 'component_render';
    return 'user_action';
  }

  // Track custom performance metrics
  static trackPageLoad(pageName: string, startTime: number) {
    const duration = performance.now() - startTime;
    PerformanceMonitor.getInstance().recordCustomMetric({
      metric_type: 'page_load',
      name: pageName,
      duration,
      success: true,
      metadata: { page: pageName }
    });
  }

  static trackAPICall(apiName: string, duration: number, success: boolean, error?: string) {
    PerformanceMonitor.getInstance().recordCustomMetric({
      metric_type: 'api_call',
      name: apiName,
      duration,
      success,
      error_message: error,
      metadata: { api: apiName }
    });
  }

  static trackComponentRender(componentName: string, renderTime: number) {
    PerformanceMonitor.getInstance().recordCustomMetric({
      metric_type: 'component_render',
      name: componentName,
      duration: renderTime,
      success: true,
      metadata: { component: componentName }
    });
  }

  private recordCustomMetric(metricData: Partial<PerformanceMetric>) {
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      timestamp: new Date().toISOString(),
      metadata: {},
      ...metricData as PerformanceMetric
    };

    this.recordMetric(metric);
  }

  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Keep only recent metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }

    // Check for performance issues
    this.checkPerformanceThresholds(metric);

    // Periodically flush metrics to database
    if (this.metrics.length % 50 === 0) {
      this.flushMetrics();
    }
  }

  private checkPerformanceThresholds(metric: PerformanceMetric) {
    const thresholds = {
      page_load: 3000, // 3 seconds
      api_call: 5000,  // 5 seconds
      component_render: 100, // 100ms
      user_action: 1000 // 1 second
    };

    const threshold = thresholds[metric.metric_type];

    if (metric.duration > threshold) {
      console.warn(`Performance threshold exceeded for ${metric.name}: ${metric.duration}ms > ${threshold}ms`);

      // Log as warning
      ErrorLogger.logWarning(`Performance threshold exceeded: ${metric.name}`, {
        additionalData: {
          duration: metric.duration,
          threshold,
          metricType: metric.metric_type
        }
      });

      // Trigger alert for critical performance issues
      if (metric.duration > threshold * 2) {
        this.triggerPerformanceAlert(metric, threshold);
      }
    }
  }

  private triggerPerformanceAlert(metric: PerformanceMetric, threshold: number) {
    console.error(`CRITICAL: Performance issue detected - ${metric.name} took ${metric.duration}ms`);

    // Could integrate with alerting service (email, Slack, etc.)
    // AlertingService.sendAlert({
    //   type: 'performance',
    //   severity: 'critical',
    //   message: `Performance issue: ${metric.name} (${metric.duration}ms)`,
    //   threshold,
    //   metric
    // });
  }

  private async flushMetrics() {
    if (this.metrics.length === 0) return;

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    try {
      const { error } = await supabase
        .from('performance_metrics')
        .insert(metricsToFlush);

      if (error) {
        console.error('Failed to flush performance metrics:', error);
        // Re-queue metrics that failed to flush
        this.metrics.unshift(...metricsToFlush.slice(-100)); // Keep only recent ones
      }
    } catch (error) {
      console.error('Error flushing performance metrics:', error);
    }
  }

  private monitorNetworkPerformance() {
    // Monitor network connection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      const logConnectionChange = () => {
        this.recordCustomMetric({
          metric_type: 'user_action',
          name: 'network_change',
          duration: 0,
          success: true,
          metadata: {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt
          }
        });
      };

      connection.addEventListener('change', logConnectionChange);
    }
  }

  private monitorMemoryUsage() {
    // Monitor memory usage (Chrome only)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;

        this.recordCustomMetric({
          metric_type: 'user_action',
          name: 'memory_usage',
          duration: 0,
          success: true,
          metadata: {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit
          }
        });
      }, 30000); // Every 30 seconds
    }
  }

  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get performance summary for dashboard
  getPerformanceSummary(): {
    averagePageLoad: number;
    averageAPICall: number;
    slowestQueries: PerformanceMetric[];
    errorRate: number;
  } {
    const pageLoads = this.metrics.filter(m => m.metric_type === 'page_load');
    const apiCalls = this.metrics.filter(m => m.metric_type === 'api_call');
    const errors = this.metrics.filter(m => !m.success);

    return {
      averagePageLoad: pageLoads.reduce((sum, m) => sum + m.duration, 0) / pageLoads.length || 0,
      averageAPICall: apiCalls.reduce((sum, m) => sum + m.duration, 0) / apiCalls.length || 0,
      slowestQueries: this.metrics
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10),
      errorRate: this.metrics.length > 0 ? (errors.length / this.metrics.length) * 100 : 0
    };
  }
}
