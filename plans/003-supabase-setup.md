# Plan 003 — Supabase Setup

**Issue:** [003-supabase-setup.md](../issues/003-supabase-setup.md)
**Módulo:** Backend / Dados
**Referências:** BUSINESS_RULES.md (seção 2), ARCHITECTURE.md (seção 5)

---

## Descrição

Definir o schema completo do banco no Supabase (tabelas, enums, FKs, RLS), gerar types TypeScript, e configurar o cliente Supabase no frontend. Este plan documenta o SQL e as policies — a execução real será via Supabase Dashboard ou migration file.

---

## Arquivos

### [NEW]
- `supabase/migrations/001_initial_schema.sql` — SQL completo do schema (para referência/versionamento)
- `src/lib/supabase.ts` — cliente Supabase configurado
- `src/lib/database.types.ts` — types gerados do schema

### [MODIFY]
- `.env` — adicionar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
- `.gitignore` — garantir que .env está ignorado

---

## Schema SQL

```sql
-- Enums
CREATE TYPE property_status AS ENUM ('new', 'interest', 'scheduled', 'visited', 'discarded', 'favorite');
CREATE TYPE property_type AS ENUM ('apartment', 'house', 'land', 'commercial', 'other');
CREATE TYPE modality AS ENUM ('rent', 'buy');
CREATE TYPE visit_mood AS ENUM ('loved', 'thinking', 'neutral', 'unsure', 'disliked');
CREATE TYPE procon_type AS ENUM ('pro', 'con');

-- Boards
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Nosso Apê',
  invite_code TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles (extends auth.users)
CREATE TABLE users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  board_id UUID REFERENCES boards(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
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

-- Ratings (individual per user per property)
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

-- Visits
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  impressions TEXT,
  mood visit_mood,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pro/Cons
CREATE TABLE pro_cons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  type procon_type NOT NULL,
  text TEXT NOT NULL CHECK (char_length(text) >= 3 AND char_length(text) <= 200),
  added_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ratings_updated_at BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE properties;
ALTER PUBLICATION supabase_realtime ADD TABLE ratings;
```

## RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_cons ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users read own profile" ON users_profile FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON users_profile FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users insert own profile" ON users_profile FOR INSERT WITH CHECK (id = auth.uid());

-- Board access: members only
CREATE POLICY "Board members read" ON boards FOR SELECT
  USING (id IN (SELECT board_id FROM users_profile WHERE id = auth.uid()));
CREATE POLICY "Board owner insert" ON boards FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Properties: board members only
CREATE POLICY "Properties board access" ON properties FOR ALL
  USING (board_id IN (SELECT board_id FROM users_profile WHERE id = auth.uid()));

-- Ratings: board members only (via property)
CREATE POLICY "Ratings board access" ON ratings FOR ALL
  USING (property_id IN (
    SELECT p.id FROM properties p
    JOIN users_profile u ON u.board_id = p.board_id
    WHERE u.id = auth.uid()
  ));

-- Visits: board members only (via property)
CREATE POLICY "Visits board access" ON visits FOR ALL
  USING (property_id IN (
    SELECT p.id FROM properties p
    JOIN users_profile u ON u.board_id = p.board_id
    WHERE u.id = auth.uid()
  ));

-- Pro/Cons: board members only (via property)
CREATE POLICY "ProCons board access" ON pro_cons FOR ALL
  USING (property_id IN (
    SELECT p.id FROM properties p
    JOIN users_profile u ON u.board_id = p.board_id
    WHERE u.id = auth.uid()
  ));
```

---

## Checklist

- [ ] Criar projeto no Supabase Dashboard
- [ ] Executar SQL de schema (enums + tabelas + triggers)
- [ ] Executar SQL de RLS policies
- [ ] Habilitar Realtime para tables properties e ratings
- [ ] Habilitar Google OAuth no Supabase Auth settings
- [ ] Gerar types TypeScript do schema
- [ ] Criar `src/lib/supabase.ts` com createClient
- [ ] Criar `src/lib/database.types.ts`
- [ ] Configurar `.env` com URL e anon key
- [ ] Verificar: cliente conecta sem erros no console
