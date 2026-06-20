
import { pool } from "../db/client.js";
import { runMigrations } from "../db/migrate.js";
import { seed } from "../db/seed.js";

// import { QueryEngine } from "../src/graph/QueryEngine.js";

import { queryEngine } from '../src/graph/queryEngineInstance.js';


// console.log(pool);

async function run() {

    // await runMigrations();
    // await seed();

    // process.exit(0);

    // const query = new QueryEngine();

    const concept = await queryEngine.getArtifact('concept:acceleration');

    console.log(concept);



}

run();
