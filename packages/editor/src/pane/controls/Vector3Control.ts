// TODO: make sure every module in the editor uses the exports from
// stemngine build

import { Vector2 } from "@stemngine/engine";
import { Vector3 } from "@stemngine/engine";
import { Control } from "./Control";
import { IBinding } from "../../Interfaces";
import { ParameterBinding } from "../bindings/ParameterBinding";

// TODO: may be removed

export class Vector3Control extends Control<Vector3> {

    // private xInput: HTMLInputElement;
    // private yInput: HTMLInputElement;
    // private zInput: HTMLInputElement;

    constructor(binding: IBinding<Vector3>) {

        super(binding);

        const vec = this.binding.get();

        // this.xInput = document.createElement('input');
        // this.yInput = document.createElement('input');
        // this.zInput = document.createElement('input');

        // this.xInput.type = 'number';
        // this.yInput.type = 'number';
        // this.zInput.type = 'number';

        // this.xInput.style.width = '60px';
        // this.yInput.style.width = '60px';
        // this.zInput.style.width = '60px';

        // this.xInput.addEventListener('input', () => this.emit());
        // this.yInput.addEventListener('input', () => this.emit());
        // this.zInput.addEventListener('input', () => this.emit());

        // this.element.appendChild(this.xInput);
        // this.element.appendChild(this.yInput);
        // this.element.appendChild(this.zInput);

        // this.updateView(this.binding.get());

        // this.binding.subscribe((value) => {

        //     this.updateView(value);

        // })

    }

    // private emit() {

    //     const x = Number(this.xInput.value);
    //     const y = Number(this.yInput.value);
    //     const z = Number(this.zInput.value);

    //     this.setValue(new Vector3(x, y, z))

    // }

    protected updateView(value: Vector3): void {

        // this.xInput.value = String(value.x);
        // this.yInput.value = String(value.y);
        // this.zInput.value = String(value.z);
    }
}
