import { World } from "../World";
import { Vector3 } from "../../math/Vector3";
import { Solver, SystemType } from "../Interfaces";
import { Particle } from "../domains/physics/Particle";
import { isParticleSystem } from "../domains/physics/ParticleSystem";

type IParticle = {
    particles: Particle
}

const _v = /*@__PURE__*/ new Vector3();

/**
 * ExplicitEulerIntegrator
 * 
 * v(t + dt) = v(t) + a(t) * dt
 * x(t + dt) = x(t) + a(t) *dt
 * 
 * Characteristics:
 * - simple and fast
 * - easy to implement
 * - unstable for stiff systems or large time steps
 * - energy tends to increase -> system can blow up over time
 * 
 * Use cases:
 * - educational purposes
 * - very simple particle systems with small timesteps
 * - not recommended for production physics engines
 */
export class ExplicitEulerIntegrator implements Solver {

    public readonly name: string = 'ExplicitEulerIntegrator';

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

                // update linear position
                position.addScaledVector(velocity, fixedDt);

                // work out the acceleration from the force
                // TODO: check if to reset the forceAcc each frame
                // might not need to clear acceleration each frame if it contains
                // persistent forces (gravity, etc.)
                const resultingAcc = _v.copy(acceleration);
                resultingAcc.addScaledVector(forceAcc, inverseMass);

                // update linear velocity from acceleration
                velocity.addScaledVector(resultingAcc, fixedDt);

                // impose drag
                // TODO: check if this should be conditional
                velocity.multiplyScalar(damping ** fixedDt);

                forceAcc.clear();

            }

            this.acc -= this.fixedDt

        }

    }

}
