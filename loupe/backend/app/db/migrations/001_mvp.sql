CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  image_url TEXT,
  category TEXT,
  identified_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id),
  source_data JSONB,
  result JSONB,
  confidence JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON valuations (scan_id, created_at);
