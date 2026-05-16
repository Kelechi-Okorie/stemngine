import fs from 'fs';
import path from 'path';
import {Topic, TopicID} from '../Interfaces';

const DATA_DIR = path.join(process.cwd(), 'src/data');

function readJSON(filePath:string): Topic | Topic[] {

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

export function loadCurriculum(): Map<TopicID, Topic> {

    const graph = new Map<TopicID, Topic>();

    const files = walk(DATA_DIR);

    for (const file of files) {

        const data = readJSON(file);

        const topics: Topic[] = Array.isArray(data) ? data : [data];

        for (const topic of topics) {

            if (graph.has(topic.id)) {

                throw new Error(`Duplicate topic ID detected: ${topic.id}`);

            }

            graph.set(topic.id, topic);

        }

    }


    return graph;
}
