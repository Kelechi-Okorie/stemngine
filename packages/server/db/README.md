4. Access PostgreSQL (first login)

Run:

psql -U postgres

It will ask for the password you set during install.

If successful, you’ll see:

postgres=#
5. Create your database (STEMngine DB)

Inside psql:

CREATE DATABASE stemngine;

Connect to it:

\c stemngine
6. Create your tables (core schema)

Run this exactly:

Artifacts table
CREATE TABLE artifacts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    subject TEXT,
    domain TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
Edges table
CREATE TABLE edges (
    id SERIAL PRIMARY KEY,
    from_id TEXT NOT NULL,
    to_id TEXT NOT NULL,
    type TEXT NOT NULL,
    metadata JSONB,

    FOREIGN KEY (from_id) REFERENCES artifacts(id),
    FOREIGN KEY (to_id) REFERENCES artifacts(id)
);
7. Add indexes (IMPORTANT for performance)

Run:

CREATE INDEX idx_artifacts_type ON artifacts(type);
CREATE INDEX idx_artifacts_data ON artifacts USING GIN (data);

CREATE INDEX idx_edges_from ON edges(from_id);
CREATE INDEX idx_edges_to ON edges(to_id);
CREATE INDEX idx_edges_type ON edges(type);
8. Install Node Postgres client

In your project:

npm install pg
9. Connect from your Node app

Create a file:

// db.ts
import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "stemngine",
  password: "YOUR_PASSWORD",
  port: 5432,
});

Test it:

const res = await pool.query("SELECT NOW()");
console.log(res.rows);
10. Insert your first artifact (test)
await pool.query(
  `
  INSERT INTO artifacts (id, type, subject, domain, data)
  VALUES ($1, $2, $3, $4, $5)
  `,
  [
    "physics.mechanics.velocity",
    "concept",
    "physics",
    "mechanics",
    { name: "Velocity" }
  ]
);
11. Insert a relationship (edge)
await pool.query(
  `
  INSERT INTO edges (from_id, to_id, type)
  VALUES ($1, $2, $3)
  `,
  [
    "physics.mechanics.acceleration",
    "physics.mechanics.velocity",
    "depends_on"
  ]
);
12. Verify in psql

Back in psql:

SELECT * FROM artifacts;
SELECT * FROM edges;
13. What you have now (important milestone)

At this point you have:

✅ PostgreSQL installed
✅ Database created
✅ Graph schema (artifacts + edges)
✅ Indexed queries
✅ Node connected


TRUNCATE TABLE edges, artifacts RESTART IDENTITY CASCADE;