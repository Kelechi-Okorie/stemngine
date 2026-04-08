import { Node } from "./Node";

export class ContainerNode extends Node {

    protected children: Node[] = [];

    constructor() {

        super('div');

    }

    public add(node: Node) {

        // TODO: remember to also remove children
        this.children.push(node);
        this.element.appendChild(node.element);

    }
}
