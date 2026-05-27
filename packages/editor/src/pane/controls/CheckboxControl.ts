import { Control } from "./Control";
import { IBinding } from "../../Interfaces";

export class CheckboxControl extends Control<boolean> {

    private input: HTMLInputElement;

    constructor(binding: IBinding<boolean>) {

        super(binding);

        const input = document.createElement('input');
        input.classList.add('checkbox');
        input.type = 'checkbox';

        input.addEventListener('change', () => {

            this.setValue(input.checked);

        });
        
        this.input = input;

        this.element.appendChild(this.input);

        // initialize
        this.updateView(this.binding.get());
    }

    protected updateView(value: boolean): void {
        
        this.input.checked = value;

    }
}
