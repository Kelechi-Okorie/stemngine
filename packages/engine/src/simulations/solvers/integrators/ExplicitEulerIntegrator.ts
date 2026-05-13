import { World } from "../../World";
import { Vector3 } from "../../../math/Vector3";
import { Solver, SolverScope } from "../../Interfaces";
import { System } from "../../core/System";

const _v = /*@__PURE__*/ new Vector3();

let _id = 0;

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

    public readonly id = `explicit-euler-integrator-${_id++}`;
    public readonly type = "integrator";
    public readonly name: string = 'ExplicitEulerIntegrator';

    // TODO: why set, may be too slow
    public readonly reads: Set<string> = new Set([
        'position',
        'velocity',
        'acceleration',
        'inverseMass',
        'force',
        'damping'
    ]);

    // TODO: why set, may be too slow
    public readonly writes: Set<string> = new Set([
        'position',
        'velocity',
        'force'
    ]);

    public enabled = true;

    public scope: SolverScope = {
        type: 'query',
        filter: (system: System<any, any>) => system.capabilities.has('integratable:linear')
    };

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

    // public schema = [
    //     number("fixedDt", { default: 1 / 60 }),
    //     number("maxAccumulatedTime", { default: 0.25 })
    // ];

    constructor() { }

    public step(dt: number, systems: System<any, any>[], world: World) {

        this.acc += dt;

        // clamp accumulator to prevent spiral of death
        this.acc = Math.min(this.acc, this.maxAccumulatedTime);

        const fixedDt = this.fixedDt;

        while (this.acc >= fixedDt) {

            for (const system of systems) {

                const entities = system.entities;

                for (const entity of entities) {

                    const { position, velocity, acceleration, inverseMass, forceAcc, damping } = entity;

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
            }

            this.acc -= this.fixedDt

        }

    }

}
