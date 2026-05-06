// TODO: use the build

import { GlobalEventDispatcher, Layers } from "@stemngine/engine";
import { State } from "../core/State";
import { Editor, EditorContext, Entity, LAYERS } from "../Interfaces";
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

    public name: string;
    private context: EditorContext;
    private layers: Layers;
    private container!: HTMLElement;

    constructor(name: string, context: EditorContext) {

        this.name = name;
        this.context = context;

        this.layers = new Layers();
        this.layers.set(LAYERS.DEFAULT);

        GlobalEventDispatcher.instance.addEventListener(
            EntityEventType.ENTITY_CREATED,
            this.onEntityCreated.bind(this)
        );

    }

    public mount(container: HTMLElement) {

        // this.renderNode(this.context.state.scene, container, 0);
        this.container = container;
        this.renderEntities();
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

            // this.context.state.selectionManager.set(entity);
            // this.reRenderAll(); // TODO: global refresh - be careful here
        }

        this.container.appendChild(row);

    }

    public update() {

        console.log('updataing the outliner');

    }

    public unmount() {

        console.log('destroying the outliner')
    }

    private onEntityCreated(e: EntityEvent): void {

        const { type, entity, source } = e;

        this.renderEntity(entity);

    }

}
