import { Control } from "./Control";
import { IBinding } from "../../Interfaces";

export class NumberControl extends Control<number> {

    private input: HTMLInputElement;

    constructor(binding: IBinding<number>) {

        super(binding);

        const input = document.createElement('input');
        input.classList.add('input', 'padded');
        input.type = 'number';

        input.addEventListener('input', () => {

            const value = this.input.valueAsNumber;

            // important: guard against NaN
            if (!Number.isNaN(value)) {

                this.setValue(value);

            }

        });

        this.input = input;
        this.element.appendChild(this.input);

        // initialize
        this.updateView(this.binding.get());
    }

    protected updateView(value: number): void {
        
        // avoid overwritting user typing unnecessarily
        if (this.input.valueAsNumber !== value) {

            this.input.value = String(value);

        }

    }
}
