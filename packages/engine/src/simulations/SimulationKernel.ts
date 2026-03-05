import { Solver } from "./Interfaces";
import { World } from "./World";
import { Scheduler } from './Scheduler';
import { SolverManager } from "./core/SolverManager";
import { GlobalEventDispatcher } from "../core/GlobalEventDispatcher";

export class SimulationKernel {
    private world: World;
    private solverManager = new SolverManager();

    constructor(world: World) {

        this.world = world;

        this.solverManager.sync(world);
    }

    public step(dt: number) {

        const executionOrder = this.solverManager.schedule();

        for (let solver of executionOrder)
            solver.step(dt, this.world);

    }

}