import { SimulationManager } from "../core/SimulationManager";
import { SimulationDefinition } from "../Interfaces";

export function importDefinition(
    def: SimulationDefinition
): SimulationManager {

    const simulationManger = new SimulationManager();

    // 1. systems
    def.systems.forEach(sys => {
        
        const systemInstance = createSystem(sys.type, sys.config);
        simulationManger.world.addSystem(sys.type as any, systemInstance); // TODO: type better

    });

    // 2. entities
    def.entities.forEach(entity => {

        simulationManger.addEntity(entity.config);


    });

    //  3. solvers
    def.solvers.forEach(solver => {

        const solver  = crateSolver(solver.type, solver.config);

    });

    return simulationManger;
}
