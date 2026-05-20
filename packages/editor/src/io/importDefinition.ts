import { App } from "../core/App";
import { SimulationDefinition } from "../Interfaces";
import { SystemTypeFromId } from "@stemngine/engine";

export function importDefinition(
    app: App,
    def: SimulationDefinition
) {

    const simulationManager = app.simulationManager;

    const systemRegistryInstance = simulationManager.systemRegistryInstance;
    const solverRegistryInstance = simulationManager.SolverRegistryInstance;

    // systems
    def.systems.forEach(systemDef => {

        // const 
        const id = systemDef.id as string;
        const type = SystemTypeFromId[id]
        const system = systemRegistryInstance.create(id);

        system.import(systemDef);

        simulationManager.world.addSystem(type, system);

        const entities = system.getAll();

        for (const entity of entities) {

            simulationManager.entitySystemTypeMap.set(entity.uuid, type);
        }
    })

    // solvers
    def.solvers.forEach((solverDef: Record<string, any>) => {

        const type = solverDef.type;
        const solver = solverRegistryInstance.create(type);

        solver.import(solverDef);

        simulationManager.solverManager.add(solver);

    });

    return def.regionTemplate;

}
