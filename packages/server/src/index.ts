import Fastify from 'fastify';
import cors from '@fastify/cors';

import { buildRegistry } from '@stemngine/curriculum';

const app = Fastify({
    logger: true
});

app.register(cors, {
    origin: true
    // origin: "http://localhost:5173"
});

app.get("/", async () => {

    return { ok: true, runner: 'fastify' };

});

app.get("/registry", async () => {

    const registry = buildRegistry();

    // to reconstruct map on client
    //const registryMap = new Map(Object.entries(data.registry));
    return { registry: Object.fromEntries(registry) };
});

app.get('/artifact/:id', async (req, res) => {

    const { id } = req.params as { id: string };

    const registry = buildRegistry();

    const result = registry.get(id);

    if (!result) {

        throw new Error(`result not found`);
    }

    // const bundle = buildBundle(id, registry);

    // return bundle;

    console.log(result)
    return { concept: result };
});

app.get('/health', async () => {
    return { ok: true, runner: 'fastify' };
});


app.listen({ port: 3000 }, () => {
    console.log('server runnin on http://localhost:3000');
});
