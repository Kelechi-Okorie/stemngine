import { Entity, Layers } from "@stemngine/engine";

import { Context, LAYERS } from "../../Interfaces";
import { SelectionEventType } from "../../core/SelectionManager";

export class OutlinerModal {

    public static name = 'Outliner';

    private context: Context;
    private layers: Layers; // TODO: may be removed

    constructor(context: Context) {

        this.context = context;
        this.layers = new Layers();
        this.layers.set(LAYERS.DEFAULT);

    }

    public render(): HTMLElement {

        const listEl = document.createElement('div');
        listEl.classList.add('list');

        const entities = this.context.simulationManager.getAllEntities();

        if (entities.length === 0) {

            // TODO: give this a better design
            const div = document.createElement('div');
            div.classList.add('row', 'padded');
            div.textContent = 'No object(s) added yet';
            return div;

        } else {

            entities.forEach(entity => {
                this.renderEntity(listEl, entity)
            });

            return listEl;

        }

    }

    public renderEntity(listEl: HTMLElement, entity: Entity) {

        const div = document.createElement('div');
        div.classList.add('list-item');
        div.innerText = entity.name;
        div.onclick = () => {

            this.context.state.selectionManager.set(entity);

            // defer UI reactions
            requestAnimationFrame(() => {

                this.context.events.emit({
                    type: SelectionEventType.SELECTION_CHANGED,
                    target: this,
                    entity,
                    source: 'user'
                });

            });

        }

        listEl.appendChild(div);

    }

}
