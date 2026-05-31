import { Control } from "./Control";
import { IBinding } from "../../Interfaces";

export class TextControl extends Control<string> {

    private input: HTMLInputElement;

    constructor(binding: IBinding<string>) {

        super(binding);

        const input = document.createElement('input');
        input.classList.add('input', 'padded');
        input.type = 'text';

        input.addEventListener('input', () => {

            const value = this.input.value;

            this.setValue(value);

        });

        this.input = input;
        this.element.appendChild(this.input);

        // initialize
        this.updateView(this.binding.get());
    }

    protected updateView(value: string): void {
        
        // avoid overwritting user typing unnecessarily
        if (this.input.value !== value) {

            this.input.value = value;

        }

    }
}
