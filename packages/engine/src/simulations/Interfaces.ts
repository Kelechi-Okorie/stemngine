import { World } from "./World";

// export type SystemKey = 'Particle' | 'Mass-aggregate' | 'Rigid-body' | 'Cloth' | 'Fluid';

export enum SystemType {
    // core mechanical
    ParticleSystem,
    MassAggregateSystem,
    RigidBodySystem,
    SoftBodySystem,

    // field domain
    FluidSystem,
    ThermalFieldSystem,
    EMFieldSystem,

    // interaction domain
    ConstraintSystem,
    ContactSystem,
    ForceFieldSystem
}

export enum SolverType {
    // integrators
    ExplicitEulerIntegrator,
    SymplecticeEulerIntegrator
}

/**
 * All physics are operators. This lets kernel:
 * - build dependency graph
 * - schedule safely
 * - parallelize later
 */
export interface Solver {
    name: string;

    // reads: string[];    // data dependencies
    // writes: string[];   // output

    reads: Set<string>;
    writes: Set<string>;

    stage?: string; // optional stage grouping

    step(dt: number, world: World): void;
}

/**
 * Each scale model implements this
 * 
 * Example
 * - ParticleRepresentation
 * - ContinuumRepresentation
 * - FieldRepresentation
 */
export interface Representation {
    id: number;
    name: string;
    type: string;
    uuid: string;
    objectId?: number;
}

// TODO: should be moved to its own class
/**
 * Contains an id for representations to reference
 * 
 */
export class SimObject {
    id: string;

    constructor(id: string) {

        this.id = id;

    }
}
