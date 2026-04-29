import { SystemType } from "../Interfaces";
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

}