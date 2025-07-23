-- Add foreign key constraints after both tables are properly structured
ALTER TABLE users ADD CONSTRAINT fk_users_company 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Note: We'll handle auth_user_id constraint after linking test data