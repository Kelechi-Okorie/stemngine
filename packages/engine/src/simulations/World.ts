import { ParticleSystem } from "./domains/physics/ParticleSystem";
import { SystemType, SimObject } from "./Interfaces";
import { GlobalEventDispatcher } from "../core/GlobalEventDispatcher";
import { BaseEvent } from "../core/EventDispatcher";
import { System } from "./core/System";

// TODO: check if to add feature for removing systems


/**
 * This holds all simulation state
 * - rigid bodies
 * - particles
 * - temperature field
 * - pressure field
 * - etc
 */
export class World {
    // objects: Map<string, SimObject> = new Map();
    // domains: DomainRegistry = new DomainRegistry();

    // public particleSystem: ParticleSystem;  // fast iteration

    public systems: Map<SystemType, System> = new Map();    // TODO: check for better typing

    public addSystem(type: SystemType, system: System): void {

        if (this.systems.has(type)) {

            console.log(`World: System type ${type} and name ${system.name} already exists`);

            return;
        }

        this.systems.set(type, system);

        GlobalEventDispatcher.instance.dispatchEvent({
            type: 'solversystemadd',
            target: system
        });

    }

    public getSystem(key: SystemType): any | undefined {

        return this.systems.get(key);

    }

    // addObject(obj: SimObject) {
    //     this.objects.set(obj.id, obj)

    //     // Automatically register all representations
    //     for (const [key, rep] of obj.representations) {
    //         this.domains.register(key, rep)
    //     }
    // }

    // removeObject(obj: SimObject) {
    //     this.objects.delete(obj.id)

    //     // Unregister representations
    //     for (const [key, rep] of obj.representations) {
    //         this.domains.unregister(key, rep)
    //     }
    // }

}
