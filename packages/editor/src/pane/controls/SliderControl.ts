import { Control } from "./Control";
import { IBinding } from "../../Interfaces";


export class SliderControl extends Control<number> {

    private input: HTMLInputElement;
    private input2: HTMLInputElement;

    constructor(binding: IBinding<number>, config: { min: number, max: number, step: number }) {

        super(binding);

        const { min, max, step } = config;

        // TODO: find a better way to create html elements
        const input = document.createElement('input');
        input.classList.add('input');
        input.type = 'range';
        input.min = String(min);
        input.max = String(max);
        input.step = String(step);
        input.classList.add('flex-2');
        this.input = input;

        const input2 = document.createElement('input');
        input2.classList.add('input');
        input2.type = 'number';
        input2.classList.add('flex-1');
        this.input2 = input2;

        // UI -> parameter
        this.input.addEventListener('input', () => {

            this.setValue(Number(this.input.value));

        });

        this.input2.addEventListener('input', () => {

            const value = this.input2.valueAsNumber;

            // important: guard against NaN
            if (!Number.isNaN(value)) {

                this.setValue(value);

            }

        });

        // attach to root element
        const div = document.createElement('div');
        div.classList.add('row');

        div.appendChild(this.input);
        div.appendChild(this.input2);
        this.element.appendChild(div);

        // initialize UI with current value
        this.updateView(this.binding.get());

    }

    protected updateView(value: number): void {
        
        const v = String(value);

        if (this.input.value !== v) {

            this.input.value = v;

        }

        if (this.input2.value !== v) {

            this.input2.value = v;

        }

    }

}
