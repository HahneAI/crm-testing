-- Add missing columns to existing companies table (preserve Task 1 work)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS geo_code VARCHAR(10);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS profit_tier VARCHAR(20);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'basic';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index on slug for performance
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- Populate slug column with name-based slugs for existing records
UPDATE companies 
SET slug = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '.', ''), '&', 'and')) 
WHERE slug IS NULL;

-- Make slug unique after population
ALTER TABLE companies ADD CONSTRAINT unique_companies_slug UNIQUE (slug);