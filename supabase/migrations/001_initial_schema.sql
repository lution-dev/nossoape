-- ══════════════════════════════════════════
-- Nosso Apê — Schema Inicial
-- Executar no Supabase SQL Editor
-- ══════════════════════════════════════════

-- ─── Enums ───

CREATE TYPE property_status AS ENUM ('new', 'interest', 'scheduled', 'visited', 'discarded', 'favorite');
CREATE TYPE property_type AS ENUM ('apartment', 'house', 'land', 'commercial', 'other');
CREATE TYPE modality AS ENUM ('rent', 'buy');
CREATE TYPE visit_mood AS ENUM ('loved', 'thinking', 'neutral', 'unsure', 'disliked');
CREATE TYPE procon_type AS ENUM ('pro', 'con');

-- ─── Boards ───

CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Nosso Apê',
  invite_code TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── User Profiles (extends auth.users) ───

CREATE TABLE users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  board_id UUID REFERENCES boards(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Properties ───

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  url TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  image_url TEXT,
  price TEXT,
  modality modality NOT NULL DEFAULT 'rent',
  address TEXT,
  neighborhood TEXT,
  type property_type NOT NULL DEFAULT 'apartment',
  area INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  parking_spots INTEGER,
  status property_status NOT NULL DEFAULT 'new',
  added_by UUID NOT NULL REFERENCES auth.users(id),
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Ratings (individual per user per property) ───

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(property_id, user_id)
);

-- ─── Visits ───

CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  impressions TEXT,
  mood visit_mood,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Pro/Cons ───

CREATE TABLE pro_cons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  type procon_type NOT NULL,
  text TEXT NOT NULL CHECK (char_length(text) >= 3 AND char_length(text) <= 200),
  added_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Triggers: auto-update updated_at ───

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ratings_updated_at
  BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Enable Realtime ───

ALTER PUBLICATION supabase_realtime ADD TABLE properties;
ALTER PUBLICATION supabase_realtime ADD TABLE ratings;

-- ══════════════════════════════════════════
-- Row Level Security (RLS)
-- ══════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_cons ENABLE ROW LEVEL SECURITY;

-- ─── users_profile policies ───

CREATE POLICY "Users read own profile"
  ON users_profile FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users update own profile"
  ON users_profile FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users insert own profile"
  ON users_profile FOR INSERT
  WITH CHECK (id = auth.uid());

-- Allow reading other board members' profiles
CREATE POLICY "Read board members profiles"
  ON users_profile FOR SELECT
  USING (
    board_id IN (SELECT board_id FROM users_profile WHERE id = auth.uid())
  );

-- ─── boards policies ───

CREATE POLICY "Board members can read"
  ON boards FOR SELECT
  USING (
    id IN (SELECT board_id FROM users_profile WHERE id = auth.uid())
  );

CREATE POLICY "Authenticated users can create boards"
  ON boards FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Allow reading board by invite code (for joining)
CREATE POLICY "Anyone can read board by invite code"
  ON boards FOR SELECT
  USING (true);

-- ─── properties policies ───

CREATE POLICY "Properties board access"
  ON properties FOR ALL
  USING (
    board_id IN (SELECT board_id FROM users_profile WHERE id = auth.uid())
  );

-- ─── ratings policies ───

CREATE POLICY "Ratings board access"
  ON ratings FOR ALL
  USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN users_profile u ON u.board_id = p.board_id
      WHERE u.id = auth.uid()
    )
  );

-- ─── visits policies ───

CREATE POLICY "Visits board access"
  ON visits FOR ALL
  USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN users_profile u ON u.board_id = p.board_id
      WHERE u.id = auth.uid()
    )
  );

-- ─── pro_cons policies ───

CREATE POLICY "ProCons board access"
  ON pro_cons FOR ALL
  USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN users_profile u ON u.board_id = p.board_id
      WHERE u.id = auth.uid()
    )
  );
