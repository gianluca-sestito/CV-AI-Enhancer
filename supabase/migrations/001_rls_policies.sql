-- Enable Row Level Security on all tables (only if tables exist)
-- This migration is idempotent and safe to run even if tables don't exist yet
DO $$
BEGIN
  -- Enable RLS on profiles
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on work_experiences
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'work_experiences') THEN
    ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on skills
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'skills') THEN
    ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on education
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'education') THEN
    ALTER TABLE education ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on languages
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'languages') THEN
    ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on job_descriptions
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_descriptions') THEN
    ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on analysis_results
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'analysis_results') THEN
    ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on generated_cvs
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'generated_cvs') THEN
    ALTER TABLE generated_cvs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Profiles policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

    -- Create policies
    CREATE POLICY "Users can view own profile"
      ON profiles FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own profile"
      ON profiles FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Work experiences policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'work_experiences') THEN
    DROP POLICY IF EXISTS "Users can manage own work experiences" ON work_experiences;
    
    CREATE POLICY "Users can manage own work experiences"
      ON work_experiences FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = work_experiences.profile_id
          AND profiles.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Skills policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'skills') THEN
    DROP POLICY IF EXISTS "Users can manage own skills" ON skills;
    
    CREATE POLICY "Users can manage own skills"
      ON skills FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = skills.profile_id
          AND profiles.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Education policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'education') THEN
    DROP POLICY IF EXISTS "Users can manage own education" ON education;
    
    CREATE POLICY "Users can manage own education"
      ON education FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = education.profile_id
          AND profiles.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Languages policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'languages') THEN
    DROP POLICY IF EXISTS "Users can manage own languages" ON languages;
    
    CREATE POLICY "Users can manage own languages"
      ON languages FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = languages.profile_id
          AND profiles.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Job descriptions policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_descriptions') THEN
    DROP POLICY IF EXISTS "Users can manage own job descriptions" ON job_descriptions;
    
    CREATE POLICY "Users can manage own job descriptions"
      ON job_descriptions FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Analysis results policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'analysis_results') THEN
    DROP POLICY IF EXISTS "Users can manage own analysis results" ON analysis_results;
    
    CREATE POLICY "Users can manage own analysis results"
      ON analysis_results FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Generated CVs policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'generated_cvs') THEN
    DROP POLICY IF EXISTS "Users can manage own generated CVs" ON generated_cvs;
    
    CREATE POLICY "Users can manage own generated CVs"
      ON generated_cvs FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

