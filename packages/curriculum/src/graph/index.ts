import fs from 'fs';
import path from 'path';



import { Artifact, Registry, Lesson } from "../Interfaces.js";

// type Registry = Map<string, Artifact>;

const DATA_DIR = path.join(process.cwd(), 'src/data');

// import { buildCurriculum } from "./curriculum";

// load everything
// const graph = buildCurriculum();

// get a topic
// graph.get("physics.mechanics.acceleration");

// validate automatically on startup
// perfect for
// - editor
// - engine
// - CI checks

// 🚨 Important design insight (don’t skip this)

// You now have:
// Two graphs in one system:
// 1. Tree (UI structure)
// parent
// children
// 2. DAG (learning logic)
// dependsOn

// This is EXACTLY what serious learning systems use.

// 🔥 What you just built (big picture)

// You now have:
// ✔ a filesystem-based CMS
// ✔ a graph compiler
// ✔ a validation layer
// ✔ a single source of truth for STEM knowledge

// This is already enough to power:
// simulation gating
// adaptive learning paths
// AI tutoring
// curriculum visualization
// Next step (very important)

// If you continue correctly, the next layer is:
// 👉 Graph queries API
// Example:
// “what unlocks projectile motion?”
// “what can student learn next?”
// “shortest learning path to X?”

// That’s where your system becomes intelligent, not just structured.






// step 1 - discover all json files
// step 2 - read + parse safely
// step 3 - normalize to artifact
// step 4 - build the registry

/**
 * 
 */
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

function readJSON(filePath: string): any {

    try {

        const raw = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(raw);

    } catch (err) {

        throw new Error(`Failed to parse JSON: ${filePath}`);

    }

}

function parseArtifact(data: any, filePath: string): Artifact {

    if (!data.type || !data.id) {

        throw new Error(`Invalid artifact in ${filePath}`);

    }

    return data as Artifact;
}

export function buildRegistry(dataDir: string) {

    const registry = new Map<string, Artifact>();

    const files = walk(dataDir);

    for (const file of files) {

        const raw = readJSON(file);
        const artifact = parseArtifact(raw, file);

        if (registry.has(artifact.id)) {

            throw new Error(`Duplicate ID detected: ${artifact.id}`);

        }

        registry.set(artifact.id, artifact);

    }

    return registry;

}

function buildIndices(registry: Registry) {

    const concepts = new Map();
    const lessons = new Map();
    const builds = new Map();

    for (const artifact of registry.values()) {

        switch (artifact.type) {

            case "concept":
                concepts.set(artifact.id, artifact);
                break;

            case "lesson":
                lessons.set(artifact.id, artifact);
                break;

            case "build":
                builds.set(artifact.id, artifact);
                break;

            default:
                throw new Error(`Artifact unknown: ${artifact.id}`);
        }

    }

    return { concepts, lessons, builds, /* scenes */ };

}

/**
 * validate cross-references for the lessons
 * 
 * TODO: validate other things
 * 
 * @param registry 
 */
function validate(registry: Registry) {

    for (const artifact of registry.values()) {

        if (artifact.type === 'lesson') {

            for (const step of (artifact as Lesson).steps) {

                if (!registry.has(step.conceptId)) {

                    throw new Error(
                        `Lesson ${artifact.id} references missing concept ${step.conceptId}`
                    );

                }

            }

        }

    }
}


function main() {
    console.log("🔧 Building curriculum...");

    const registry = buildRegistry(DATA_DIR);
    console.log(registry);

    const indices = buildIndices(registry);
    console.log(indices);

    validate(registry);

    // console.log(`Loaded ${registry.size} artifacts`);

    // const indices = buildIndices(registry);

    // console.log(`Concepts: ${indices.concepts.size}`);
    // console.log(`Lessons: ${indices.lessons.size}`);
    // console.log(`Builds: ${indices.builds.size}`);

    // validate(registry);

    // console.log("✅ Validation passed");

    // return { registry, indices };
}

main();

// /data
//    ↓
// walk() → files[]
//    ↓
// readJSON()
//    ↓
// parseArtifact()
//    ↓
// Registry (Map<ID, Artifact>)
//    ↓
// Indices (concepts, lessons, builds, scenes)
//    ↓
// Validation
//    ↓
// Runtime


// Important upgrades you should add soon
// ✔ 1. Versioning
// version: "1.0.0"
// ✔ 2. Schema validation (zod / ajv)

// Don’t trust JSON blindly.

// ✔ 3. Dev-time diagnostics
// missing dependencies
// orphan concepts
// unused concepts

// TODO:
// If you want the next step, the most valuable upgrade now is:
// hot-reload + incremental rebuild of the registry
// That will turn this from a static system into a real development environment for STEMngine.
