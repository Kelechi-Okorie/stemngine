import { SimulationModel, SystemType } from "../Interfaces";
import { World } from "../World";

// TODO: find better ways to handle concrete implementations

/**
 * Base class for all systems
 */
export abstract class System<E extends SimulationModel, TSnapshot> {

    public readonly name: string;
    public readonly type: SystemType;

    public abstract readonly capabilities: Set<string>;

    private world!: World;

    public abstract entities: E[];

    constructor(type: SystemType, name: string) {

        this.name = name;
        this.type = type;
    }

    public attachWorld(world: World) {

        if (this.world) {

            throw new Error('World already attached');

        }

        this.world = world;

    }

    public abstract init?(): void;
    public abstract dispose?(): void

    // TODO: should not be SimulationModel but a Generic type instead
    public abstract add(entity: E): E;
    public abstract remove(entity: E): void;
    public abstract getByIndex(index: number): E | undefined ;
    public abstract getAll(): E[];

    public abstract snapshot(): TSnapshot;
    public abstract restore(snapshot: TSnapshot): void;

    public abstract export(): Record<string, any>;
    public abstract import(config: Record<string, any>): void;

    public abstract reset(): void;

}
