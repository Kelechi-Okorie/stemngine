import { Context, LAYERS } from "../../Interfaces";
import { Layers } from "@stemngine/engine";
import { renderSchema } from "../../pane/controls/factories";
import { Panel } from "../../pane/Panel";

interface Node {
    id: number;
    name: string;
    type: string;
    visible: boolean;
    children: Node[];
    layers: Layers;
}

export class ObjectInspectorModal {

    private context: Context;
    private layers: Layers; // TODO: may be removed

    constructor(context: Context) {

        this.context = context;
        this.layers = new Layers();
        this.layers.set(LAYERS.DEFAULT);

    }

    public render(): HTMLElement {

        const entity = this.context.state.selectionManager.get();

        if (entity === null) {

            // TODO: give this a better design
            const div = document.createElement('div');
            div.classList.add('row', 'padded');
            div.textContent = 'No entity selected';
            return div;

        } else {
            
            const panel = new Panel();
            renderSchema(entity.schema, entity, panel);
            return panel.element;

        }

    }

}
