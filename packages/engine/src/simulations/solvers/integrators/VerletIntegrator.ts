
/**
 * Verlet / Velocity Verlet
 * 
 * basic Verlet:
 * x(t + dt) = 2 * x(t) - x(t - dt) + a(t) * dt^2
 * 
 * velocity Verlet
 * x(t + dt) = x(t) + v(t) * dt + 0.5 * a(t) * dt^2
 * v(t + dt) = v(t) + 0.5 * (a(t) + a(t + dt)) * dt
 * 
 * Characteristics:
 * - very stable, often used in molecular dynamics
 * - naturally time-reversible and conserves energy well
 * - does not explicitly use velocity (classic Verlet), but velocity can be reconstructed
 * - slightly more complex than Euler
 * 
 * Use cases:
 * - particle systems where energy conservation is important
 * (springs, cloth, fluids at small scale)
 */
export class VerletIntegrator {

    constructor() {

        throw new Error('VerletIntegrator: Not implemented!');

    }

}
