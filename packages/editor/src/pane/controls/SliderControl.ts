import { Control } from "./Control";
import { IBinding } from "../../Interfaces";


export class SliderControl extends Control<number> {

    private input: HTMLInputElement;

    constructor(binding: IBinding<number>, config: {min: number, max: number, step: number}) {

        super(binding);

        const { min, max, step} = config;

        // TODO: find a better way to create html elements
        this.input = document.createElement('input');
        this.input.type = 'range';
        this.input.min = String(min);
        this.input.max = String(max);
        this.input.step = String(step);

        // UI -> parameter
        this.input.addEventListener('input', () => {

            this.setValue(Number(this.input.value));

        });

        // attach to root element
        this.element.appendChild(this.input);

        // initialize UI with current value
        this.updateView(this.binding.get());

    }

    protected updateView(value: number): void {

        this.input.value = String(value);

    }

}
