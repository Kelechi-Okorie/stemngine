import { ContainerNode } from "./nodes/ContainerNode";

/**
 * Root container
 */
export class Panel extends ContainerNode {

    constructor() {

        super();

        this.element.classList.add('panel', 'column');

    }

    public add(control: { element: HTMLElement}) {

        this.element.appendChild(control.element);

    }

}
