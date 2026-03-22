-- Supabase PostgreSQL Initialization Script
-- This script runs on first database startup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "postgis_topology";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create required schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- n8n schema (role created by docker/supabase/create-n8n-user.sh)
CREATE SCHEMA IF NOT EXISTS n8n;

-- Set search path to include PostGIS functions
ALTER DATABASE postgres SET search_path TO public, extensions;

-- ============================================================================
-- FUNCTIONS (triggers & helpers)
-- ============================================================================

-- Updated-at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate URL-safe slug from input text
CREATE OR REPLACE FUNCTION generate_slug(input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          trim(input),
          '[^a-zA-Z0-9[:space:]-]', '', 'g'  -- remove non-alphanumeric (keep spaces & hyphens)
        ),
        '\s+', '-', 'g'                -- spaces to hyphens
      ),
      '-+', '-', 'g'                   -- collapse multiple hyphens
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Set city context for RLS
CREATE OR REPLACE FUNCTION set_city_context(p_city_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_city', p_city_id, true);
END;
$$ LANGUAGE plpgsql;

-- Search places with full-text search
CREATE OR REPLACE FUNCTION search_places(
  p_city_id TEXT,
  p_query TEXT,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS SETOF places AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM places
  WHERE city_id = p_city_id
    AND is_active = true
    AND (
      to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
      @@ plainto_tsquery('english', p_query)
    )
  ORDER BY
    ts_rank(
      to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')),
      plainto_tsquery('english', p_query)
    ) DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Find nearby places using PostGIS
CREATE OR REPLACE FUNCTION nearby_places(
  p_city_id TEXT,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_meters INT DEFAULT 1000,
  p_limit INT DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  category_id TEXT,
  description TEXT,
  street_address TEXT,
  location GEOGRAPHY(Point, 4326),
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.category_id,
    p.description,
    p.street_address,
    p.location,
    ST_Distance(p.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) AS distance_meters
  FROM places p
  WHERE p.city_id = p_city_id
    AND p.is_active = true
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_meters
    )
  ORDER BY distance_meters
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Update place rating when reviews change
CREATE OR REPLACE FUNCTION update_place_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_place_id UUID;
BEGIN
  v_place_id := COALESCE(NEW.place_id, OLD.place_id);

  UPDATE places
  SET
    rating = COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.place_id = v_place_id), 0),
    review_count = (SELECT COUNT(*) FROM reviews r WHERE r.place_id = v_place_id),
    updated_at = now()
  WHERE id = v_place_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. Cities
CREATE TABLE cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  province TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'CA',
  timezone TEXT NOT NULL DEFAULT 'America/Toronto',
  center GEOGRAPHY(Point, 4326),
  bounds JSONB,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2. Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  city_id TEXT REFERENCES cities(id),
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'business_owner', 'moderator', 'admin')),
  preferences JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger to auto-create profile on user signup (guarded: auth.users may not exist yet)
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- 3. Categories
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('place', 'event')),
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  parent_id TEXT REFERENCES categories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. Places
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id TEXT NOT NULL REFERENCES cities(id),
  category_id TEXT NOT NULL REFERENCES categories(id),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  street_address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'CA',
  location GEOGRAPHY(Point, 4326),
  phone TEXT,
  email TEXT,
  website TEXT,
  social_media JSONB DEFAULT '{}',
  hours JSONB,
  price_range TEXT,
  subcategories TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  images JSONB DEFAULT '[]',
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(city_id, slug)
);

CREATE TRIGGER set_places_updated_at
  BEFORE UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5. Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id TEXT NOT NULL REFERENCES cities(id),
  category_id TEXT NOT NULL REFERENCES categories(id),
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  venue_name TEXT,
  venue_address TEXT,
  venue_location GEOGRAPHY(Point, 4326),
  organizer_name TEXT,
  organizer_email TEXT,
  organizer_phone TEXT,
  ticket_url TEXT,
  ticket_price TEXT,
  is_free BOOLEAN DEFAULT false,
  images JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(city_id, slug)
);

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6. Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id TEXT NOT NULL REFERENCES cities(id),
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  visit_date DATE,
  images JSONB DEFAULT '[]',
  helpful_count INT NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(place_id, user_id)
);

CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger to update place rating on review changes
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_place_rating();

-- 7. Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id TEXT NOT NULL REFERENCES cities(id),
  type TEXT NOT NULL CHECK (type IN ('place', 'event')),
  data JSONB NOT NULL DEFAULT '{}',
  submitter_name TEXT,
  submitter_email TEXT,
  submitter_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_notes TEXT,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- INDEXES
-- ============================================================================

