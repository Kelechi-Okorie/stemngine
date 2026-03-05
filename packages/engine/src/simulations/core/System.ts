import { SystemType } from "../Interfaces";

/**
 * Base class for all systems
 */
export class System {

    public readonly name: string;
    public readonly type: SystemType;

    constructor(type: SystemType, name: string) {

        this.name = name;
        this.type = type;
    }

}