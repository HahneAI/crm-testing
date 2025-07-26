-- Critical indexes for performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_clients_company_id ON clients(company_id);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_materials_company_id ON materials(company_id);
CREATE INDEX idx_labor_entries_company_id ON labor_entries(company_id);
CREATE INDEX idx_labor_entries_job_id ON labor_entries(job_id);
CREATE INDEX idx_quotes_company_id ON quotes(company_id);
CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);

-- Composite indexes for common queries
CREATE INDEX idx_jobs_company_status ON jobs(company_id, status);
CREATE INDEX idx_quotes_company_status ON quotes(company_id, status);
