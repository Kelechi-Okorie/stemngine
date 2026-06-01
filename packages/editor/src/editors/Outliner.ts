// TODO: use the build

import { GlobalEventDispatcher, Layers } from "@stemngine/engine";
import { Editor, Context, Entity, LAYERS } from "../Interfaces";
import { EntityEvent, EntityEventType } from "../core/SimulationManager";

interface Node {
    id: number;
    name: string;
    type: string;
    visible: boolean;
    children: Node[];
    layers: Layers;
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

    public name: string = 'Outliner';
    private context: Context;
    private layers: Layers; // TODO: may be removed
    private container!: HTMLElement;

    constructor(context: Context) {

        this.context = context;

        this.layers = new Layers();
        this.layers.set(LAYERS.DEFAULT);

    }

    public mount(container: HTMLElement) {

        this.container = container;

    }

    public resize(width: number, height: number) {

    }

    public renderNode(node: Node, parent: HTMLElement, depth: number) {

        if (!node.layers.test(this.layers)) {

            return;

        }

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

            this.context.state.selectionManager.set(node);
            // this.reRenderAll(); // TODO: global refresh - be careful here
        }

        parent.appendChild(row);

        node.children.forEach(child => {

            this.renderNode(child, parent, depth + 1);
        });
    }

    public renderEntities() {

        const entities = this.context.simulationManager.getAllEntities();

        entities.forEach(entity => {
            this.renderEntity(entity)
        })
    }

    public renderEntity(entity: Entity) {

        const row = document.createElement('div');

        const depth = 0;

        row.style.paddingLeft = `${depth * 12}px`;  // TODO: use variable for magic number
        row.style.display = 'flex';
        row.style.alignItems = 'center';

        row.innerText = entity.name;

        const eye = document.createElement("span");
        // eye.innerText = entity.visible ? "👁" : "🚫"; // TODO: make better

        // eye.onclick = (e) => {
        //     e.stopPropagation();
        //     entity.visible = !entity.visible;
        //     // rerenderAll();   // TODO: global refresh - be careful here
        // };

        row.appendChild(eye);

        row.onclick = () => {

            this.context.state.selectionManager.set(entity);

            // this.reRenderAll(); // TODO: global refresh - be careful here
        }

        this.container.appendChild(row);

    }

    public update() {

        console.log('updataing the outliner');

    }

    public unmount() {

        // GlobalEventDispatcher.instance.removeEventListener(
        //     EntityEventType.ENTITY_CREATED,
        //     this.onEntityCreated
        // );

    }

}
