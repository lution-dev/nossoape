-- TEMP: Allow inserts without auth for development
-- Remove this before production!

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Properties board access" ON properties;

-- Create permissive policies for dev
CREATE POLICY "Dev: Allow all on properties"
  ON properties FOR ALL
  USING (true)
  WITH CHECK (true);

-- Also relax the foreign key constraint for dev by allowing null refs
-- We'll add a test board and user:

-- Create a dev board
INSERT INTO boards (id, name, invite_code, owner_id)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Dev Board',
  'DEV123',
  '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;
