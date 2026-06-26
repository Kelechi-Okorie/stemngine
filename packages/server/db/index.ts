import { runMigrations } from "./migrate.js";
import { seed } from './seed.js';

// migrate and seed
async function main() {

    // await runMigrations();
    await seed();

    process.exit(0);
}

main();

// Domain Graphs (semantic meaning)

// Each layer interprets relationships differently:

// Layer	Meaning of edge
// concept → concept	prerequisite
// explore → concept	visualization
// lesson → concept	    teaching sequence
// build → concept	    application constraint
