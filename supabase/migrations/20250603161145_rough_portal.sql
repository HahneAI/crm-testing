/*
  # Create materials used table

  1. New Tables
    - `materials_used`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs.id)
      - `material_name` (text, not null)
      - `quantity` (numeric, not null)
      - `cost` (numeric, not null)
      - `created_at` (timestamp with time zone, defaults to now())
      - `added_by` (uuid, references users.id)
  2. Security
    - Enable RLS on `materials_used` table
    - Add policies for access control
*/

CREATE TABLE IF NOT EXISTS materials_used (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id),
  material_name text NOT NULL,
  quantity numeric NOT NULL,
  cost numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  added_by uuid NOT NULL REFERENCES users(id)
);

-- Enable Row Level Security
ALTER TABLE materials_used ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view materials for jobs in their company"
  ON materials_used
  FOR SELECT
  TO authenticated
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE jobs.company_id IN (
        SELECT company_id FROM users
        WHERE users.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert materials"
  ON materials_used
  FOR INSERT
  TO authenticated
  WITH CHECK (
    added_by = auth.uid() AND
    job_id IN (
      SELECT id FROM jobs
      WHERE jobs.company_id IN (
        SELECT company_id FROM users
        WHERE users.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update materials they added"
  ON materials_used
  FOR UPDATE
  TO authenticated
  USING (added_by = auth.uid());

CREATE POLICY "Admins can update any materials in their company"
  ON materials_used
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth.uid() = users.id
      AND users.role = 'admin'
      AND users.company_id IN (
        SELECT company_id FROM jobs
        WHERE jobs.id = materials_used.job_id
      )
    )
  );