import { World } from "./World";
import { System } from "./core/System";

export enum SystemType {
    /** core mechanical */
    ParticleSystem,
    // MassAggregateSystem,
    // RigidBodySystem,
    // SoftBodySystem,

    /** field domain */
    // FluidSystem,
    // ThermalFieldSystem,
    // EMFieldSystem,

    /** interaction domain */
    // ConstraintSystem,
    // ContactSystem,
    // ForceFieldSystem
}

// TODO: may be removed.
// do better
// may not know all the solver types ahead of time
export enum SolverType {
    /** integrators */
    ExplicitEulerIntegrator,
    SymplecticeEulerIntegrator,

    /** gravity */  // TODO: find a better way
    Gravity
}

export type SolverScope =
    | { type: "world" }
    | { type: "system", systemType: SystemType }
    | { type: "systems", systemTypes: SystemType[] }
    | { type: "query", filter: (system: System<any, any>) => boolean }
;

type SolverParamType<T> = {
    value: T;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
};

/**
 * All physics are operators. This lets kernel:
 * - build dependency graph
 * - schedule safely
 * - parallelize later
 */
export interface Solver {
    id: string;
    type: string;
    name: string;

    reads: Set<string>;
    writes: Set<string>;

    enabled: boolean;

    scope:  SolverScope;

    params: Record<string, SolverParamType<any>>;    // editable in UI

    stage?: string; // optional stage grouping

    step(dt: number, system: System<any, any>[], world?: World): void;
}

/**
 * Simulation Representation
 * Each scale model implements this
 * 
 * Example
 * - ParticleRepresentation
 * - ContinuumRepresentation
 * - FieldRepresentation
 */
export interface SimulationModel {
    id: number;
    name: string;
    type: string;
    uuid: string;
    index: number;
    objectId?: number;
}
