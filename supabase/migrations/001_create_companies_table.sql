-- companies table with UUID and enterprise features
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    geo_code VARCHAR(10), -- Geographic encoding for UUID
    profit_tier VARCHAR(20), -- Profit tier encoding for UUID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true
);
