import { EventDispatcher, BaseEvent } from "../../core/EventDispatcher";
import { GlobalEventDispatcher } from "../../core/GlobalEventDispatcher";
import { Solver } from "../Interfaces";
import { Scheduler } from "../Scheduler";
import { World } from "../World";
import { System } from "./System";

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

    private world: World;

    private _solvers: Solver[] = [];

    // <solver.name, index>
    private solverIndexMap = new Map<string, number>();

    public targets = new Map<Solver, System<any, any>[]>();

    private scheduler = new Scheduler();

    constructor(world: World) {

        this.world = world;

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

    // TODO: marked for deletion
    private static init() { }

    /**
     * Add a solver to the solvers array for a given world system
     * 
     * @param system 
     * @param solverType 
     * @returns 
     */
    public add(solver: Solver): void {

        const index = this.solverIndexMap.get(solver.name);

        if (index !== undefined) {

            console.warn('solver already exists');
            return;

        } else {

            const index = this._solvers.length;

            this._solvers.push(solver);
            this.solverIndexMap.set(solver.name, index);

            const targets = this.resolveTargets(solver);
            this.targets.set(solver, targets);

        }

    }

    public remove(solver: Solver) {

        const index = this.solverIndexMap.get(solver.name);

        if (index === undefined) {

            console.warn('solver does not exist');

        } else {

            const lastIndex = this._solvers.length - 1;

            const last = this._solvers[lastIndex];
            this._solvers[index] = last;

            this.solverIndexMap.set(last.name, index);

            this._solvers.pop();
            this.solverIndexMap.delete(solver.name);
            this.targets.delete(solver);
        }
    }

    public schedule(): Solver[] {

        return this.scheduler.schedule(this._solvers);

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

        for (const solver of this._solvers) {

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

    public getAll(): Solver[] {

        return this._solvers;

    }

}
