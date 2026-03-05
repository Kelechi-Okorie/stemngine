import { generateUUID } from "../../../math/MathUtils";
import { Vector3 } from "../../../math/Vector3";
import { Representation } from "../../Interfaces";

export type ParticleOptions = {
    name?: string;
    objectId?: number;
    position?: Vector3;
    velocity?: Vector3;
    acceleration?: Vector3;
    mass?: number;
    damping?: number;
};

let particleId = 0;

/**
 * A particle isi the simplest and smallest object that can be
 * simulated in the physics system
 * 
 * - independent particles (fluids/smoke)
 * - structured particles (cloth/constraints)
 */
export class Particle implements Representation {

    /**
     * The id of the particle
     */
    public id: number = particleId++;

    /**
     * Name of this particle
     */
    public name: string;

    /**
     * Type of this particle
     */
    public type: string = 'Particle';

    /**
     * The UUID of this particle
     */
    public uuid: string = generateUUID();

    /**
     * Id of the object that has this particle
     */
    public objectId?: number

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
    public inverseMass: number;

    public mass: number;

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
     * The index of this particle in the world particles or particle system array
     * this helps to achieve O(1) removal
     */
    public index!: number;

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
            this.mass = Infinity;

        } else if (mass !== undefined) {

            this.mass = mass;
            this.inverseMass = 1 / mass;

        } else {

            this.mass = 1;
            this.inverseMass = 1;
            
        }
    }

    public addForce(force: Vector3): void {

        this.forceAcc.add(force);

    }

}