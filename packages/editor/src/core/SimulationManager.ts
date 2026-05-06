import { World, Simulation, ParticleSystem, GlobalEventDispatcher, SystemType, Particle } from "@stemngine/engine";

import { Entity } from "../Interfaces";
import { makeReactive } from "../pane/bindings/extras";

export enum EntityEventType {
    ENTITY_CREATED = 'entity:created',
    ENTITY_REMOVED = 'entity:removed',
    ENTITY_CHANGED = 'entitiy:changed'
};

export type EntityEvent = {
    type: EntityEventType,
    entity: Entity,
    source: string  // TODO: source should be enum
}

export class SimulationManager {

    // TODO: may need to add id and other things
    public name = 'simulation manager';

    private world: World
    private simulation: Simulation;

    // <entity.uuid, SystemType>
    private entitySystemTypeMap = new Map<string, SystemType>();

    constructor() {

        this.world = new World();
        this.simulation = new Simulation(this.world);

    }

    public addEntity(config: Record<string, string>) {
        const { name, type } = config;

        const world = this.world;

        let entity: any;    // TODO: type better

        switch (type) {

            case 'particle': {

                let ps = world.getSystem(SystemType.ParticleSystem);

                if (!ps) {
                    ps = new ParticleSystem();
                    this.world.addSystem(SystemType.ParticleSystem, ps);
                }

                const particle = new Particle(config);

                entity = ps.add(particle);
                // entity = makeReactive(entity);

                this.entitySystemTypeMap.set(entity.uuid, SystemType.ParticleSystem);

                GlobalEventDispatcher.instance.dispatchEvent({
                    type: EntityEventType.ENTITY_CREATED,
                    entity,
                    source: 'user'
                });

                break;

            }

            default:
                throw new Error('Unknown entity type ' + type);

        }

        return entity;

    }

    public removeEntity(/* entityId: string */ entity: any) {   // TODO: type better

        const systemType = this.entitySystemTypeMap.get(entity.uuid);   // TODO: check

        if (!systemType) return;

        const system = this.world.getSystem(systemType);

        if (!system) return;

        system.remove(entity);

        this.entitySystemTypeMap.delete(entity.uuid);   // TODO: check

        GlobalEventDispatcher.instance.dispatchEvent({
            type: EntityEventType.ENTITY_REMOVED,
            entityId: entity.uuid   // TODO: check
        });

    }

    public getEntity(entityId: string): Entity | undefined {
        
        throw new Error('not implemented');

        // const systemType = this.entitySystemTypeMap.get(entityId);
        // if (!systemType) {

        //     // TODO: find better way
        //     throw new Error('System type does not exist');

        // }

        // const system = this.world.getSystem(systemType);
        // if (!system) {

        //     // TODO: find better way
        //     throw new Error('Entity does not exist in system');

        // }

        // const entity = system.get(entityId);

    }

    public getAllEntities(): Entity[] {

        let entities;

        this.entitySystemTypeMap.forEach((v: SystemType, k: string) => {
            const system = this.world.getSystem(v);
            if (!system) {

                // TODO: find better way to handle failure
                throw new Error('the requested system does not exist');

            }

            entities = system.getAll();
        });

        return entities ?? [];
    }

    /**
     * Returns the system type this entity belongs to
     * @param entityId 
     * @returns 
     */
    getEntitySystemType(entityId: string): SystemType | undefined {

        return this.entitySystemTypeMap.get(entityId);

    }

    public step(dt: number) {

        this.simulation.step(dt);

    }

}
