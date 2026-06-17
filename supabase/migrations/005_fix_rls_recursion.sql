-- ══════════════════════════════════════════
-- Migration 005: Fix infinite recursion in RLS policies
-- 
-- Problem: "Read board members profiles" policy on users_profile
-- references users_profile itself, causing PostgreSQL error 42P17
-- "infinite recursion detected in policy for relation users_profile"
--
-- Solution: Create a SECURITY DEFINER function that bypasses RLS
-- to fetch the current user's board_id, then use it in all policies
-- that previously did subqueries on users_profile.
-- ══════════════════════════════════════════

-- Step 1: Create helper function (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION get_my_board_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT board_id FROM users_profile WHERE id = auth.uid()
$$;

-- ─── Fix users_profile policies ───

-- Drop the recursive policy
DROP POLICY IF EXISTS "Read board members profiles" ON users_profile;

-- Recreate using the safe function
CREATE POLICY "Read board members profiles"
  ON users_profile FOR SELECT
  USING (board_id = get_my_board_id());

-- ─── Fix boards policies ───

DROP POLICY IF EXISTS "Board members can read" ON boards;

CREATE POLICY "Board members can read"
  ON boards FOR SELECT
  USING (id = get_my_board_id());

-- ─── Fix ratings policies ───

DROP POLICY IF EXISTS "Ratings board access" ON ratings;

CREATE POLICY "Ratings board access"
  ON ratings FOR ALL
  USING (
    property_id IN (
      SELECT id FROM properties WHERE board_id = get_my_board_id()
    )
  );

-- ─── Fix visits policies ───

DROP POLICY IF EXISTS "Visits board access" ON visits;

CREATE POLICY "Visits board access"
  ON visits FOR ALL
  USING (
    property_id IN (
      SELECT id FROM properties WHERE board_id = get_my_board_id()
    )
  );

-- ─── Fix pro_cons policies ───

DROP POLICY IF EXISTS "ProCons board access" ON pro_cons;

CREATE POLICY "ProCons board access"
  ON pro_cons FOR ALL
  USING (
    property_id IN (
      SELECT id FROM properties WHERE board_id = get_my_board_id()
    )
  );
