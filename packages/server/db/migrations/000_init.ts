import { Client } from "pg";
import { pool } from "../client.js";

/**
 * This connects to the default postgres DB
 * not the app DB
 * 
 * - checks if the app db exists
 * - if it does not exist, create it
 */
async function ensureDtabaseExists(dbName: string) {

    const client = new Client({
        user: "postgres",
        password: "postgres",
        host: "localhost",
        port: 5432,
        database: "postgres"
    });

    await client.connect();

    // check if DB exists
    const res = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName]
    );

    if (res.rowCount === 0) {

        console.log(`Creating database: ${dbName}`);

        // NOTE: dbName cannot be parameterized safely -> must interpolate
        await client.query(`CREATE DATABASE "${dbName}"`);

    } else {

        console.log(`✅ Database already exists: ${dbName}`);

    }

    await client.end();

}

export async function up() {
    // may have to change id so as id will be autoincrement
    // while another field be the name of the migration files
    await pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
            id TEXT PRIMARY KEY,
            executed_at TIMESTAMP DEFAULT NOW()
        );
    `);
}

export async function runDatabaseSetup() {

    const DB_NAME = "stemngine";

    await ensureDtabaseExists(DB_NAME);
    await up();
    
}

runDatabaseSetup();
