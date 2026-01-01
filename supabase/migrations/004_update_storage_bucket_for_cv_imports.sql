-- Update profile-images bucket to allow PDF and Markdown files for CV imports
-- This migration updates the existing bucket configuration

UPDATE storage.buckets
SET 
  file_size_limit = 10485760, -- 10MB (increased from 5MB)
  allowed_mime_types = ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'application/pdf',
    'text/markdown',
    'text/plain'
  ]
WHERE id = 'profile-images';

-- Update RLS policy to allow CV imports in cv-imports subfolder
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;

CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' AND
  (
    -- Allow uploads to user's own folder (for profile images)
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- Allow uploads to cv-imports/{userId}/ folder (for CV imports)
    (storage.foldername(name))[1] = 'cv-imports' AND auth.uid()::text = (storage.foldername(name))[2]
  )
);

-- Update view policy to allow public access to CV imports
DROP POLICY IF EXISTS "Public can view profile images" ON storage.objects;

CREATE POLICY "Public can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

