-- First, create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update companies table
ALTER TABLE IF EXISTS companies
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create trigger for companies updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update users table - Fix: Check if full_name exists instead of renaming
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'full_name'
  ) THEN
    -- Add full_name if it doesn't exist
    ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
  END IF;
END $$;

ALTER TABLE IF EXISTS users
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create trigger for users updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update jobs table
ALTER TABLE IF EXISTS jobs
ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(8,2),
ADD COLUMN IF NOT EXISTS actual_hours NUMERIC(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS actual_cost NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS actual_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS actual_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS client_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS client_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create trigger for jobs updated_at
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update labor_entries table
ALTER TABLE IF EXISTS labor_entries
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(8,2),
ADD COLUMN IF NOT EXISTS total_cost NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS break_duration INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create trigger for labor_entries updated_at
DROP TRIGGER IF EXISTS update_labor_entries_updated_at ON labor_entries;
CREATE TRIGGER update_labor_entries_updated_at
BEFORE UPDATE ON labor_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update materials_used table
ALTER TABLE IF EXISTS materials_used
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'units',
ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS total_cost NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS supplier VARCHAR(255),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create trigger for materials_used updated_at
DROP TRIGGER IF EXISTS update_materials_used_updated_at ON materials_used;
CREATE TRIGGER update_materials_used_updated_at
BEFORE UPDATE ON materials_used
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create job_photos table if it doesn't exist
CREATE TABLE IF NOT EXISTS job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  taken_by UUID REFERENCES users(id) ON DELETE SET NULL,
  taken_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on job_id for job_photos
CREATE INDEX IF NOT EXISTS idx_job_photos_job_id ON job_photos(job_id);

-- Enable RLS on job_photos
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for job_photos (removed IF NOT EXISTS which was causing the error)
DO $$
BEGIN
  -- Check if the policy exists first
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'job_photos' 
    AND policyname = 'Users can upload photos to their company jobs'
  ) THEN
    CREATE POLICY "Users can upload photos to their company jobs"
      ON job_photos
      FOR INSERT
      TO authenticated
      WITH CHECK (
        job_id IN (
          SELECT jobs.id FROM jobs
          WHERE jobs.company_id IN (
            SELECT users.company_id FROM users
            WHERE users.id = auth.uid()
          )
        )
      );
  END IF;

  -- Check if the policy exists first
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'job_photos' 
    AND policyname = 'Users can view photos for their company jobs'
  ) THEN
    CREATE POLICY "Users can view photos for their company jobs"
      ON job_photos
      FOR SELECT
      TO authenticated
      USING (
        job_id IN (
          SELECT jobs.id FROM jobs
          WHERE jobs.company_id IN (
            SELECT users.company_id FROM users
            WHERE users.id = auth.uid()
          )
        )
      );
  END IF;
END
$$;