-- Migration 002: Schema evolution for CityFYI PRD
-- Adds pgvector, news tables, business claiming, review moderation, analytics

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

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

-- News RLS
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News sources are publicly readable"
  ON news_sources FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage news sources"
  ON news_sources FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "News articles are publicly readable"
  ON news_articles FOR SELECT
  TO anon, authenticated
  USING (is_duplicate = false);

CREATE POLICY "Admins can manage news articles"
  ON news_articles FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- News grants
GRANT SELECT ON news_sources TO anon, authenticated;
GRANT ALL ON news_sources TO authenticated;
GRANT SELECT ON news_articles TO anon, authenticated;
GRANT ALL ON news_articles TO authenticated;

-- ============================================================================
-- BUSINESS CLAIMING
-- ============================================================================

-- Extend places table
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

-- Business claiming RLS
ALTER TABLE business_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims"
  ON business_claims FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create claims"
  ON business_claims FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage claims"
  ON business_claims FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own updates"
  ON business_updates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create updates for owned places"
  ON business_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM places WHERE id = place_id AND claimed_by = auth.uid())
  );

CREATE POLICY "Admins can view all updates"
  ON business_updates FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Business claiming grants
GRANT SELECT, INSERT ON business_claims TO authenticated;
GRANT ALL ON business_claims TO authenticated;
GRANT SELECT, INSERT ON business_updates TO authenticated;
GRANT ALL ON business_updates TO authenticated;

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

GRANT EXECUTE ON FUNCTION approve_business_claim(UUID, UUID) TO authenticated;

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

-- Review responses RLS
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Review responses are publicly readable"
  ON review_responses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Business owners can respond to reviews on their places"
  ON review_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM reviews r
      JOIN places p ON r.place_id = p.id
      WHERE r.id = review_id AND p.claimed_by = auth.uid()
    )
  );

CREATE POLICY "Users can update own responses"
  ON review_responses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT ON review_responses TO anon, authenticated;
GRANT INSERT, UPDATE ON review_responses TO authenticated;

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

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT INSERT ON notifications TO authenticated;

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

-- No RLS — server-side insert only via service role

GRANT INSERT ON analytics_events TO authenticated;

-- ============================================================================
-- COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 002: Schema evolution complete — pgvector, news, claiming, moderation, analytics';
END $$;
