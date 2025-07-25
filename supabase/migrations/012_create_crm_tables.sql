-- Extend existing tables with CRM-specific columns and relationships

-- Enhance clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_type VARCHAR(20) DEFAULT 'residential' CHECK (client_type IN ('residential', 'commercial'));
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect'));
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(20) DEFAULT 'email';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS billing_address JSONB;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(15,2);

-- Client contacts table
CREATE TABLE IF NOT EXISTS client_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhance jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type VARCHAR(50);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS invoice_id UUID; -- For future invoice integration
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS profit_margin DECIMAL(5,2);

-- Job materials relationship table
CREATE TABLE IF NOT EXISTS job_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    material_id UUID NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    allocated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_quantity DECIMAL(10,2) DEFAULT 0,
    notes TEXT
);

-- Job status history for audit trail
CREATE TABLE IF NOT EXISTS job_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Communication log
CREATE TABLE IF NOT EXISTS client_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN ('email', 'phone', 'meeting', 'note')),
    subject VARCHAR(255),
    content TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_contacts_client ON client_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_job_materials_job ON job_materials(job_id);
CREATE INDEX IF NOT EXISTS idx_job_materials_material ON job_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_job_status_history_job ON job_status_history(job_id);
CREATE INDEX IF NOT EXISTS idx_client_communications_client ON client_communications(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(client_type);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- RLS policies for new tables
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Client contacts through clients" ON client_contacts
    FOR ALL USING (
        client_id IN (
            SELECT id FROM clients
            WHERE company_id = (
                SELECT company_id FROM users
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Job materials through jobs" ON job_materials
    FOR ALL USING (
        job_id IN (
            SELECT id FROM jobs
            WHERE company_id = (
                SELECT company_id FROM users
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Job status history through jobs" ON job_status_history
    FOR ALL USING (
        job_id IN (
            SELECT id FROM jobs
            WHERE company_id = (
                SELECT company_id FROM users
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Client communications through clients" ON client_communications
    FOR ALL USING (
        client_id IN (
            SELECT id FROM clients
            WHERE company_id = (
                SELECT company_id FROM users
                WHERE id = auth.uid()
            )
        )
    );
