import { World } from "../World";
import { Vector3 } from "../../math/Vector3";
import { Solver, SystemType } from "../Interfaces";
import { isParticleSystem } from "../domains/physics/ParticleSystem";

const _v = /*@__PURE__*/ new Vector3();

/**
 * SymplecticeEulerIntegrator
 * 
 * v(t + dt) = v(t) + a(t) * dt
 * x(t + dt) = x(t) + v(t + dt) * dt
 * 
 * Characteristics:
 * - also called Semi-Implicit Euler
 * - more stable than Explicit Euler
 * - conserves energy better for mechanical systems
 * - slightly more accurate for stiff systems
 * 
 * Use cases:
 * - most simple rigid-body and particle physics engines
 * - when you need stability with small overhead
 */
export class SymplecticEulerIntegrator implements Solver {

    public readonly name: string = 'SymplecticEulerIntegrator';

    public readonly reads: Set<string> = new Set([
        'particle.position',
        'particle.velocity',
        'particle.acceleration',
        'particle.inverseMass',
        'particle.force',
        'particle.damping'
    ]);

    public readonly writes: Set<string> = new Set([
        'particle.position',
        'particle.velocity',
        'particle.force'
    ]);


    /** Run integrator in 60 Hz */
    private fixedDt: number = 1 / 60;

    /** The accumulator */
    private acc: number = 0;

    /**
     * Maximum time allowed to accumulate for physics steps (in seconds)
     * prevents the "spiral of death" when frames stall.
     *
     * @defaultValue 0.25 (quarter of a second)
     */
    private maxAccumulatedTime: number = 0.25;

    constructor() { }

    public step(dt: number, world: World) {

        this.acc += dt;

        // clamp accumulator to prevent spiral of death
        this.acc = Math.min(this.acc, this.maxAccumulatedTime);

        const fixedDt = this.fixedDt;

        const particleSystem = world.systems.get(SystemType.ParticleSystem);

        if (!isParticleSystem(particleSystem)) {

            return;

        }
        
        const particles = particleSystem.particles;

        while (this.acc >= fixedDt) {


            for (let particle of particles) {

                const { position, velocity, acceleration, inverseMass, forceAcc, damping } = particle;

                // skip static objects
                if (inverseMass === 0) continue;

                // work out the acceleration from the force
                // TODO: check if to reset the forceAcc each frame
                // might not need to clear acceleration each frame if it contains
                // persistent forces (gravity, etc.)
                const resultingAcc = _v.copy(acceleration);
                resultingAcc.addScaledVector(forceAcc, inverseMass);

                // update linear velocity from acceleration
                velocity.addScaledVector(resultingAcc, fixedDt);

                // update linear position
                position.addScaledVector(velocity, fixedDt);

                // impose drag
                // TODO: check if this should be conditional
                velocity.multiplyScalar(damping ** fixedDt);

                forceAcc.clear();

            }

            this.acc -= this.fixedDt

        }

    }

}
