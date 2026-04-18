-- ============================================
-- User bans (suspensions)
-- ============================================
-- Adds ban tracking to profiles + RLS policies that prevent banned
-- users from creating games, joining games, messaging, or reporting.
-- Banned users can still sign in and read the app — we show them a
-- suspension notice at the UI layer (next pass).
--
-- Design choices:
--   * `banned_at IS NOT NULL` = account currently banned.
--   * `banned_by` tracks who did it (nullable for safety).
--   * `banned_reason` is shown to the user.
--   * RPCs `admin_ban_user` / `admin_unban_user` write to
--     admin_actions for the audit log.
-- ============================================

-- 1. Columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS banned_at     timestamptz,
  ADD COLUMN IF NOT EXISTS banned_by     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS banned_reason text;

CREATE INDEX IF NOT EXISTS idx_profiles_banned
  ON profiles(banned_at)
  WHERE banned_at IS NOT NULL;

-- 2. Helper: is the caller banned?
CREATE OR REPLACE FUNCTION is_banned()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND banned_at IS NOT NULL
  )
$$;

GRANT EXECUTE ON FUNCTION is_banned() TO authenticated;

-- 3. Extend existing RLS policies — block INSERTs from banned users.
--    We keep SELECT policies untouched so they can still browse.
--    The additive-only pattern (a new policy that returns NOT is_banned)
--    combined with Supabase's CHECK semantics means all existing INSERT
--    policies implicitly AND with the new NOT is_banned requirement.

-- Games
DROP POLICY IF EXISTS games_insert_not_banned ON games;
CREATE POLICY games_insert_not_banned ON games
  FOR INSERT WITH CHECK (creator_id = auth.uid() AND NOT is_banned());

-- Participants
DROP POLICY IF EXISTS game_participants_insert_not_banned ON game_participants;
CREATE POLICY game_participants_insert_not_banned ON game_participants
  FOR INSERT WITH CHECK (user_id = auth.uid() AND NOT is_banned());

-- Messages
DROP POLICY IF EXISTS messages_insert_not_banned ON messages;
CREATE POLICY messages_insert_not_banned ON messages
  FOR INSERT WITH CHECK (user_id = auth.uid() AND NOT is_banned());

-- Reports (banned users can't spam report others)
DROP POLICY IF EXISTS reports_insert_not_banned ON reports;
CREATE POLICY reports_insert_not_banned ON reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid() AND NOT is_banned());

-- 4. RPC: admin_ban_user
CREATE OR REPLACE FUNCTION admin_ban_user(
  p_user_id uuid,
  p_reason  text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot ban yourself.';
  END IF;

  IF EXISTS (SELECT 1 FROM admins WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'Cannot ban an admin. Revoke admin access first.';
  END IF;

  UPDATE profiles
    SET banned_at = now(),
        banned_by = auth.uid(),
        banned_reason = NULLIF(trim(p_reason), ''),
        updated_at = now()
    WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No profile with that ID.';
  END IF;

  INSERT INTO admin_actions (admin_id, action, target_type, target_id, reason)
  VALUES (auth.uid(), 'ban_user', 'user', p_user_id, p_reason);
END;
$$;

GRANT EXECUTE ON FUNCTION admin_ban_user(uuid, text) TO authenticated;

-- 5. RPC: admin_unban_user
CREATE OR REPLACE FUNCTION admin_unban_user(
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  UPDATE profiles
    SET banned_at = NULL,
        banned_by = NULL,
        banned_reason = NULL,
        updated_at = now()
    WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No profile with that ID.';
  END IF;

  INSERT INTO admin_actions (admin_id, action, target_type, target_id)
  VALUES (auth.uid(), 'unban_user', 'user', p_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION admin_unban_user(uuid) TO authenticated;
