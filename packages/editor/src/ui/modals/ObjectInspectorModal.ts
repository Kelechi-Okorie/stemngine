import { Context, LAYERS } from "../../Interfaces";
import { Entity, Layers } from "@stemngine/engine";
import { Folder } from "../../pane/nodes/Folder";
import { renderSchema } from "../../pane/controls/factories";

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

    public render() {

        const div = document.createElement('div');

        const entity = this.context.state.selectionManager.get();

        const folder = new Folder(entity.name);
        renderSchema(entity.schema, entity, folder);

        div.appendChild(folder.element);

        return div;

    }

}
