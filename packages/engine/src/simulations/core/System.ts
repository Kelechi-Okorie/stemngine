import { SimulationModel, SystemType } from "../Interfaces";
import { World } from "../World";

// TODO: find better ways to handle concrete implementations

/**
 * Base class for all systems
 */
export abstract class System<TSnapshot> {

    public readonly name: string;
    public readonly type: SystemType;

    private world!: World;

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
    public abstract add(entity: SimulationModel): SimulationModel;
    public abstract remove(entity: SimulationModel): void;
    public abstract getByIndex(index: number): SimulationModel | undefined ;
    public abstract getAll(): SimulationModel[];

    public abstract snapshot(): TSnapshot;
    public abstract restore(snapshot: TSnapshot): void;

}
