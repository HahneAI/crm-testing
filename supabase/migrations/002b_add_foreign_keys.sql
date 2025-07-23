-- Add foreign key constraints with proper error handling
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_company;
ALTER TABLE users ADD CONSTRAINT fk_users_company 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;