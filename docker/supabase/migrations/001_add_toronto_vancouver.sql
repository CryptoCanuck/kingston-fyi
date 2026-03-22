-- Migration: Add Toronto and Vancouver cities
-- Run against existing databases that already have init.sql applied

INSERT INTO cities (id, name, province, country, timezone, center, bounds, config, is_active) VALUES
  ('toronto', 'Toronto', 'Ontario', 'CA', 'America/Toronto',
    ST_SetSRID(ST_MakePoint(-79.3832, 43.6532), 4326)::geography,
    '{"north": 43.8555, "south": 43.5810, "east": -79.1168, "west": -79.6393}',
    '{"theme_color": "#0369a1", "tagline": "The Six"}',
    true),
  ('vancouver', 'Vancouver', 'British Columbia', 'CA', 'America/Vancouver',
    ST_SetSRID(ST_MakePoint(-123.1207, 49.2827), 4326)::geography,
    '{"north": 49.3170, "south": 49.1990, "east": -123.0234, "west": -123.2247}',
    '{"theme_color": "#0d9488", "tagline": "Pacific Jewel"}',
    true)
ON CONFLICT (id) DO NOTHING;
