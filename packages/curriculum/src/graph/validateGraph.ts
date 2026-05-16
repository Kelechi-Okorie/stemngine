import { Topic, TopicID } from "../Interfaces";

type Graph = Map<TopicID, Topic>;

export function validateGraph(graph: Graph) {

    const errors: string[] = [];

    // 1. check parent reference
    for (const topic of graph.values()) {

        if (topic.parent && !graph.has(topic.parent)) {

            errors.push(`Missing parent: ${topic.id} -> ${topic.parent}`);

        }

    }

    // 2. check children references
    for (const topic of graph.values()) {

        for (const child of topic.children || []) {

            if (!graph.has(child)) {

                errors.push(`Missing c hild: ${topic.id} -> ${child}`);

            }

        }
    }

    // 3. check dependency reference
    for (const topic of graph.values()) {

        for (const dep of topic.dependsOn || []) {

            if (!graph.has(dep)) {

                errors.push(`Missing dependency: ${topic.id} -> ${dep}`);

            }

        }

    }

    // 4. detect cycles in dependency graph
    const visiting = new Set<TopicID>();
    const visited = new Set<TopicID>();

    function dfs(id: TopicID, stack: TopicID[]) {

        if (visiting.has(id)) {

            errors.push(`Cycle.detected: ${[...stack, id].join(" -> ")}`);
            return;

        }

        if (visited.has(id)) return;

        visiting.add(id);

        const node = graph.get(id);
        if (node) {

            for (const dep of node.dependsOn || []) {

                dfs(dep, [...stack, id]);

            }

        }

        visiting.delete(id);
        visited.add(id);

    }

    for (const id of graph.keys()) {

        dfs(id, []);

    }

    return errors;
}
