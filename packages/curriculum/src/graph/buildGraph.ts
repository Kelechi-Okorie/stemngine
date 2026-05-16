import { loadCurriculum } from "./loadCurriculum";
import { validateGraph } from "./validateGraph";

export function buildCurriculum() {

    const graph = loadCurriculum();

    const errors = validateGraph(graph);

    if (errors.length > 0) {

        console.error("Curriculum validation failed:");
        errors.forEach(e => console.error(" - " + e));
        throw new Error("Invalid curriculum graph");

    }

    return graph;
}