// TODO: use the build


import { State } from "../core/State";
import { Editor } from "../Interfaces";

interface Node {
    id: number;
    name: string;
    type: string;
    visible: boolean;
    children: Node[]
}

/**
 * Outliner is a projection of internal scene graph into a navigable,
 * interactive structure
 * 
 * Outliner is just a view of the scene graph
 * 
 * TODO:
 * - selection
 * - properties
 * - editing
 * - visibility toggles
 * - hierachy (parent/child)
 * - filtering
 */
export class Outliner implements Editor {

    public name: string;
    private state: State;

    constructor(name: string, state: State) {

        const { scene, camera, isDragging } = state;

        this.name = name;
        this.state = state;

    }

    public mount(container: HTMLElement) {

        this.renderNode(this.state.scene, container, 0);
    }

    public resize(width: number, height: number) {

    }

    public renderNode(node: Node, parent: HTMLElement, depth: number) {

        const row = document.createElement('div');

        row.style.paddingLeft = `${depth * 12}px`;  // TODO: use variable for magic number
        row.style.display = 'flex';
        row.style.alignItems = 'center';

        row.innerText = node.name;

        const eye = document.createElement("span");
        eye.innerText = node.visible ? "👁" : "🚫"; // TODO: make better

        eye.onclick = (e) => {
            e.stopPropagation();
            node.visible = !node.visible;
            // rerenderAll();   // TODO: global refresh - be careful here
        };

        row.appendChild(eye);

        row.onclick = () => {

            this.state.selectionManager.set(node);
            // this.reRenderAll(); // TODO: global refresh - be careful here
        }

        parent.appendChild(row);

        node.children.forEach(child => {

            this.renderNode(child, parent, depth + 1);
        });
    }

    public update() {

        console.log('updataing the outliner');

    }

    public destroy() {

        console.log('destroying the outliner')
    }

}
