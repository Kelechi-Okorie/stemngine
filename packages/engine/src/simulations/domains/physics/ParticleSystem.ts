import { Particle } from "./Particle";
import { GlobalEventDispatcher } from "../../../core/GlobalEventDispatcher";
import { System } from "../../core/System";
import { SimulationModel, SystemType } from "../../Interfaces";
import { Vector3 } from "../../../engine";

/**
 * TODO:
 * later add:
 * - events
 * - particle pooling
 * - looging
 * - etc
 */

type ParticleSystemSnapshot = {
    particles: {
        id: number;
        position: Vector3;
        velocity: Vector3;
    }[];
};

/**
 * memory managers for particles
 */
export class ParticleSystem extends System<ParticleSystemSnapshot> {

    public readonly name: string = 'ParticleSystem';
    public readonly type: SystemType = SystemType.ParticleSystem;

    // dense array storage (for performance)
    public particles: Particle[] = [];

    constructor() {

        super(SystemType.ParticleSystem, 'ParticleSystem');

    }

    public init(): void {}
    public dispose(): void {}

    public add(particle: Particle): Particle {

        particle.index = this.particles.length;

        this.particles.push(particle);

        GlobalEventDispatcher.instance.dispatchEvent({
            type: 'worldSystemAdded',
            target: this,
            systemType: SystemType.ParticleSystem
        })

        return particle

    }

    // TODO: check if to cache instead and reuse later instead of removing
    // swap and pop removal O(1);
    // avoids O(n) search and O(n) splice
    public remove(particle: Particle) {

        const index = particle.index;
        const lastIndex = this.particles.length - 1;

        const lastParticle = this.particles[lastIndex];
        this.particles[index] = lastParticle;
        lastParticle.index = index;

        this.particles.pop();

    }

    public getByIndex(index: number): SimulationModel | undefined {

        throw new Error('get particle by index not implemented');

    }

    public getAll(): SimulationModel[] {

        return this.particles;

    }

    snapshot(): ParticleSystemSnapshot {

        return {
            particles: this.particles.map(p => ({
                id: p.id,
                position: p.position.clone(),
                velocity: p.velocity.clone(),
            }))
        };
        
    }

    restore(snapshot: ParticleSystemSnapshot): void {

        const map = new Map(snapshot.particles.map(p => [p.id, p]));

        for (const p of this.particles) {

            const s = map.get(p.id);
            if (!s) continue;

            p.position.copy(s.position);
            p.velocity.copy(s.velocity);

        }

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
