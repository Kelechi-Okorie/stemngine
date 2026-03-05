import { World } from "./World";
import { SimulationKernel } from "./SimulationKernel";

export class Simulation {

    public world: World;
    public kernel: SimulationKernel;

    constructor(world: World) {

        this.world = world;
        this.kernel = new SimulationKernel(world);

    }

    public step(dt: number) {

        this.kernel.step(dt);

    }
}