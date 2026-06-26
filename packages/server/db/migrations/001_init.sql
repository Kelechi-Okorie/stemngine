
CREATE TABLE IF NOT EXISTS artifacts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    slug TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- materialized projection of relationships[]
CREATE TABLE IF NOT EXISTS edges (
    id SERIAL PRIMARY KEY,
    from_id TEXT NOT NULL,
    to_id TEXT NOT NULL,
    type TEXT NOT NULL,
    metadata JSONB,

    FOREIGN KEY (from_id) REFERENCES artifacts(id),
    FOREIGN KEY (to_id) REFERENCES artifacts(id),
    CONSTRAINT edges_unique UNIQUE (from_id, to_id, type)
);




-- CREATE TABLE user_progress (
--   user_id TEXT,
--   concept_id TEXT,
--   completed BOOLEAN,
--   PRIMARY KEY (user_id, concept_id)
-- );
