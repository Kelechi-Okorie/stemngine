import { Control } from "./Control";
import { IBinding } from "../../Interfaces";

export class CheckboxControl extends Control<boolean> {

    private input: HTMLInputElement;

    constructor(binding: IBinding<boolean>) {

        super(binding);

        this.input = document.createElement('input');
        this.input.type = 'checkbox';

        this.input.addEventListener('change', () => {

            this.setValue(this.input.checked);

        });

        this.element.appendChild(this.input);

        // initialize
        this.updateView(this.binding.get());
    }

    protected updateView(value: boolean): void {
        
        this.input.checked = value;

    }
}
