import { IBinding } from "../../Interfaces";
import { Control } from "./Control";


export class ColorControl extends Control<string> {

    private input: HTMLInputElement;

    constructor(binding: IBinding<string>) {

        super(binding);

        this.input = document.createElement('input');
        this.input.type = 'color';

        this.input.addEventListener('input', () => {

            this.setValue(this.input.value);

        });

        this.element.appendChild(this.input);

        this.updateView(this.binding.get());

    }

    protected updateView(value: string) {

        this.input.value = value;

    }

}