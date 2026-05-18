import { SystemType } from "./Interfaces";
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

    // TODO: check correct typing for all System<any>
    public systems = new Map<SystemType, System<any, any>>();

    public addSystem(type: SystemType, system: System<any, any>): void {

        if (this.systems.has(type)) return;

        this.systems.set(type, system);
        system.attachWorld(this);

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

    public getSystem<T extends System<any, any>>(key: SystemType): T | undefined {

        return this.systems.get(key) as T | undefined;

    }

    public reset = () => {

        for (const [type, system] of this.systems) {

            system.reset?.();

        }
    }

}
