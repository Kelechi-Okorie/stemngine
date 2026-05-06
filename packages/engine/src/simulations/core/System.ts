import { SimulationModel, SystemType } from "../Interfaces";
import { World } from "../World";

/**
 * Base class for all systems
 */
export class System {

    public readonly name: string;
    public readonly type: SystemType;

    protected world!: World;

    constructor(type: SystemType, name: string) {

        this.name = name;
        this.type = type;
    }

    public attachWorld(world: World) {

        this.world = world;
        
    }

    public add(entity: any): SimulationModel {

        throw new Error('Concrete system should implement add');

    }

    public remove(entity: any) {

        throw new Error('Concrete systems should implement remove');
    }

    public get(index: number): SimulationModel | undefined {

        throw new Error('Concrete systems should implement get');
    }

    public getAll(): SimulationModel[] {

        throw new Error('Concrete systems should implement getAll');
    }

}
