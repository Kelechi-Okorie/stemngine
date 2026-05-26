import { Context, LAYERS } from "../../Interfaces";
import { Entity, Layers } from "@stemngine/engine";

interface Node {
    id: number;
    name: string;
    type: string;
    visible: boolean;
    children: Node[];
    layers: Layers;
}

export class OutlinerModal {

    private context: Context;
    private layers: Layers; // TODO: may be removed

    constructor(context: Context) {

        this.context = context;
        this.layers = new Layers();
        this.layers.set(LAYERS.DEFAULT);

    }

    public render() {

        const div = document.createElement('div');

        const entities = this.context.simulationManager.getAllEntities();

        entities.forEach(entity => {
            this.renderEntity(div, entity)
        });

        return div;

    }

    public renderEntity(listEl: HTMLElement, entity: Entity) {

        const div = document.createElement('div');
        div.innerText = entity.name;
        div.classList.add('li', 'fill');

        div.onclick = () => {

            // this.spawnObject(item);

            // prevent double-click spam
            // close after spawn succeeds
            requestAnimationFrame(() => {

                // this.closeMenu();

            });
        }

        listEl.appendChild(div);

    }

}
