import fs from "fs";
import path from "path";
import { pool } from "./client.js";
import { fileURLToPath } from 'url';
import { Artifact } from "../src/Interfaces.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS_DIR = path.join(__dirname, "./seeds");

function walk(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    let files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files = files.concat(walk(fullPath));
        } else if (entry.name.endsWith(".json")) {
            files.push(fullPath);
        }
    }

    return files;
}

function loadArtifacts(): Artifact[] {
    const files = walk(ARTIFACTS_DIR);

    const artifacts: Artifact[] = [];

    for (const file of files) {
        const raw = fs.readFileSync(file, "utf-8");

        try {

            const parsed = JSON.parse(raw);
            artifacts.push(parsed);

        } catch (e) {

            console.warn("Skipping invalid file:", file);

        }
    }

    return artifacts;
}

async function insertArtifacts(artifacts: Artifact[]) {

    for (const a of artifacts) {
        await pool.query(`
            INSERT INTO artifacts (id, type, name, description, slug, data)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id)
            DO UPDATE SET
                type = EXCLUDED.type,
                data = EXCLUDED.data,
                updated_at = NOW()
            `,
            [a.id, a.type, a.name, a.description, a.slug, a]
        );
    }

}

async function insertEdges(artifacts: Artifact[]) {

    // TODO: use batch insert instead
    for (const artifact of artifacts) {
        // const relations: { from: string; to: string; type: string }[] = [];

        const relationships = artifact.relationships ?? [];


        for (const r of relationships) {

            await pool.query(`
               INSERT INTO edges (from_id, to_id, type, metadata)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT DO NOTHING
                `,
                [
                    artifact.id,
                    r.to,
                    r.type,
                    r.metadata ?? {}
                ]
            );
        }

    }

}

export async function seed() {

    console.log("Loading artifacts...");

    const artifacts = loadArtifacts();

    console.log(`Loaded ${artifacts.length} artifacts`);

    console.log("Inserting nodes...");
    await insertArtifacts(artifacts);

    console.log("Building edges...");
    await insertEdges(artifacts);

    console.log("Seed complete");
}