-- City filtering on all relevant tables
CREATE INDEX idx_profiles_city_id ON profiles(city_id);
CREATE INDEX idx_places_city_id ON places(city_id);
CREATE INDEX idx_events_city_id ON events(city_id);
CREATE INDEX idx_reviews_city_id ON reviews(city_id);
CREATE INDEX idx_submissions_city_id ON submissions(city_id);

-- Category browsing
CREATE INDEX idx_places_city_category ON places(city_id, category_id) WHERE is_active = true;
CREATE INDEX idx_events_city_category ON events(city_id, category_id) WHERE is_active = true;

-- Featured items
CREATE INDEX idx_places_featured ON places(city_id, is_featured) WHERE is_featured = true AND is_active = true;
CREATE INDEX idx_events_featured ON events(city_id, is_featured) WHERE is_featured = true AND is_active = true;

-- GIST spatial indexes
CREATE INDEX idx_places_location ON places USING GIST(location);
CREATE INDEX idx_events_venue_location ON events USING GIST(venue_location);
CREATE INDEX idx_cities_center ON cities USING GIST(center);

-- GIN full-text search
CREATE INDEX idx_places_fts ON places USING GIN(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));
CREATE INDEX idx_events_fts ON events USING GIN(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- Reviews by place and user
CREATE INDEX idx_reviews_place_id ON reviews(place_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Upcoming events
CREATE INDEX idx_events_upcoming ON events(city_id, start_date) WHERE is_active = true;

-- Submissions status
CREATE INDEX idx_submissions_status ON submissions(status) WHERE status = 'pending';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Cities: publicly readable
CREATE POLICY "Cities are publicly readable"
  ON cities FOR SELECT
  TO anon, authenticated
  USING (true);

-- Categories: publicly readable
CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Profiles: publicly readable, users update own
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Places: readable by city context, owners can insert/update
CREATE POLICY "Places are readable by city"
  ON places FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND city_id = current_setting('app.current_city', true)
  );

CREATE POLICY "Owners can insert places"
  ON places FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update own places"
  ON places FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Events: readable by city context, organizers can insert/update
CREATE POLICY "Events are readable by city"
  ON events FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND city_id = current_setting('app.current_city', true)
  );

CREATE POLICY "Organizers can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

-- Reviews: readable by city, users manage own
CREATE POLICY "Reviews are readable by city"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (city_id = current_setting('app.current_city', true));

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Submissions: users view own, anyone can create with city scope
CREATE POLICY "Users can view own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (submitter_id = auth.uid());

CREATE POLICY "Anyone can create submissions"
  ON submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (city_id = current_setting('app.current_city', true));

-- Admin/moderator policies (role checked via profiles table)
CREATE POLICY "Admins can manage places"
  ON places FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  ));

CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  ));

CREATE POLICY "Admins can manage reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  ));

CREATE POLICY "Admins can view all submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  ));

CREATE POLICY "Admins can update submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  ));

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON cities TO anon, authenticated;
GRANT SELECT ON categories TO anon, authenticated;
GRANT SELECT ON profiles TO anon, authenticated;
GRANT UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON places TO authenticated;
GRANT SELECT ON places TO anon;
GRANT SELECT, INSERT, UPDATE ON events TO authenticated;
GRANT SELECT ON events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON reviews TO authenticated;
GRANT SELECT ON reviews TO anon;
GRANT SELECT, INSERT, UPDATE ON submissions TO authenticated;
GRANT INSERT ON submissions TO anon;
GRANT DELETE ON places, events, reviews TO authenticated;

