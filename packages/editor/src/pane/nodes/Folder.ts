import { ContainerNode } from "./ContainerNode";
import { Node } from "./Node";

export class Folder extends ContainerNode {

    private header: HTMLDivElement;
    private content: HTMLDivElement;
    private expanded = true;

    constructor(title: string) {

        super();

        this.header = document.createElement('div');
        this.header.textContent = title;
        this.header.style.cursor = 'pointer';
        this.header.style.fontWeight = 'bold';

        this.content = document.createElement('div');
        this.content.style.paddingLeft = '10px';

        this.header.addEventListener('click', () => {
            
            this.expanded = !this.expanded;
            this.content.style.display = this.expanded ? 'block' : 'none';

        });

        this.element.appendChild(this.header);
        this.element.appendChild(this.content);
    }

    public add(node: Node) {

        // TODO: remember to also remove children
        this.children.push(node);
        this.content.appendChild(node.element);
    }
}
