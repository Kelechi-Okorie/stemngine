import { pool } from "../db/client.js";
import { QueryEngine } from "./QueryEngine.js";

export const queryEngine = new QueryEngine(pool);
