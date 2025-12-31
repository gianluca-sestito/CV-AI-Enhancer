# Supabase Storage Setup

## Creating the Profile Images Bucket

To enable profile image uploads, you need to create a storage bucket in Supabase.

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `profile-images`
   - **Public bucket**: ✅ Enable (checked)
   - **File size limit**: 5MB (or your preferred limit)
   - **Allowed MIME types**: `image/*` (or leave empty for all)
5. Click **Create bucket**

### Option 2: Using Supabase CLI

If you're using Supabase locally:

```bash
# Make sure you're in the project directory
cd /Users/g.sestito/Progetti/cv-ai-enancher

# Create the bucket using SQL
supabase db execute "
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
  ON CONFLICT (id) DO NOTHING;
"
```

### Option 3: Using SQL Editor

1. Go to Supabase Dashboard > SQL Editor
2. Run this SQL:

```sql
-- Create the profile-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own profile images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Verify Setup

After creating the bucket, try uploading a profile image again. The upload should work if:
- ✅ Bucket exists and is named `profile-images`
- ✅ Bucket is set to public
- ✅ RLS policies are configured (optional but recommended)

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket name is exactly `profile-images`
- Check that the bucket exists in your Supabase project

### Error: "Permission denied"
- Ensure the bucket is set to **public**
- Or configure proper RLS policies as shown above

### Error: "File size too large"
- Check the bucket's file size limit
- Ensure uploaded images are under 5MB

