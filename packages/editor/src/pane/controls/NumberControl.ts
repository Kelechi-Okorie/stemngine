import { Control } from "./Control";
import { IBinding } from "../../Interfaces";

export class NumberControl extends Control<number> {

    private input: HTMLInputElement;

    constructor(binding: IBinding<number>) {

        super(binding);

        this.input = document.createElement('input');
        this.input.type = 'number';

        this.input.addEventListener('input', () => {

            const value = this.input.valueAsNumber;

            // important: guard against NaN
            if (!Number.isNaN(value)) {

                this.setValue(value);

            }

        });

        const div = document.createElement('div');
        div.appendChild(this.input);

        this.element.appendChild(div);

        // initialize
        this.updateView(this.binding.get());
    }

    protected updateView(value: number): void {
        
        // avoid overwritting user typing unnecessarily
        if (Number(this.input) !== value) {

            this.input.value = String(value);

        }

    }
}
