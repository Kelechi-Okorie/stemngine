import { EventDispatcher, BaseEvent } from "../../core/EventDispatcher";
import { GlobalEventDispatcher } from "../../core/GlobalEventDispatcher";
import { SystemType, SolverType, Solver, SolverScope } from "../Interfaces";
import { Scheduler } from "../Scheduler";
import { World } from "../World";
import { System } from "./System";

import { ExplicitEulerIntegrator } from "../integrators/ExplicitEulerIntegrator";
import { SymplecticEulerIntegrator } from "../integrators/SymplecticEulerIntegrator";

import { GravitySolver } from "../solvers/GravitySolver";

type SolverConstructor = new () => Solver;

type SolverRegistry = Map<
    SystemType,
    {
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

    public static registry: SolverRegistry = new Map();

    private world: World;

    public solvers: Solver[] = [];
    private solverIndexMap = new Map<Solver, number>();

    public targets = new Map<Solver, System<any, any>[]>();

    private scheduler = new Scheduler();

    public static SolverByName = [];

    constructor(world: World) {

        this.world = world;

        // Add all the known solvers to the registry
        // TODO: find a better way of doing this
        // SolverManager.init();

        // TODO: find better name for event
        // GlobalEventDispatcher.instance.addEventListener('worldSystemAdded', this.onAddSystem);


        GlobalEventDispatcher.instance.addEventListener(
            'worldSystemAdded',
            this.resolveAllTargets
        );

        GlobalEventDispatcher.instance.addEventListener(
            'worldSystemRemoved',
            this.resolveAllTargets
        );

    }

    private static init() {

        // ParticleSystem
        // SolverManager.registry.set(
        //     SystemType.ParticleSystem,
        //     {
        //         default: SolverType.ExplicitEulerIntegrator,    // TODO: default should be symplectic
        //         solvers: new Map<SolverType, SolverConstructor>([
        //             [SolverType.ExplicitEulerIntegrator, ExplicitEulerIntegrator],
        //             [SolverType.SymplecticeEulerIntegrator, SymplecticEulerIntegrator]
        //         ])
        //     }
        // );

        // TODO: find a better way
        // add gravity solver
        // SolverManager.registry.set(
        //     SystemType.ParticleSystem,
        //     {
        //         default: SolverType.Gravity,
        //         solvers: new Map<SolverType, SolverConstructor>([
        //             [SolverType.Gravity, GravitySolver]
        //         ])
        //     }
        // )

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

            // TODO: should there be a return here
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
    public add(solver: Solver): void {

        const index = this.solverIndexMap.get(solver);

        if (index === undefined) {

            console.warn('solver already exists');
            return;

        } else {

            const index = this.solvers.length;

            this.solvers.push(solver);
            this.solverIndexMap.set(solver, index);

            const targets = this.resolveTargets(solver);
            this.targets.set(solver, targets);

        }


        // TODO: make solverType optional and use default solver for system type

        // const systemEntry = SolverManager.registry.get(system.type);

        // if (!systemEntry) {

        //     console.warn(`SolverManager: No solvers registered for system type ${system.type}`);
        //     return;

        // }

        // const SolverCtor = systemEntry.solvers.get(solverType);

        // if (!SolverCtor) {

        //     console.warn(`SolverManager: No solver of type ${solverType} for system type ${system.type}`);
        //     return;

        // }

        // const solver = new SolverCtor();
        // this.solvers.push(solver);

    }

    public remove(solver: Solver) {

        const index = this.solverIndexMap.get(solver);

        if (index === undefined) {

            console.warn('solver does not exist');

        } else {

            const lastIndex = this.solvers.length - 1;

            const last = this.solvers[lastIndex];
            this.solvers[index] = last;

            this.solverIndexMap.set(last, index);

            this.solvers.pop();
            this.solverIndexMap.delete(solver);
            this.targets.delete(solver);
        }
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


        // for (let system of world.systems.values()) {

        //     const systemEntry = SolverManager.registry.get(system.type);
        //     if (!systemEntry) {

        //         console.warn(`SolverManager: No solvers registered for system type ${system.type} and name ${system.name}`);
        //         continue;
        //     }

        //     const defaultSolverType = systemEntry.default;
        //     this.addSolver(system, defaultSolverType);

        // }

    }

    public onAddSystem = <E extends BaseEvent>(event: E) => {

        // const { systemType, target } = event;

        // const systemEntry = SolverManager.registry.get(systemType);
        // if (!systemEntry) {

        //     console.warn(`SolverManager: No solvers found for the system with name ${target.name}`);
        //     return;

        // }

        // this.addSolver(target, systemEntry.default);

    }

    // TODO: may need to remove or better cache solver for the removed system
    public onRemoveSystem(target: any, event: EventDispatcher) {

        // console.log('from solver manager: solver system add', { target, EventDispatcher });

    }

    private resolveAllTargets = () => {

        for (const solver of this.solvers) {

            const targets = this.resolveTargets(solver);
            this.targets.set(solver, targets);
        }
    }

    private resolveTargets(solver: Solver): System<any, any>[] {

        const scope = solver.scope;

        // TODO: may have to seperate conditiions
        if (!scope || scope.type === 'world') {

            return Array.from(this.world.systems.values());

        } else if (scope.type === 'system') {

            const sys = this.world.getSystem(scope.systemType);
            return sys ? [sys] : [];

        } else if (scope.type === 'systems') {

            const systems: System<any, any>[] = [];

            for (const type of scope.systemTypes) {

                const system = this.world.getSystem(type);

                if (system) systems.push(system);
            }

            return systems;

        } else if (scope.type === 'query') {

            const result: System<any, any>[] = [];

            for (const system of this.world.systems.values()) {

                if (scope.filter(system)) {

                    result.push(system);

                }
            }

            return result;

        }

        console.warn('no systems found for this solver');

        return [];
    }

}
