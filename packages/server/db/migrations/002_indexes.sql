
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);
CREATE INDEX IF NOT EXISTS idx_artifacts_data ON artifacts USING GIN (data);

CREATE UNIQUE INDEX IF NOT EXISTS idx_artifacts_type_slug
ON artifacts(type,slug)
WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_edges_from ON edges(from_id);
CREATE INDEX IF NOT EXISTS idx_edges_to ON edges(to_id);
CREATE INDEX IF NOT EXISTS idx_edges_type ON edges(type);
CREATE INDEX IF NOT EXISTS idx_edges_from_type on edges(from_id, type);
