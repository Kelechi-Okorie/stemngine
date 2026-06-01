import { Control } from "./Control";
import { IBinding } from "../../Interfaces";

export class NumberControl extends Control<number> {

    private input: HTMLInputElement;

    constructor(binding: IBinding<number>) {

        super(binding);

        const input = document.createElement('input');
        input.classList.add('input', 'padded');
        input.type = 'number';

        let isDragging = false;
        let startY = 0;
        let startValue = 0;
        let hasMoved = false;
        const sensitivity = 0.1;

        input.addEventListener('input', () => {

            const value = this.input.valueAsNumber;

            // important: guard against NaN
            if (!Number.isNaN(value)) {

                this.setValue(value);

            }

        });

        input.addEventListener('pointerdown', (e) => {

            isDragging = true;
            hasMoved = false;
            startY = e.clientY;
            startValue = this.binding.get();

            input.setPointerCapture(e.pointerId);

            // prevent text selection
            // e.preventDefault();

        });

        input.addEventListener('pointermove', (e: PointerEvent) => {

            if (!isDragging) return;

            const dy = startY - e.clientY;  // upward = increase

            // threshold prevents accidental drag vs click
            if (Math.abs(dy) < 3) return;

            hasMoved = true;
            e.preventDefault();

            const next = startValue + dy * sensitivity;

            // clamp / step (optional but powerful)
            // const step = 0.1;
            // const next = startValue + Math.round(dy * sensitivity / step) * step;

            this.setValue(next);
        });

        input.addEventListener('pointerup', (e: PointerEvent) => {

            isDragging = false;

            input.releasePointerCapture(e.pointerId);

            // if no movement -> allow click -> focus -> typing
        });

        input.addEventListener('focus', () => { isDragging = false; });

        input.style.userSelect = "none";
        input.style.touchAction = "none";

        this.input = input;

        const wrapper = document.createElement('div');
        wrapper.classList.add('input-wrapper', 'row');
        wrapper.appendChild(input);

        // this.element.appendChild(this.input);
        this.element.appendChild(wrapper);

        // initialize
        this.updateView(this.binding.get());
    }

    protected updateView(value: number): void {

        console.log(value, 'updating');


        // avoid overwritting user typing unnecessarily
        if (this.input.valueAsNumber !== value) {

            this.input.value = String(value);

        }

    }

    dispose() {

    }
}