-- Function execution grants
GRANT EXECUTE ON FUNCTION set_updated_at() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_slug(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION set_city_context(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_places(TEXT, TEXT, INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION nearby_places(TEXT, DOUBLE PRECISION, DOUBLE PRECISION, INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_place_rating() TO anon, authenticated;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Cities
INSERT INTO cities (id, name, province, country, timezone, center, bounds, config, is_active) VALUES
  ('kingston', 'Kingston', 'Ontario', 'CA', 'America/Toronto',
    ST_SetSRID(ST_MakePoint(-76.4860, 44.2312), 4326)::geography,
    '{"north": 44.2800, "south": 44.2000, "east": -76.4200, "west": -76.5600}',
    '{"theme_color": "#1e40af", "tagline": "The Limestone City"}',
    true),
  ('ottawa', 'Ottawa', 'Ontario', 'CA', 'America/Toronto',
    ST_SetSRID(ST_MakePoint(-75.6972, 45.4215), 4326)::geography,
    '{"north": 45.5000, "south": 45.3500, "east": -75.6000, "west": -75.8000}',
    '{"theme_color": "#dc2626", "tagline": "Canada''s Capital"}',
    true),
  ('montreal', 'Montreal', 'Quebec', 'CA', 'America/Toronto',
    ST_SetSRID(ST_MakePoint(-73.5674, 45.5019), 4326)::geography,
    '{"north": 45.5800, "south": 45.4400, "east": -73.4800, "west": -73.6600}',
    '{"theme_color": "#7c3aed", "tagline": "La Métropole"}',
    true),
  ('toronto', 'Toronto', 'Ontario', 'CA', 'America/Toronto',
    ST_SetSRID(ST_MakePoint(-79.3832, 43.6532), 4326)::geography,
    '{"north": 43.8555, "south": 43.5810, "east": -79.1168, "west": -79.6393}',
    '{"theme_color": "#0369a1", "tagline": "The Six"}',
    true),
  ('vancouver', 'Vancouver', 'British Columbia', 'CA', 'America/Vancouver',
    ST_SetSRID(ST_MakePoint(-123.1207, 49.2827), 4326)::geography,
    '{"north": 49.3170, "south": 49.1990, "east": -123.0234, "west": -123.2247}',
    '{"theme_color": "#0d9488", "tagline": "Pacific Jewel"}',
    true);

-- Place categories
INSERT INTO categories (id, name, type, icon, sort_order) VALUES
  ('restaurant', 'Restaurants', 'place', 'utensils', 1),
  ('bar', 'Bars', 'place', 'beer', 2),
  ('nightclub', 'Nightclubs', 'place', 'music', 3),
  ('cafe', 'Cafés', 'place', 'coffee', 4),
  ('bakery', 'Bakeries', 'place', 'cake', 5),
  ('shopping', 'Shopping', 'place', 'shopping-bag', 6),
  ('attraction', 'Attractions', 'place', 'landmark', 7),
  ('activity', 'Activities', 'place', 'activity', 8),
  ('service', 'Services', 'place', 'briefcase', 9);

-- Event categories
INSERT INTO categories (id, name, type, icon, sort_order) VALUES
  ('music', 'Music', 'event', 'music', 1),
  ('art', 'Art & Culture', 'event', 'palette', 2),
  ('food', 'Food & Drink', 'event', 'utensils', 3),
  ('sports', 'Sports', 'event', 'trophy', 4),
  ('community', 'Community', 'event', 'users', 5),
  ('education', 'Education', 'event', 'book-open', 6),
  ('business', 'Business', 'event', 'briefcase', 7),
  ('other', 'Other', 'event', 'calendar', 8);

-- ============================================================================
-- NEWS TABLES
-- ============================================================================

CREATE TABLE news_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id TEXT NOT NULL REFERENCES cities(id),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rss', 'scrape')),
  scrape_config JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_fetched_at TIMESTAMPTZ,
  error_count INT NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_news_sources_updated_at
  BEFORE UPDATE ON news_sources
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id TEXT NOT NULL REFERENCES cities(id),
  source_id UUID NOT NULL REFERENCES news_sources(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source_url TEXT NOT NULL UNIQUE,
  source_name TEXT NOT NULL,
  categories TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  sentiment TEXT,
  entities JSONB DEFAULT '{}',
  embedding vector(768),
  is_duplicate BOOLEAN NOT NULL DEFAULT false,
  duplicate_of UUID REFERENCES news_articles(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_news_articles_updated_at
  BEFORE UPDATE ON news_articles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_news_articles_city_id ON news_articles(city_id);
CREATE INDEX idx_news_articles_source_id ON news_articles(source_id);
CREATE INDEX idx_news_articles_published ON news_articles(city_id, published_at DESC) WHERE is_duplicate = false;
CREATE INDEX idx_news_articles_categories ON news_articles USING GIN(categories);
CREATE INDEX idx_news_articles_embedding ON news_articles USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_news_sources_city_id ON news_sources(city_id);

-- ============================================================================
-- BUSINESS CLAIMING
-- ============================================================================

ALTER TABLE places ADD COLUMN IF NOT EXISTS google_place_id TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS source_metadata JSONB DEFAULT '{}';
ALTER TABLE places ADD COLUMN IF NOT EXISTS ai_enrichment JSONB DEFAULT '{}';
ALTER TABLE places ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES profiles(id);
ALTER TABLE places ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT 'unclaimed' CHECK (claim_status IN ('unclaimed', 'pending', 'claimed'));

CREATE INDEX idx_places_google_place_id ON places(google_place_id) WHERE google_place_id IS NOT NULL;
CREATE INDEX idx_places_claimed_by ON places(claimed_by) WHERE claimed_by IS NOT NULL;
CREATE INDEX idx_places_claim_status ON places(claim_status);

CREATE TABLE business_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('phone', 'email', 'document')),
  verification_code TEXT,
  verification_expires_at TIMESTAMPTZ,
  evidence_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(place_id, user_id)
);

CREATE TRIGGER set_business_claims_updated_at
  BEFORE UPDATE ON business_claims
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE business_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_business_claims_place ON business_claims(place_id);
CREATE INDEX idx_business_claims_user ON business_claims(user_id);
CREATE INDEX idx_business_claims_status ON business_claims(status) WHERE status = 'pending';
CREATE INDEX idx_business_updates_place ON business_updates(place_id);

-- Function to approve a business claim
CREATE OR REPLACE FUNCTION approve_business_claim(p_claim_id UUID, p_admin_id UUID)
RETURNS VOID AS $$
DECLARE
  v_place_id UUID;
  v_user_id UUID;
BEGIN
  SELECT place_id, user_id INTO v_place_id, v_user_id
  FROM business_claims WHERE id = p_claim_id AND status = 'pending';

  IF v_place_id IS NULL THEN
    RAISE EXCEPTION 'Claim not found or not pending';
  END IF;

  UPDATE business_claims
  SET status = 'verified', reviewed_by = p_admin_id, reviewed_at = now()
  WHERE id = p_claim_id;

  UPDATE places
  SET claimed_by = v_user_id, claim_status = 'claimed'
  WHERE id = v_place_id;

  UPDATE profiles
  SET role = 'business_owner'
  WHERE id = v_user_id AND role = 'user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REVIEW MODERATION
-- ============================================================================

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending'
  CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged'));
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(3,2);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderation_metadata JSONB DEFAULT '{}';

CREATE INDEX idx_reviews_moderation ON reviews(moderation_status) WHERE moderation_status IN ('pending', 'flagged');

CREATE TABLE review_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(review_id)
);

CREATE TRIGGER set_review_responses_updated_at
  BEFORE UPDATE ON review_responses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_review', 'claim_status', 'news_mention', 'admin_edit', 'system')),
  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ============================================================================
-- ANALYTICS EVENTS
-- ============================================================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id TEXT NOT NULL REFERENCES cities(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'search', 'click', 'listing_view', 'review_submit')),
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  search_query TEXT,
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_city_type_date ON analytics_events(city_id, event_type, created_at);
CREATE INDEX idx_analytics_place_date ON analytics_events(place_id, event_type, created_at) WHERE place_id IS NOT NULL;

-- ============================================================================
-- RLS FOR NEW TABLES
-- ============================================================================

ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- News
CREATE POLICY "News sources are publicly readable" ON news_sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage news sources" ON news_sources FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "News articles are publicly readable" ON news_articles FOR SELECT TO anon, authenticated USING (is_duplicate = false);
CREATE POLICY "Admins can manage news articles" ON news_articles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Business claims
CREATE POLICY "Users can view own claims" ON business_claims FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create claims" ON business_claims FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage claims" ON business_claims FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Business updates
CREATE POLICY "Users can view own updates" ON business_updates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create updates for owned places" ON business_updates FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM places WHERE id = place_id AND claimed_by = auth.uid()));
CREATE POLICY "Admins can view all updates" ON business_updates FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Review responses
CREATE POLICY "Review responses are publicly readable" ON review_responses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Business owners can respond" ON review_responses FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM reviews r JOIN places p ON r.place_id = p.id WHERE r.id = review_id AND p.claimed_by = auth.uid()
  ));
CREATE POLICY "Users can update own responses" ON review_responses FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- GRANTS FOR NEW TABLES
-- ============================================================================

GRANT SELECT ON news_sources TO anon, authenticated;
GRANT ALL ON news_sources TO authenticated;
GRANT SELECT ON news_articles TO anon, authenticated;
GRANT ALL ON news_articles TO authenticated;
GRANT SELECT, INSERT ON business_claims TO authenticated;
GRANT ALL ON business_claims TO authenticated;
GRANT SELECT, INSERT ON business_updates TO authenticated;
GRANT ALL ON business_updates TO authenticated;
GRANT SELECT ON review_responses TO anon, authenticated;
GRANT INSERT, UPDATE ON review_responses TO authenticated;
GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT INSERT ON notifications TO authenticated;
GRANT INSERT ON analytics_events TO authenticated;
GRANT EXECUTE ON FUNCTION approve_business_claim(UUID, UUID) TO authenticated;

-- ============================================================================
-- COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'FYI Multi-City Platform database initialized with full CityFYI schema';
END $$;
