-- Migration 003: Add similarity search function for news dedup

CREATE OR REPLACE FUNCTION find_similar_articles(
  query_embedding vector(768),
  match_city_id TEXT,
  match_threshold FLOAT DEFAULT 0.92,
  match_count INT DEFAULT 5,
  exclude_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    na.id,
    na.title,
    1 - (na.embedding <=> query_embedding) AS similarity
  FROM news_articles na
  WHERE na.city_id = match_city_id
    AND na.embedding IS NOT NULL
    AND na.is_duplicate = false
    AND na.created_at > now() - interval '7 days'
    AND (exclude_id IS NULL OR na.id != exclude_id)
    AND 1 - (na.embedding <=> query_embedding) > match_threshold
  ORDER BY na.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION find_similar_articles(vector, TEXT, FLOAT, INT, UUID) TO authenticated;
