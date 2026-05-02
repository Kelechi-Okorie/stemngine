// import { ParticleSystem } from "./domains/physics/ParticleSystem";
import { SystemType, SimObject } from "./Interfaces";
import { GlobalEventDispatcher } from "../core/GlobalEventDispatcher";
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

    public systems: Map<SystemType, System> = new Map();    // TODO: check for better typing

    public addSystem(type: SystemType, system: System): void {

        if (this.systems.has(type)) {

            console.log(`World: System type ${type} and name ${system.name} already exists`);

            return;
        }

        system.attachWorld(this);
        this.systems.set(type, system);

        GlobalEventDispatcher.instance.dispatchEvent({
            type: 'solversystemadd',
            target: system
        });

    }

    public removeSystem(type: SystemType): void {

        const system = this.systems.get(type);

        if (!system) return;

        this.systems.delete(type);

        GlobalEventDispatcher.instance.dispatchEvent({
            // type: 'system:removed',  // TODO: check if this is better
            type: 'solversystemremoved',
            target: system
        });

    }

    // TODO: check this const ps = world.getSystem<ParticleSystem>(SystemType.PARTICLE);
    public getSystem<T extends System>(key: SystemType): T | undefined {

        return this.systems.get(key) as T | undefined;

    }

}
