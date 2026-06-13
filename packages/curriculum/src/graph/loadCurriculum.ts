import fs from 'fs';
import path from 'path';
import {ConceptNode, ConceptID} from '../Interfaces';

const DATA_DIR = path.join(process.cwd(), 'src/data');

function readJSON(filePath:string): ConceptNode | ConceptNode[] {

    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);

}

function walk(dir: string): string[] {

    const entries = fs.readdirSync(dir, { withFileTypes: true});

    let files: string[] = [];

    for (const entry of entries) {

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {

            files = files.concat(walk(fullPath));

        } else if (entry.name.endsWith('.json')) {

            files.push(fullPath);

        }

    }

    return files;

}

export function loadCurriculum(): Map<ConceptID, ConceptNode> {

    const graph = new Map<ConceptID, ConceptNode>();

    const files = walk(DATA_DIR);

    for (const file of files) {

        const data = readJSON(file);

        const concepts: ConceptNode[] = Array.isArray(data) ? data : [data];

        for (const concept of concepts) {

            if (graph.has(concept.id)) {

                throw new Error(`Duplicate topic ID detected: ${concept.id}`);

            }

            graph.set(concept.id, concept);

        }

    }


    return graph;

}
