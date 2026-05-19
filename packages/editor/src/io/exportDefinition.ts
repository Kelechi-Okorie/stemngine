import { App } from "../core/App";
import { regionToTemplate } from "../editors/templates/registry";
import { SimulationDefinition } from "../Interfaces";

export function exportDefinition(
    app: App
): SimulationDefinition {

    const simulationManager = app.simulationManager;

    const name = "sim.generated";

    const systems: any[] = [];  // TODO: type better

    simulationManager.world.systems.forEach((system, type) => {
        systems.push(system.export());
    });

    const solvers = simulationManager.solverManager.getAll().map((solver) =>  solver.export());

    return {
        id: name,
        meta: {
            name,
            version: "1.0.0"
        },
        systems,
        solvers,
        regionTemplate: regionToTemplate(app.region)
    };

}
