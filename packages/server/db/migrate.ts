import fs from "fs";
import path from "path";
import { pool } from './client.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function hasRun(id: string) {

    const res = await pool.query(
        "SELECT 1 from migrations WHERE id = $1",
        [id]
    );

    return (res.rowCount ?? 0) > 0;

}

async function markRun(id: string) {

    await pool.query(
        `INSERT INTO migrations (id)
        VALUES ($1)
        ON CONFLICT (id) DO NOTHING`,
        [id]
    );

}

export async function runMigrations() {

    const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith(".sql"))
    .sort();

    for (const file of files) {

        const id = file.replace(".sql", "");

        const alreadyRun = await hasRun(id);

        if (alreadyRun) {

            console.log(`skipping ${id} :: has already run`);
            continue;

        }

        const sql = fs.readFileSync(
            path.join(MIGRATIONS_DIR, file),
            "utf-8"
        );

        console.log(`Running migration: ${id}`);

        await pool.query(sql);

        await markRun(id);

        console.log(`✅ completed ${id}`);
    }

    console.log("✅ Migrations complete");

}
