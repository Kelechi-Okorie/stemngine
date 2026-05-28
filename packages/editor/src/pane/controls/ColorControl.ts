import { Color } from "@stemngine/engine";
import { IBinding } from "../../Interfaces";
import { Control } from "./Control";


export class ColorControl extends Control<Color> {

    private input: HTMLInputElement;
    private swatch: HTMLDivElement;

    constructor(binding: IBinding<Color>) {

        super(binding);

        // hidden native input (keeps OS color picker)
        this.input = document.createElement('input');
        this.input.type = 'color';
        this.input.classList.add('color-input');

        // visible swatch
        this.swatch = document.createElement('div');
        this.swatch.classList.add('color-swatch');

        // open picker when clicking swatch
        this.swatch.addEventListener('click', () => {

            this.input.click();

        });

        // sync changes
        this.input.addEventListener('input', () => {

            // UI -> Engine
            const color = this.binding.get().clone();

            color.setStyle(this.input.value);

            this.setValue(color);

        });

        this.element.appendChild(this.swatch);
        this.element.appendChild(this.input);

        this.updateView(this.binding.get());

    }

    protected updateView(color: Color) {

        // Engine -> UI

        const hex = `#${color.getHexString()}`;

        this.input.value = hex;
        this.swatch.style.background = hex;

    }

    private updateSwatch(color: Color) {

        this.swatch.style.background = `#${color.getHexString()}`;

    }

}
