import { World, Simulation, ParticleSystem, GlobalEventDispatcher, SystemType, Particle, SolverRegistry, ParticleOptions } from "@stemngine/engine";

import { Entity } from "../Interfaces";
import { SolverManager } from "../../../engine/src/simulations/core/SolverManager";
import { SystemRegistry } from "../../../engine/src/simulations/core/SystemRegistry";

export enum EntityEventType {
    ENTITY_CREATED = 'entity:created',
    ENTITY_REMOVED = 'entity:removed',
    ENTITY_CHANGED = 'entitiy:changed'
};

export type EntityEvent = {
    type: EntityEventType,
    entity: Entity,
    source: string  // TODO: source should be enum
};

export type SimulationSnapshot = {
    systems: Record<string, any>;
    entitySystemTypeMap: Array<[string, SystemType]>;
};

export class SimulationManager {

    // TODO: may need to add id and other things
    public name = 'simulation manager';

    public world: World
    public simulation: Simulation;
    public SolverRegistryInstance = SolverRegistry.getInstance();
    public systemRegistryInstance = SystemRegistry.getInstance();
    public solverManager: SolverManager;

    // <entity.uuid, SystemType>
    public entitySystemTypeMap = new Map<string, SystemType>();

    constructor() {

        this.world = new World();
        this.simulation = new Simulation(this.world);
        this.solverManager = this.simulation.kernel.solverManager;

    }

    public addEntity(config: Record<string, string>) {
        const { type } = config;

        const world = this.world;

        let entity: any;    // TODO: type better

        switch (type) {

            case 'particle': {

                let ps = world.getSystem(SystemType.ParticleSystem);

                if (!ps) {
                    ps = new ParticleSystem();
                    this.world.addSystem(SystemType.ParticleSystem, ps);
                }

                const particle = new Particle(config as unknown as ParticleOptions);    // TODO: type better

                entity = ps.add(particle);

                this.entitySystemTypeMap.set(entity.uuid, SystemType.ParticleSystem);

                break;

            }

            default:
                throw new Error('Unknown entity type ' + type);

        }

        return entity;

    }

    public removeEntity(entity: any) {   // TODO: type better

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

        return this.world.getAllEntities();
    }

    /**
     * Returns the system type this entity belongs to
     * @param entityId 
     * @returns 
     */
    public getEntitySystemType(entityId: string): SystemType | undefined {

        return this.entitySystemTypeMap.get(entityId);

    }

    public snapshot(): SimulationSnapshot {

        // const snapshots: Record<string, any> = {}
        const systems: Record<string, any> = {};

        for (const [type, system] of this.world.systems) {

            systems[type] = system.snapshot();

        }

        const snapshots: SimulationSnapshot = {
            systems,
            entitySystemTypeMap: Array.from(this.entitySystemTypeMap.entries())
        }

        return snapshots;

    }

    public restore(snapshots: SimulationSnapshot) {

        // 1. restore systems
        for (const [type, system] of this.world.systems) {

            const snapshot = snapshots.systems[type];

            if (!snapshot) {

                // system existed but has no snapshot
                continue;

            }

            system.restore(snapshot)
        }

        // 2. restore entity registry mapping
        // this.entitySystemTypeMap = new Map(snapshots.entitySystemTypeMap); // this assumes nothing else holds reference to entitySystemTypeMap

        this.entitySystemTypeMap.clear();

        for (const [k, v] of snapshots.entitySystemTypeMap) {

            this.entitySystemTypeMap.set(k, v);

        }

    }

    // clears states inside systems
    public reset = () => {

        // 1. reset world
        this.world.reset();

        // 2. clear entity registry
        this.entitySystemTypeMap.clear();

        // 3. reset solver state
        this.solverManager.reset();

    }

    // removes systems entirely
    public clear() {

        console.log('clearing');
        
    }

    // full app teardown
    public dispose() {

        console.log('disposing');

    }

    // Better future version:
    // restore() {
    //   this.world.resetSystemsFromSnapshot(snapshot.systems);
    //   this.restoreentitySystemTypeMap(snapshot.entitySystemTypeMap);
    // }

    // That allows:

    // plugin systems
    // dynamic system creation
    // versioned worlds

    public step(dt: number) {

        this.simulation.step(dt);

    }

}
