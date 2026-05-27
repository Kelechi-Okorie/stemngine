import { Node } from "./Node";
import { Control } from "../controls/Control";

export class ControlNode<T> extends Node {

    constructor(control: Control<T>, label?: string) {

        super();

        this.element.classList.add('row');

        if (label) {

            const labelEl = document.createElement('span');
            labelEl.textContent = label;
            this.element.appendChild(labelEl);

            labelEl.classList.add('flex-1');
            control.element.classList.add('flex-2');

        } else {

            control.element.classList.add('flex-1');
        }

        this.element.appendChild(control.element);

    }

}
