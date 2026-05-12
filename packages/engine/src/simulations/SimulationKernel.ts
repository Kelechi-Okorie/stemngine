import { World } from "./World";
import { SolverManager } from "./core/SolverManager";
import { GlobalEventDispatcher } from "../core/GlobalEventDispatcher";

export class SimulationKernel {
    private world: World;
    public solverManager: SolverManager;

    constructor(world: World) {

        this.world = world;
        this.solverManager = new SolverManager(world);
        // this.solverManager.sync(world);

    }

    public step(dt: number) {

        // execution order
        const solvers = this.solverManager.schedule();

        for (let solver of solvers) {

            // get already resolved targets. TODO: confirm
            const targets = this.solverManager.targets.get(solver);
            if (targets === undefined) continue;

            solver.step(dt, targets, this.world);

        }

    }

}
