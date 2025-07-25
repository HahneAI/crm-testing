import { ErrorLogger } from './ErrorLogger';
import { PerformanceMonitor } from './PerformanceMonitor';

export interface WebhookPayload {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  body: any;
  retryCount: number;
  maxRetries: number;
  nextRetryAt: string;
  metadata: Record<string, any>;
}

export interface WebhookResult {
  success: boolean;
  statusCode?: number;
  responseBody?: any;
  error?: string;
  duration: number;
}

export class WebhookRetrySystem {
  private static instance: WebhookRetrySystem;
  private retryQueue: WebhookPayload[] = [];
  private isProcessing = false;
  private retryIntervals = [1000, 2000, 5000, 10000, 30000]; // Exponential backoff

  static getInstance(): WebhookRetrySystem {
    if (!WebhookRetrySystem.instance) {
      WebhookRetrySystem.instance = new WebhookRetrySystem();
      WebhookRetrySystem.instance.startProcessor();
    }
    return WebhookRetrySystem.instance;
  }

  static async sendWebhook(
    url: string,
    payload: any,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
      maxRetries?: number;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<WebhookResult> {
    return WebhookRetrySystem.getInstance().sendWebhook(url, payload, options);
  }

  async sendWebhook(
    url: string,
    payload: any,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
      maxRetries?: number;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<WebhookResult> {
    const webhookPayload: WebhookPayload = {
      id: this.generateWebhookId(),
      url,
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: payload,
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      nextRetryAt: new Date().toISOString(),
      metadata: options.metadata || {}
    };

    return this.executeWebhook(webhookPayload);
  }

  private async executeWebhook(webhookData: WebhookPayload): Promise<WebhookResult> {
    const startTime = performance.now();

    try {
      // Log attempt
      ErrorLogger.logInfo(`Webhook attempt ${webhookData.retryCount + 1}`, {
        additionalData: {
          webhookId: webhookData.id,
          url: webhookData.url,
          method: webhookData.method
        }
      });

      const response = await fetch(webhookData.url, {
        method: webhookData.method,
        headers: webhookData.headers,
        body: webhookData.method !== 'GET' ? JSON.stringify(webhookData.body) : undefined,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      const duration = performance.now() - startTime;
      const responseBody = await response.text();

      // Track performance
      PerformanceMonitor.trackAPICall(
        `webhook_${webhookData.url}`,
        duration,
        response.ok,
        response.ok ? undefined : `HTTP ${response.status}`
      );

      if (response.ok) {
        // Success
        ErrorLogger.logInfo('Webhook succeeded', {
          additionalData: {
            webhookId: webhookData.id,
            statusCode: response.status,
            duration
          }
        });

        return {
          success: true,
          statusCode: response.status,
          responseBody: this.parseResponseBody(responseBody),
          duration
        };
      } else {
        // HTTP error - decide if we should retry
        const shouldRetry = this.shouldRetry(response.status, webhookData.retryCount, webhookData.maxRetries);

        if (shouldRetry) {
          return this.scheduleRetry(webhookData, `HTTP ${response.status}: ${responseBody}`);
        } else {
          const error = `HTTP ${response.status}: ${responseBody}`;
          ErrorLogger.logError(new Error(error), {
            additionalData: {
              webhookId: webhookData.id,
              statusCode: response.status,
              finalAttempt: true
            }
          });

          return {
            success: false,
            statusCode: response.status,
            responseBody: this.parseResponseBody(responseBody),
            error,
            duration
          };
        }
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Track failed performance
      PerformanceMonitor.trackAPICall(
        `webhook_${webhookData.url}`,
        duration,
        false,
        errorMessage
      );

      // Decide if we should retry
      const shouldRetry = this.shouldRetry(0, webhookData.retryCount, webhookData.maxRetries);

      if (shouldRetry) {
        return this.scheduleRetry(webhookData, errorMessage);
      } else {
        ErrorLogger.logError(error as Error, {
          additionalData: {
            webhookId: webhookData.id,
            finalAttempt: true
          }
        });

        return {
          success: false,
          error: errorMessage,
          duration
        };
      }
    }
  }

  private shouldRetry(statusCode: number, currentRetries: number, maxRetries: number): boolean {
    if (currentRetries >= maxRetries) return false;

    // Retry on network errors (statusCode 0) or 5xx server errors
    // Don't retry on 4xx client errors (except 429 rate limit)
    return statusCode === 0 || statusCode >= 500 || statusCode === 429;
  }

  private scheduleRetry(webhookData: WebhookPayload, error: string): Promise<WebhookResult> {
    return new Promise((resolve) => {
      const retryDelay = this.retryIntervals[Math.min(webhookData.retryCount, this.retryIntervals.length - 1)];
      const nextRetryAt = new Date(Date.now() + retryDelay).toISOString();

      const updatedWebhook: WebhookPayload = {
        ...webhookData,
        retryCount: webhookData.retryCount + 1,
        nextRetryAt
      };

      ErrorLogger.logWarning(`Webhook failed, scheduling retry ${updatedWebhook.retryCount}/${webhookData.maxRetries}`, {
        additionalData: {
          webhookId: webhookData.id,
          error,
          nextRetryAt,
          retryDelay
        }
      });

      // Add to retry queue
      this.retryQueue.push(updatedWebhook);

      // Set up callback for when retry completes
      const checkRetryComplete = () => {
        const completedWebhook = this.retryQueue.find(w => w.id === webhookData.id);
        if (!completedWebhook) {
          // Webhook was processed, check results
          setTimeout(checkRetryComplete, 100);
        }
      };

      setTimeout(checkRetryComplete, retryDelay + 1000);
    });
  }

  private startProcessor() {
    setInterval(() => {
      if (!this.isProcessing && this.retryQueue.length > 0) {
        this.processRetryQueue();
      }
    }, 1000);
  }

  private async processRetryQueue() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    const now = new Date();

    try {
      const readyWebhooks = this.retryQueue.filter(webhook =>
        new Date(webhook.nextRetryAt) <= now
      );

      for (const webhook of readyWebhooks) {
        // Remove from queue
        this.retryQueue = this.retryQueue.filter(w => w.id !== webhook.id);

        // Execute retry
        try {
          await this.executeWebhook(webhook);
        } catch (error) {
          console.error('Error processing webhook retry:', error);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private parseResponseBody(body: string): any {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  private generateWebhookId(): string {
    return `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get retry queue status for monitoring
  getQueueStatus(): {
    queueLength: number;
    oldestRetry: string | null;
    failingWebhooks: string[];
  } {
    const now = new Date();
    const oldestWebhook = this.retryQueue.sort((a, b) =>
      new Date(a.nextRetryAt).getTime() - new Date(b.nextRetryAt).getTime()
    )[0];

    const failingWebhooks = this.retryQueue
      .filter(w => w.retryCount >= w.maxRetries - 1)
      .map(w => w.url);

    return {
      queueLength: this.retryQueue.length,
      oldestRetry: oldestWebhook?.nextRetryAt || null,
      failingWebhooks
    };
  }
}
