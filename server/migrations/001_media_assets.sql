CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY,
  place_id TEXT NOT NULL,
  storage_driver TEXT NOT NULL CHECK (storage_driver IN ('local', 'r2')),
  object_key TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('image', 'video')),
  original_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  byte_size BIGINT NOT NULL CHECK (byte_size >= 0),
  width INTEGER,
  height INTEGER,
  duration_ms INTEGER,
  poster_object_key TEXT,
  alt_text TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS media_assets_place_id_sort_order_idx
  ON media_assets (place_id, sort_order, created_at);
