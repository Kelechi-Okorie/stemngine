import { IBinding } from "../../Interfaces";


export abstract class Control<T> {

    public element: HTMLElement;
    protected binding: IBinding<T>;

    constructor(binding: IBinding<T>) {

        this.element = document.createElement('div');
        this.binding = binding;

        // sync parameter -> UI
        this.binding.subscribe((v) => this.updateView(v));

    }

    // UI -> parameter
    protected setValue(v: T) {

        this.binding.set(v);

    }

    // parameter -> UI (implemented by subclasses)
    protected abstract updateView(value: T): void;

}
