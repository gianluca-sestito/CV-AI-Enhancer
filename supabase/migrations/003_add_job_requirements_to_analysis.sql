-- Add job_requirements column to analysis_results table
-- This stores the extracted job requirements (requiredSkills, preferredSkills, etc.)
-- to avoid re-extracting them during CV generation

-- Only add column if table exists (table is created by Prisma)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'analysis_results'
  ) THEN
    ALTER TABLE analysis_results
    ADD COLUMN IF NOT EXISTS job_requirements JSONB;

    COMMENT ON COLUMN analysis_results.job_requirements IS 'Extracted job requirements (requiredSkills, preferredSkills, qualifications, experienceLevel, keyResponsibilities)';
  END IF;
END $$;


