import { IBinding } from "../../Interfaces";
import { Control } from "./Control";


export class DropDownControl<T> extends Control<T> {

    private select: HTMLSelectElement;

    constructor(binding: IBinding<T>, options: T[]) {

        super(binding);

        this.select = document.createElement('select');

        options.forEach((opt) => {

            const option = document.createElement('option');
            option.value = String(opt);
            option.textContent = String(opt);
            this.select.appendChild(option);

        });

        this.select.addEventListener('change', () => {

            this.setValue(this.select.value as unknown as T);

        });

        this.element.appendChild(this.select);
    }

    protected updateView(value: T): void {

        this.select.value = String(value);

    }
}