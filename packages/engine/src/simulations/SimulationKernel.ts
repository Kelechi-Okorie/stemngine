import { Solver, SolverScope } from "./Interfaces";
import { World } from "./World";
import { Scheduler } from './Scheduler';
import { SolverManager } from "./core/SolverManager";
import { GlobalEventDispatcher } from "../core/GlobalEventDispatcher";
import { System } from "./core/System";

export class SimulationKernel {
    private world: World;
    private solverManager: SolverManager;

    constructor(world: World) {

        this.world = world;
        this.solverManager = new SolverManager(world);
        this.solverManager.sync(world);

    }

    public step(dt: number) {

        // execution order
        const solvers = this.solverManager.schedule();

        for (let solver of solvers) {

            const targets = this.solverManager.targets.get(solver);
            if (targets === undefined) continue;

            solver.step(dt, targets, this.world);

            // for (const system of targets) {

            //     solver.step(dt, system, this.world);

            // }

        }

    }

}
