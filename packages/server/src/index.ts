import Fastify from 'fastify';
import cors from '@fastify/cors';
import { pool } from './db/client.js';

import { buildRegistry, buildIndices } from '@stemngine/curriculum';
import { queryEngine } from './graph/queryEngineInstance.js';

const app = Fastify({
    logger: true
});

app.register(cors, {
    origin: true
    // origin: "http://localhost:5173"
});

const registry = buildRegistry();
const { concepts, explores, lessons, builds, conceptIndex } = buildIndices(registry);

app.get("/", async () => {

    const result = await pool.query("SELECT NOW()");
    console.log(result.rows);

    return { ok: true, runner: 'fastify', result };

});

app.get("/registry", async () => {

    // const registry = buildRegistry();

    // to reconstruct map on client
    //const registryMap = new Map(Object.entries(data.registry));
    // return { registry: Object.fromEntries(registry) };

    return {
        ok: true,
        data: {
            registry: Object.fromEntries(registry)
        }
    };

});

app.get("/concepts", async () => {

    return {
        ok: true,
        data: {
            concepts
        }
    };

});

app.get('/bundle/:id', async (req, res) => {

    const { id } = req.params as { id: string };

    // const result = registry.get(id);

    // const bundle = buildBundle(id, registry);

    // const concept = concepts.get(id);
    // const bundle = conceptIndex.get(id);

    const concept = await queryEngine.getArtifact(id);
    console.log(concept)

    // console.log('=========', {id, bundle, conceptIndex});

    if (!concept/* bundle */) {

        return res.status(404).send({
            ok: false,
            error: `concept not found ${id}`
        });
    }

    const explores = await queryEngine.getExplores(id);
    const lessons = await queryEngine.getLessons(id);
    const builds = await queryEngine.getBuilds(id);

    const bundle = {
        explores,
        lessons,
        builds
    };

    return {
        ok: true,
        data: {
            concept,
            bundle
        }
    };

});

// GET /concept/:id
// GET /concept/:id/explores
// GET /concept/:id/lessons
// GET /concept/:id/builds

app.get('/health', async () => {
    return { ok: true, runner: 'fastify' };
});

app.listen({ port: 3000 }, () => {
    console.log('server runnin on http://localhost:3000');
});
