import { App } from "../core/App";
import { SimulationRuntime } from "../core/SimulationRuntime";
import { Context, Editor } from "../Interfaces";

export class Player implements Editor {

    public name: string;

    private simulationRuntime: SimulationRuntime;

    constructor(name: string, context: Context) {

        this.name = name;
        
        this.simulationRuntime = context.simulationRuntime;
    }

    public play() {

        this.simulationRuntime.play();

    }

    public pause() {

        this.simulationRuntime.pause();

    }

    public toggle() {

        if (this.simulationRuntime.isPlaying) {

            this.pause();

        } else {
            
            this.simulationRuntime.play();
            
        }
    }

    public mount(container: HTMLElement) {


    }

    public unmount(): void {
        
    }

    public resize(width: number, height: number) {


    }

    public update(state: any) { // TODO: should not be any


    }
}
