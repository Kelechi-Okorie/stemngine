
/**
 * Implicit Euler (Backward Euler)
 * 
 * v(t + dt) = v(t) + a(t + dt) * dt
 * x(t + dt) = x(t) + v(t + dt) * dt
 * 
 * acceleration is evaluated at the future step - requires solve equations implicitly
 * often requires linear solvers (matrix inversion, iterative solvers)
 * 
 * Characteristics:
 * - very stable, even with stiff systems (large springs, stiff fluids)
 * - dissipative (loses energy slightly each step)
 * - more complex and expensive to implement
 * 
 * Use cases:
 * - physics engine with stiff systems: cloth, soft bodies, deformable objects
 * - industrial or scientific simulations
 */

export class ImplictEulerIntegrator {

    constructor() {

        throw new Error('ImplicitEulerIntegrator: Not implemented!');

    }

}
