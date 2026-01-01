# Supabase Storage Setup

## Overview

This application uses Supabase Storage for:
- **Profile Images**: User profile pictures
- **CV Imports**: PDF and Markdown files for CV import functionality

The storage bucket `profile-images` is configured to support both use cases.

## Automatic Setup (Recommended)

If you're using Supabase migrations, the storage bucket is created automatically:

```bash
# Apply all migrations (includes storage setup)
supabase db reset

# Or apply migrations manually in order:
psql $DATABASE_URL -f supabase/migrations/002_create_storage_bucket.sql
psql $DATABASE_URL -f supabase/migrations/004_update_storage_bucket_for_cv_imports.sql
```

## Manual Setup

If you need to set up storage manually, follow the steps below.

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `profile-images`
   - **Public bucket**: ✅ Enable (checked)
   - **File size limit**: 10MB (supports images and PDFs)
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/png`
     - `image/gif`
     - `image/webp`
     - `application/pdf` (for CV imports)
     - `text/markdown` (for CV imports)
     - `text/plain` (for CV imports)
5. Click **Create bucket**

**Note**: After creating the bucket, you'll need to set up RLS policies manually (see Option 3 below).

### Option 2: Using Supabase CLI

If you're using Supabase locally:

```bash
# Make sure you're in the project directory
cd /Users/g.sestito/Progetti/cv-ai-enancher

# Create the bucket using SQL
supabase db execute "
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'profile-images', 
    'profile-images', 
    true, 
    10485760, 
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/markdown', 'text/plain']
  )
  ON CONFLICT (id) DO NOTHING;
"
```

**Note**: After creating the bucket, you'll need to set up RLS policies manually (see Option 3 below).

### Option 3: Using SQL Editor

1. Go to Supabase Dashboard > SQL Editor
2. Run this SQL:

```sql
-- Create the profile-images bucket (supports images and CV imports)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images', 
  'profile-images', 
  true, 
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/markdown', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile images" ON storage.objects;

-- Upload policy: Users can upload to their own folder or cv-imports/{userId}/
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

-- View policy: Public read access (since bucket is public)
CREATE POLICY "Public can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Delete policy: Users can delete their own files
CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    (storage.foldername(name))[1] = 'cv-imports' AND auth.uid()::text = (storage.foldername(name))[2]
  )
);
```

## Storage Structure

The `profile-images` bucket uses the following folder structure:

```
profile-images/
├── {userId}/              # User's profile images
│   └── profile.jpg
└── cv-imports/            # CV import files
    └── {userId}/
        └── cv.pdf
```

- **Profile images**: Stored directly in `{userId}/` folder
- **CV imports**: Stored in `cv-imports/{userId}/` folder

## Verify Setup

After creating the bucket, verify the setup:

1. **Check bucket exists**: Go to Storage in Supabase Dashboard
2. **Check bucket configuration**:
   - ✅ Bucket name is exactly `profile-images`
   - ✅ Bucket is set to **public**
   - ✅ File size limit is 10MB
   - ✅ Allowed MIME types include images, PDF, and text files
3. **Check RLS policies**: Go to Storage > Policies
   - ✅ Upload policy allows users to upload to their own folders
   - ✅ View policy allows public read access
   - ✅ Delete policy allows users to delete their own files

### Test Upload

Try uploading a profile image or CV file. The upload should work if:
- ✅ Bucket exists and is named `profile-images`
- ✅ Bucket is set to public
- ✅ RLS policies are configured correctly

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket name is exactly `profile-images` (case-sensitive)
- Check that the bucket exists in your Supabase project
- Verify you're using the correct Supabase project

### Error: "Permission denied"
- Ensure the bucket is set to **public**
- Check that RLS policies are configured correctly
- Verify the user is authenticated (for uploads)
- Check that the file path matches the expected folder structure

### Error: "File size too large"
- Check the bucket's file size limit (should be 10MB)
- Ensure uploaded files are under 10MB
- For larger files, increase the limit in bucket settings

### Error: "Invalid MIME type"
- Verify the file type is in the allowed MIME types list:
  - Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
  - Documents: `application/pdf`, `text/markdown`, `text/plain`
- Update bucket configuration if needed

### CV Import Not Working
- Verify the file is uploaded to `cv-imports/{userId}/` folder
- Check that the file is a PDF or Markdown file
- Ensure the file size is under 10MB
- Check Trigger.dev task logs for import errors

### Profile Image Not Displaying
- Verify the image URL is correct
- Check that the bucket is public
- Ensure the RLS policy allows public read access
- Verify the file path matches `{userId}/filename.ext`

## Related Documentation

- [README.md](../README.md) - Main project documentation
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

