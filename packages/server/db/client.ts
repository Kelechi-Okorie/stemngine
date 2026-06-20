
import pkg from "pg";

const { Pool } = pkg;

export const pool = new Pool({
    host: 'localhost',
    database: 'stemngine',
    user: 'postgres',
    password: 'postgres',
    port: 5432
});
