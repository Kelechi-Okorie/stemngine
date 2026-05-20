import { SimulationRuntime } from "../core/SimulationRuntime";
import { Context, Editor } from "../Interfaces";

export class Player implements Editor {

    public name: string = 'Player';

    private simulationRuntime: SimulationRuntime;

    constructor(context: Context) {

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

        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        // container.style.padding = '8px';
        container.style.background = '#1e1e1e';
        container.style.color = 'white';
        container.style.fontFamily = 'sans-serif';

        const controls = document.createElement('div');
        controls.style.display = 'flex';
        controls.style.gap = '8px';

        const playBtn = this.createButton('▶ Play', () => this.play());
        const pauseBtn = this.createButton('⏸ Pause', () => this.pause());
        const stepBtn = this.createButton('⏭ Step', () => this.simulationRuntime.stepOnce());
        const resetBtn = this.createButton('⟲ Reset', () => this.simulationRuntime.reset());

        controls.appendChild(playBtn);
        controls.appendChild(pauseBtn);
        controls.appendChild(stepBtn);
        controls.appendChild(resetBtn);

        const timeLabel = document.createElement('div');
        // timeLabel.style.marginTop = '10px';
        timeLabel.innerText = 'Time: 0.00s';

        container.appendChild(controls);
        container.appendChild(timeLabel);

        // 🔥 subscribe to runtime updates
        const updateFn = (dt: number) => {

            timeLabel.innerText = `Time: ${this.simulationRuntime.time.toFixed(3) ?? 0}s`;

        };

        this.simulationRuntime.schedule('update', updateFn);

        // store reference if you want to unschedule later
        (this as any)._updateFn = updateFn;

    }

    private createButton(label: string, onClick: () => void): HTMLButtonElement {

        const btn = document.createElement('button');
        btn.innerText = label;
        // btn.style.padding = '6px 10px';
        btn.style.cursor = 'pointer';
        btn.style.border = 'none';
        btn.style.background = '#333';
        btn.style.color = 'white';

        btn.addEventListener('click', onClick);

        return btn;
    }

    public unmount(): void {

    }

    public resize(width: number, height: number) {


    }

    public update(state: any) { // TODO: should not be any


    }
}
