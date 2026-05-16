import { generateUUID } from "../../../math/MathUtils";
import { Vector3 } from "../../../math/Vector3";
import { FieldSchema, SimulationModel } from "../../Interfaces";

export type ParticleOptions = {
    name?: string;
    objectId: number | null;
    position?: Vector3;
    velocity?: Vector3;
    acceleration?: Vector3;
    mass?: number;
    damping?: number;
};

export type ParticleExport = {
    name: string;
    objectId: number | null;   // TODO: should not be number
    position: number[];
    velocity: number[];
    acceleration: number[];
    mass: number;
    damping: number;
}

let particleId = 0;

/**
 * A particle isi the simplest and smallest object that can be
 * simulated in the physics system
 * 
 * - independent particles (fluids/smoke)
 * - structured particles (cloth/constraints)
 */
export class Particle implements SimulationModel {

    /**
     * The id of the particle
     */
    public readonly id: number = particleId++;

    /**
     * Name of this particle
     */
    public name: string;

    /**
     * Type of this entity
     */
    public type: string = 'particle';

    /**
     * The UUID of this particle
     */
    public uuid: string = generateUUID();

    /**
     * Id of the object that has this particle
     */
    public objectId: number | null = null    // TODO: should not be number

    /**
     * Holds the linear position of the particle
     * in world space
     */
    public position: Vector3;

    /**
     * Holds the linear velocity of the particle in
     * world space
     */
    public velocity: Vector3;

    /**
     * Holds the acceleration of the particle.
     * This value can be used to set acceleration due to gravity
     * or any other constant acceleration
     */
    public acceleration: Vector3;

    /**
     * Holds the inverse of the mass of the particle.
     * It is more usefult to hold the inverse mass because
     * integration is simpler and because in real-time simulation
     * it is more usefule to have objects with infinite mass (immovable)
     * than zero mass (completely unstable numerical simulation)
    */
    public inverseMass: number; // TODO: confirm that inverse mass is updated when mass changes

    private _mass: number;

    /**
     * The force accumulated on the object in the current frame
     */
    public forceAcc: Vector3 = new Vector3();

    /**
     * Holds the amount of damping applied to linear motion.
     * Damping is required to remove energy added through
     * numerical instability in the integrator
     * values [0, 1]
     */
    public damping: number;

    /**
     * The index of this particle in the particle system array
     * this helps to achieve O(1) removal
     */
    public index!: number;

    public schema: FieldSchema[] = [
        {
            type: "vector3",
            key: "position",
            label: "Position",
            fields: {
                x: {
                    type: "number",
                    key: "position.x",
                    label: "value"
                },
                y: {
                    type: "number",
                    key: "position.y",
                    label: "value"
                },
                z: {
                    type: "number",
                    key: "position.z",
                    label: "value"
                }
            }

        },
        {
            type: "vector3",
            key: "velocity",
            label: "Velocity",
            fields: {
                x: {
                    type: "number",
                    key: "velocity.x",
                    label: "value"
                },
                y: {
                    type: "number",
                    key: "velocity.y",
                    label: "value"
                },
                z: {
                    type: "number",
                    key: "velocity.z",
                    label: "value"
                }
            }

        },
        {
            type: "number",
            key: "mass",
            label: "Mass"
        },
        {
            type: "number",
            key: "damping",
            label: "Damping"
        }
    ]

    constructor(options: ParticleOptions) {

        const { name, objectId, position, velocity, acceleration, mass, damping } = options;

        this.name = name || `Particle_${this.id}`;
        this.objectId = objectId;
        this.position = position || new Vector3();
        this.velocity = velocity || new Vector3();
        this.acceleration = acceleration || new Vector3();
        this.damping = damping || 1;

        // preserves the infinite mass concept properly
        if (mass === 0) {

            this.inverseMass = 0;   // infinite mass (immovable)
            this._mass = Infinity;

        } else if (mass !== undefined) {

            this._mass = mass;
            this.inverseMass = 1 / mass;

        } else {

            this._mass = 1;
            this.inverseMass = 1;

        }
    }

    public addForce(force: Vector3): void {

        this.forceAcc.add(force);

    }

    public get mass(): number {
        return this._mass;
    }

    public set mass(value: number) {

        if (value === 0) {
            // infinite mass (immovable)
            this._mass = Infinity;
            this.inverseMass = 0;

        } else {
            this._mass = value;
            this.inverseMass = 1 / value;
        }
    }

    public export(): ParticleExport {

        return {
            name: this.name,
            objectId: this.objectId,

            mass: this._mass,

            position: this.position.toArray(),
            velocity: this.velocity.toArray(),
            acceleration: this.acceleration.toArray(),

            damping: this.damping
        }

    }

    /**
     * 
     * `js
     * const p = new Particle().import(config);
     * `
     * @param config 
     */
    public import(config: ParticleExport): void {

        const {name, objectId, mass, position, velocity, acceleration, damping} = config;

        this.name = name;
        this.objectId = objectId;
        this.mass = mass;
        this.position = new Vector3().fromArray(position);
        this.velocity = new Vector3().fromArray(velocity);
        this.acceleration = new Vector3().fromArray(acceleration);
        this.damping = damping;
    }

}
