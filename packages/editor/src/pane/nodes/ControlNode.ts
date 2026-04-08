import { Node } from "./Node";
import { Control } from "../controls/Control";

export class ControlNode<T> extends Node {

    constructor(control: Control<T>, label?: string) {

        super();

        if (label) {

            const labelEl = document.createElement('span');
            labelEl.textContent = label;
            labelEl.style.marginRight = '8px';
            this.element.appendChild(labelEl);
        }

        this.element.appendChild(control.element);

    }

}
