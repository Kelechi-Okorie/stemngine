// TODO: make sure every module in the editor uses the exports from
// stemngine build

import { Vector2 } from "@stemngine/engine";
import { Control } from "./Control";
import { IBinding } from "../../Interfaces";

// TODO: may be removed

export class Vector2Control extends Control<Vector2> {

    private xInput: HTMLInputElement;
    private yInput: HTMLInputElement;

    constructor(binding: IBinding<Vector2>) {

        super(binding);

        this.xInput = document.createElement('input');
        this.yInput = document.createElement('input');

        this.xInput.type = 'number';
        this.yInput.type = 'number';

        this.xInput.style.width = '60px';
        this.yInput.style.width = '60px';

        this.xInput.addEventListener('input', () => this.emit());
        this.yInput.addEventListener('input', () => this.emit());

        this.element.appendChild(this.xInput);
        this.element.appendChild(this.yInput);

        this.updateView(this.binding.get());

    }

    private emit() {

        const x = Number(this.xInput.value);
        const y = Number(this.yInput.value);

        this.setValue(new Vector2(x, y))

    }

    protected updateView(value: Vector2): void {

        this.xInput.value = String(value.x);
        this.yInput.value = String(value.y);
    }
}
