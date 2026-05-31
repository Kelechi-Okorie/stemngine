interface ActionBinding {
    trigger: () => void;
}

export class ButtonControl {

    private button: HTMLButtonElement;
    public element: HTMLElement;
    private binding: ActionBinding;

    constructor(binding: ActionBinding, label: string) {

        this.binding = binding;

        this.button = document.createElement("button");
        this.button.classList.add('button');
        this.button.textContent = label;
        this.element = this.button;

        this.button.addEventListener("click", this.onClick);

    }

    public onClick = () => this.binding.trigger();

    destroy() {
        this.button.removeEventListener("click", this.onClick);
        this.button.remove();
    }

}
