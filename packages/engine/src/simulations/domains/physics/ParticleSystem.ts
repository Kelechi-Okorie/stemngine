import { Particle, ParticleOptions } from "./Particle";
import { GlobalEventDispatcher } from "../../../core/GlobalEventDispatcher";
import { System } from "../../core/System";
import { SystemType } from "../../Interfaces";

/**
 * TODO:
 * later add:
 * - events
 * - particle pooling
 * - looging
 * - etc
 */


/**
 * Factories + memory managers for particles
 */
export class ParticleSystem extends System {

    public readonly name: string = 'ParticleSystem';
    public readonly type: SystemType = SystemType.ParticleSystem;

    // dense array storage (for performance)
    public particles: Particle[] = [];

    constructor() {

        super(SystemType.ParticleSystem, 'ParticleSystem');

    }

    public createParticle(options: ParticleOptions) {

        const particle = new Particle(options);

        particle.index = this.particles.length;

        this.particles.push(particle);

        GlobalEventDispatcher.instance.dispatchEvent({
            type: 'worldSystemAdded',
            target: this,
            systemType: SystemType.ParticleSystem
        })

        return

    }

    // TODO: check if to cache instead and reuse later instead of removing
    // swap and pop removal O(1);
    // avoids O(n) search and O(n) splice
    public removeParticle(particle: Particle) {

        const index = particle.index;
        const last = this.particles.length - 1;

        const lastParticle = this.particles[last];
        this.particles[index] = this.particles[last];
        lastParticle.index = index;

        this.particles.pop();

    }

    /**
     * could be used to remove particles in batches
     */
    // public deferredDeletion() {

    //     for (let i = 0; i < this.particles.length;) {

    //         if (!this.particles[i].alive) {

    //             this.removeParticle(this.particles[i]);
    //         } else {

    //             i++;

    //         }

    //     }

    // }

}

export function isParticleSystem(system: System | undefined): system is ParticleSystem {

    return !!system && 'particles' in system;
    
}
