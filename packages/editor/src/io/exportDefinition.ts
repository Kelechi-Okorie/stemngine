import { SimulationManager } from "../core/SimulationManager";
import { SimulationDefinition } from "../Interfaces";

export function exportDefinition(
    simulationManager: SimulationManager
): SimulationDefinition {

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
        solvers
    };

}
