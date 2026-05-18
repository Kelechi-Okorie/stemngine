import { World } from "./World";
import { System } from "./core/System";

/**
 * Runtime ID (fast)
 * 
 * Used for
 * - map lookup
 * performance
 * engine internals
 */
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

/**
 * Persistent ID (stable string)
 */
// convert string -> enum
export const SystemTypeFromId: Record<string, SystemType> = {
    particle_system: SystemType.ParticleSystem
};

// convert enum -> string
export const SystemTypeToId: Record<SystemType, string> = {
    [SystemType.ParticleSystem]: "particle_system"
};

export type SolverScope =
    | { type: "world" }
    | { type: "system", systemType: SystemType }
    | { type: "systems", systemTypes: SystemType[] }
    | { type: "query", filter: (system: System<any, any>) => boolean }
    ;

// Later you can add:
// | Color
// | Quaternion
// | Curve
// | Enum
// | AssetReference
export type FieldSchema =
    | NumberField
    | BooleanField
    | Vector3Field
    | ObjectField
    ;

export interface NumberField {
    type: "number";
    key: string;
    label: string;
}

export interface BooleanField {
    type: "boolean";
    key: string;
    label: string;
}

export  interface Vector3Field {
    type: "vector3";
    key: string;
    label: string;
    fields: {
        x?: NumberField,
        y?: NumberField,
        z?: NumberField
    }
}

export interface ObjectField {
    type: "object",
    key: string;
    label: string;
    fields: FieldSchema[];
}

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

    enabled: boolean;

    reads: Set<string>;
    writes: Set<string>;

    scope: SolverScope;

    stage?: string; // optional stage grouping

    schema?: FieldSchema[];

    export: () => Record<string, any>;
    import: (config: Record<string, any>) => void;

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
    objectId: number | null;    // TODO: should this be here? this only makes sense for particles
    schema?: FieldSchema[];
}

export type Entity = SimulationModel;
