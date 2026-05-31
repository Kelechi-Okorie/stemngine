import { ContainerNode } from "./ContainerNode";
import { Node } from "./Node";

export class Folder extends ContainerNode {

    private header: HTMLDivElement;
    private content: HTMLDivElement;
    private expanded = true;

    constructor(title: string) {

        super();

        const header = document.createElement('div');
        header.classList.add('folder-header', 'padded');
        header.textContent = title;
        this.header = header;

        const content = document.createElement('div');
        content.classList.add('folder-content', 'column');
        this.content = content;

        this.header.addEventListener('click', () => {
            
            this.expanded = !this.expanded;
            this.element.classList.toggle('collapsed', !this.expanded);

        });

        this.element.classList.add('folder', 'column');
        this.element.appendChild(this.header);
        this.element.appendChild(this.content);
    }

    // TODO: may be removed. parent already has add
    public add(node: Node) {

        // TODO: remember to also remove children
        node.element.classList.add('mb-sm');
        this.children.push(node);
        this.content.appendChild(node.element);

    }
}
