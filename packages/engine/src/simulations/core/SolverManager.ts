import { EventDispatcher, BaseEvent } from "../../core/EventDispatcher";
import { GlobalEventDispatcher } from "../../core/GlobalEventDispatcher";
import { SystemType, SolverType, Solver } from "../Interfaces";
import { Scheduler } from "../Scheduler";
import { World } from "../World";
import { System } from "./System";

import { ExplicitEulerIntegrator } from "../integrators/ExplicitEulerIntegrator";
import { SymplecticEulerIntegrator } from "../integrators/SymplecticEulerIntegrator";

type SolverConstructor = new () => Solver;

type SolverRegistry = Map<SystemType, {
    default: SolverType,
    solvers: Map<SolverType, SolverConstructor>
}>;

/**
 * TODO: may need to remove or cache solver when a solver system is removed
 * TODO: add parallelism to scheduler by scheduling all independent solvers in same layer
 */

/**
 * Manages solvers:
 * - registers and unregisters solvers
 * - schedules solvers
 */
export class SolverManager {

    // private static registry: Map<SystemType, Map<SolverType, SolverConstructor>> = new Map();
    public static registry: SolverRegistry = new Map()

    public solvers: Solver[] = [];
    private scheduler = new Scheduler();

    public static SolverByName = []

    constructor() {

        // Add all the known solvers to the registry
        // TODO: find a better way of doing this
        SolverManager.init();

        GlobalEventDispatcher.instance.addEventListener('worldSystemAdded', this.onAddSystem);

    }

    private static init() {

        // ParticleSystem
        SolverManager.registry.set(SystemType.ParticleSystem, {
            default: SolverType.ExplicitEulerIntegrator,    // TODO: default should be symplectic
            solvers: new Map<SolverType, SolverConstructor>([
                [SolverType.ExplicitEulerIntegrator, ExplicitEulerIntegrator],
                [SolverType.SymplecticeEulerIntegrator, SymplecticEulerIntegrator]
            ])
        });

    }

    /**
     * Add a given solver to the registry for a given system
     * 
     * @param systemType 
     * @param solverType 
     * @param solverContructor 
     */
    public static registerSolver(
        systemType: SystemType,
        solverType: SolverType,
        solverContructor: SolverConstructor
    ) {

        let systemEntry = SolverManager.registry.get(systemType);

        if (!systemEntry) {

            systemEntry = {
                default: solverType,
                solvers: new Map<SolverType, SolverConstructor>()
            };

            SolverManager.registry.set(systemType, systemEntry);
        }

        systemEntry.solvers.set(solverType, solverContructor);

    }

    /**
     * Add a solver to the solvers array for a given world system
     * 
     * @param system 
     * @param solverType 
     * @returns 
     */
    public addSolver(system: System, solverType: SolverType): void {
        // TODO: make solverType optional and use default solver for system type

        const systemEntry = SolverManager.registry.get(system.type);

        if (!systemEntry) {

            console.warn(`SolverManager: No solvers registered for system type ${system.type}`);
            return;

        }

        const SolverCtor = systemEntry.solvers.get(solverType);

        if (!SolverCtor) {

            console.warn(`SolverManager: No solver of type ${solverType} for system type ${system.type}`);
            return;

        }

        const solver = new SolverCtor();
        this.solvers.push(solver);

    }

    public schedule(): Solver[] {

        return this.scheduler.schedule(this.solvers);

    }

    /**
     * Syncs initial state by registering the solvers for
     *  systems already in the world
     * 
     * @param world - the world
     */
    public sync(world: World): void {


        for ( let system of world.systems.values()) {

            const systemEntry = SolverManager.registry.get(system.type);
            if (!systemEntry) {

                console.warn(`SolverManager: No solvers registered for system type ${system.type} and name ${system.name}`);
                continue;
            }

            const defaultSolverType = systemEntry.default;
            this.addSolver(system, defaultSolverType);

        }

    }

    public onAddSystem = <E extends BaseEvent>(event: E) => {
        
        const { systemType, target } = event;

        const systemEntry = SolverManager.registry.get(systemType);
        if (!systemEntry) {

            console.warn(`SolverManager: No solvers found for the system with name ${target.name}`);
            return;

        }

        this.addSolver(target, systemEntry.default);

    }

    // TODO: may need to remove or better cache solver for the removed system
    public onRemoveSystem(target: any, event: EventDispatcher) {

        // console.log('from solver manager: solver system add', { target, EventDispatcher });

    }

}
