-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own company data
CREATE POLICY "Users can view own company" ON users
    FOR ALL USING (
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

-- Similar policies for all tables ensuring company_id isolation
CREATE POLICY "Company data isolation" ON clients
    FOR ALL USING (
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Company data isolation" ON jobs
    FOR ALL USING (
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Company data isolation" ON materials
    FOR ALL USING (
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Company data isolation" ON labor_entries
    FOR ALL USING (
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Company data isolation" ON quotes
    FOR ALL USING (
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );
