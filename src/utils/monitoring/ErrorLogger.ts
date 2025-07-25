import { supabase } from '../../services/supabase';

export interface ErrorContext {
  userId?: string;
  companyId?: string;
  componentStack?: string;
  errorBoundary?: boolean;
  retryCount?: number;
  userAgent?: string;
  url?: string;
  timestamp?: string;
  additionalData?: Record<string, any>;
}

export interface SystemError {
  id: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context: ErrorContext;
  resolved: boolean;
  created_at: string;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private errorQueue: SystemError[] = [];
  private isFlushingQueue = false;
  private maxQueueSize = 100;

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  static logError(error: Error, context: ErrorContext = {}): string {
    return ErrorLogger.getInstance().logError(error, context);
  }

  static logWarning(message: string, context: ErrorContext = {}): string {
    return ErrorLogger.getInstance().logWarning(message, context);
  }

  static logInfo(message: string, context: ErrorContext = {}): string {
    return ErrorLogger.getInstance().logInfo(message, context);
  }

  logError(error: Error, context: ErrorContext = {}): string {
    const errorId = this.generateErrorId();

    const systemError: SystemError = {
      id: errorId,
      level: 'error',
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        timestamp: context.timestamp || new Date().toISOString()
      },
      resolved: false,
      created_at: new Date().toISOString()
    };

    this.queueError(systemError);
    console.error(`[ErrorLogger] ${errorId}:`, error, context);

    return errorId;
  }

  logWarning(message: string, context: ErrorContext = {}): string {
    const errorId = this.generateErrorId();

    const systemError: SystemError = {
      id: errorId,
      level: 'warning',
      message,
      context: {
        ...context,
        timestamp: context.timestamp || new Date().toISOString()
      },
      resolved: false,
      created_at: new Date().toISOString()
    };

    this.queueError(systemError);
    console.warn(`[ErrorLogger] ${errorId}:`, message, context);

    return errorId;
  }

  logInfo(message: string, context: ErrorContext = {}): string {
    const errorId = this.generateErrorId();

    const systemError: SystemError = {
      id: errorId,
      level: 'info',
      message,
      context: {
        ...context,
        timestamp: context.timestamp || new Date().toISOString()
      },
      resolved: false,
      created_at: new Date().toISOString()
    };

    this.queueError(systemError);
    console.info(`[ErrorLogger] ${errorId}:`, message, context);

    return errorId;
  }

  private queueError(error: SystemError) {
    this.errorQueue.push(error);

    // Prevent queue from growing too large
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-this.maxQueueSize);
    }

    // Trigger flush if not already in progress
    if (!this.isFlushingQueue) {
      setTimeout(() => this.flushQueue(), 1000);
    }
  }

  private async flushQueue() {
    if (this.isFlushingQueue || this.errorQueue.length === 0) {
      return;
    }

    this.isFlushingQueue = true;
    const errorsToFlush = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // Batch insert errors to database
      const { error } = await supabase
        .from('system_errors')
        .insert(errorsToFlush);

      if (error) {
        console.error('Failed to flush error queue:', error);
        // Re-queue errors that failed to insert
        this.errorQueue.unshift(...errorsToFlush);
      }
    } catch (error) {
      console.error('Error flushing queue:', error);
      // Re-queue errors that failed to insert
      this.errorQueue.unshift(...errorsToFlush);
    } finally {
      this.isFlushingQueue = false;
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get recent errors for admin dashboard
  async getRecentErrors(limit = 50): Promise<SystemError[]> {
    try {
      const { data, error } = await supabase
        .from('system_errors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch recent errors:', error);
      return [];
    }
  }

  // Mark error as resolved
  async resolveError(errorId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_errors')
        .update({ resolved: true })
        .eq('id', errorId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  }
}
