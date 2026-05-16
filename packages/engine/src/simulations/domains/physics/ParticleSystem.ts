import { Particle } from "./Particle";
import { GlobalEventDispatcher } from "../../../core/GlobalEventDispatcher";
import { System } from "../../core/System";
import { SystemType } from "../../Interfaces";
import { Vector3 } from "../../../engine";
import { ParticleExport } from "./Particle";

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
        acceleration: Vector3;
    }[];
};

type Snapshot = ParticleSystemSnapshot;

type ParticleSystemExport = {
    name: string;
    type: SystemType;
    entities: ParticleExport[]
}

/**
 * memory managers for particles
 */
export class ParticleSystem extends System<Particle, Snapshot> {

    public name: string = 'ParticleSystem';
    public readonly type: SystemType = SystemType.ParticleSystem;

    public readonly capabilities = new Set(['mass', 'position', 'velocity', 'integratable:linear']);

    // dense array storage (for performance)
    public entities: Particle[] = [];

    constructor(config?: ParticleSystemExport) {

        super(SystemType.ParticleSystem, 'ParticleSystem');

        if (config) {

            const { name } = config;
            this.name = name;

        }

    }

    public init(): void { }
    public dispose(): void { }

    public add(particle: Particle): Particle {

        particle.index = this.entities.length;

        this.entities.push(particle);

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
        const lastIndex = this.entities.length - 1;

        const lastParticle = this.entities[lastIndex];
        this.entities[index] = lastParticle;
        lastParticle.index = index;

        this.entities.pop();

    }

    public getByIndex(index: number): Particle | undefined {

        throw new Error('get particle by index not implemented');

    }

    public getAll(): Particle[] {

        return this.entities;

    }

    snapshot(): ParticleSystemSnapshot {

        return {
            particles: this.entities.map(p => ({
                id: p.id,
                position: p.position.clone(),
                velocity: p.velocity.clone(),
                acceleration: p.acceleration.clone()
            }))
        };

    }

    restore(snapshot: ParticleSystemSnapshot): void {

        const map = new Map(snapshot.particles.map(p => [p.id, p]));

        for (const p of this.entities) {

            const s = map.get(p.id);
            if (!s) continue;

            p.position.copy(s.position);
            p.velocity.copy(s.velocity);
            p.acceleration.copy(s.acceleration);

        }

    }

    public export(): ParticleSystemExport {

        const entities = this.entities.map(e => e.export());

        return {
            name: this.name,
            type: this.type,
            entities
        }

    }

    /**
     * 
     * `js
     * const system = new ParticleSystem().import(config);
     * `
     * @param config 
     */
    public import(config: Record<string, any>): void {

        throw new Error('not implemented');
        
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
