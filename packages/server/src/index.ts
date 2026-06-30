import Fastify from 'fastify';
import cors from '@fastify/cors';
import { pool } from './db/client.js';

import { queryEngine } from './graph/queryEngineInstance.js';

const app = Fastify({
    logger: true
});

app.register(cors, {
    origin: true
    // origin: "http://localhost:5173"
});

app.get("/", async () => {

    const result = await pool.query("SELECT NOW()");
    console.log(result.rows);

    return { ok: true, runner: 'fastify', result };

});

app.get("/registry", async () => {

    return {
        ok: true,
        data: {
            registry: {}
        }
    };

});

app.get("/concepts", async () => {

    return {
        ok: true,
        data: { }
    };

});

app.get('/artifact/:d', async (req, res) => {

    const { id } = req.params as { id: string};

    const artifact = await queryEngine.getArtifact(id);

    if (!artifact) {

        return res.status(404).send({
            ok: false,
            error: `Artifact ${id} was not found`
        });
    }

    return {
        ok: true,
        artifact
    }

});

// runtime package endpoint
app.get('/bundle/:id', async (req, res) => {

    const { id } = req.params as { id: string };

    const artifact = await queryEngine.getArtifact(id);

    if (!artifact/* bundle */) {

        return res.status(404).send({
            ok: false,
            error: `artifact not found ${id}`
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
