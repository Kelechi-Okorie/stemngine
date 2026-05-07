import { World } from "./World";

// export type SystemKey = 'Particle' | 'Mass-aggregate' | 'Rigid-body' | 'Cloth' | 'Fluid';

export enum SystemType {
    // core mechanical
    ParticleSystem,
    // MassAggregateSystem,
    // RigidBodySystem,
    // SoftBodySystem,

    // // field domain
    // FluidSystem,
    // ThermalFieldSystem,
    // EMFieldSystem,

    // // interaction domain
    // ConstraintSystem,
    // ContactSystem,
    // ForceFieldSystem
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

    reads: Set<string>;
    writes: Set<string>;

    stage?: string; // optional stage grouping

    step(dt: number, world: World): void;
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
