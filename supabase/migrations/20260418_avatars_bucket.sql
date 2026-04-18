-- ============================================
-- Avatars storage bucket
-- ============================================
-- Public bucket for profile avatars.
-- Path convention: <user_id>/<filename>  — enforced by RLS so users
-- can only upload under their own uid folder.
-- Apply with:  supabase db push   (or paste into the SQL editor).
-- ============================================

-- 1. Bucket (public-read, 5MB cap, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Policies on storage.objects (scoped to the avatars bucket)
--    Anyone (including anon) can read — avatars are publicly viewable.
DROP POLICY IF EXISTS "avatars: public read" ON storage.objects;
CREATE POLICY "avatars: public read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

--    Authenticated users can write ONLY under their own uid folder.
--    Storage paths look like "<uuid>/avatar-<ts>.jpg"; the first
--    path segment must equal auth.uid().
DROP POLICY IF EXISTS "avatars: insert own" ON storage.objects;
CREATE POLICY "avatars: insert own" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars: update own" ON storage.objects;
CREATE POLICY "avatars: update own" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars: delete own" ON storage.objects;
CREATE POLICY "avatars: delete own" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
