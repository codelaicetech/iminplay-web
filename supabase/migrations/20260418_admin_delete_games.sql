-- ============================================
-- Admin delete games
-- ============================================
-- Adds hard-delete capability to moderators. Distinct from
-- admin_cancel_game (which flips status to 'cancelled' but keeps the
-- record for history): this drops the row entirely, relying on the
-- existing ON DELETE CASCADE on game_participants + messages to
-- clean up dependents.
--
-- Writes to admin_actions for the audit trail, so even deleted games
-- leave a forensic breadcrumb with the reason + who did it + when.
-- ============================================

-- 1. RLS policy allowing admins to DELETE games. Additive to the
--    existing policy stack (users still can't delete games).
DROP POLICY IF EXISTS games_delete_admin ON games;
CREATE POLICY games_delete_admin ON games
  FOR DELETE USING (is_admin());

-- 2. RPC: single game delete with audit
CREATE OR REPLACE FUNCTION admin_delete_game(
  p_game_id uuid,
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

  -- Log BEFORE delete — audit_actions target_id would otherwise
  -- point at a row we're about to remove, which is fine (target_id
  -- is just a uuid string, not a foreign key) but this keeps the
  -- ordering clear.
  INSERT INTO admin_actions (admin_id, action, target_type, target_id, reason)
  VALUES (auth.uid(), 'delete_game', 'game', p_game_id, p_reason);

  DELETE FROM games WHERE id = p_game_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No game with that ID.';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_delete_game(uuid, text) TO authenticated;

-- 3. RPC: bulk delete + audit. Accepts an array of uuids so callers
--    can pre-filter (e.g. "all pending in Cape Town") in the server
--    action and hand the ID set in. Returns the number deleted.
CREATE OR REPLACE FUNCTION admin_bulk_delete_games(
  p_game_ids uuid[],
  p_reason   text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id      uuid;
  v_deleted integer := 0;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  IF p_game_ids IS NULL OR array_length(p_game_ids, 1) IS NULL THEN
    RETURN 0;
  END IF;

  -- One audit row per deletion. Noisy for huge batches but keeps the
  -- audit log at the same per-action granularity as single deletes.
  FOREACH v_id IN ARRAY p_game_ids LOOP
    INSERT INTO admin_actions (admin_id, action, target_type, target_id, reason)
    VALUES (auth.uid(), 'delete_game', 'game', v_id, p_reason);

    DELETE FROM games WHERE id = v_id;
    IF FOUND THEN
      v_deleted := v_deleted + 1;
    END IF;
  END LOOP;

  RETURN v_deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_bulk_delete_games(uuid[], text) TO authenticated;
