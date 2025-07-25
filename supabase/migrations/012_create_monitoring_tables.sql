-- System errors table
CREATE TABLE IF NOT EXISTS system_errors (
    id VARCHAR(255) PRIMARY KEY,
    level VARCHAR(20) NOT NULL CHECK (level IN ('error', 'warning', 'info')),
    message TEXT NOT NULL,
    stack TEXT,
    context JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id VARCHAR(255) PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('page_load', 'api_call', 'component_render', 'user_action')),
    name VARCHAR(255) NOT NULL,
    duration DECIMAL(10,3) NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id UUID,
    company_id UUID
);

-- Webhook logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
    id VARCHAR(255) PRIMARY KEY,
    url TEXT NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    duration DECIMAL(10,3),
    success BOOLEAN NOT NULL,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_errors_level ON system_errors(level);
CREATE INDEX IF NOT EXISTS idx_system_errors_created_at ON system_errors(created_at);
CREATE INDEX IF NOT EXISTS idx_system_errors_resolved ON system_errors(resolved);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_company ON performance_metrics(company_id);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_success ON webhook_logs(success);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);
