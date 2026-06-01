import { ContainerNode } from "./nodes/ContainerNode";
import { Node } from "./nodes/Node";

/**
 * Root container
 */
export class Panel extends ContainerNode {

    private content: HTMLElement;

    constructor() {

        super();

        this.element.classList.add('panel', 'column');

        const content = document.createElement('div');
        content.classList.add('panel-content', 'column');
        this.content = content;
        this.element.appendChild(content);

    }

    public add(node: Node) {

        // this.element.appendChild(control.element);
        node.element.classList.add('mb-sm');
        this.children.push(node);
        this.content.appendChild(node.element);


    }

}
