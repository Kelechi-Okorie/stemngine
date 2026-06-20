
// TODO: may be removed

import { pool } from "./client.js";

export async function query(sql: string, params: any[]) {

    const res = await pool.query(sql, params);

    return res.rows;
    
}
