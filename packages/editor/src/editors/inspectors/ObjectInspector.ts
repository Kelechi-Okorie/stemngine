import { Inspector } from "../../Interfaces";
import { Properties } from "../Properties";
import { Node } from "../../pane/nodes/Node";
import { Control } from "../../pane/controls/Control";
import { ControlNode } from "../../pane/nodes/ControlNode";
import { NumberControl } from "../../pane/controls/NumberControl";
import { Folder } from "../../pane/nodes/Folder";
import { IBinding } from "../../Interfaces";
import { ParameterBinding } from "../../pane/bindings/ParameterBinding";
import { CheckboxControl } from "../../pane/controls/CheckboxControl";
import { ColorControl } from "../../pane/controls/ColorControl";
import { squareIcon } from "../../assets/icons/square";
import { renderSchema } from "../../pane/controls/factories";

export class ObjectInspector implements Inspector {

    public readonly id = 'object';
    public readonly name = 'Object';
    public icon = squareIcon;

    private parent: Properties;

    constructor(parent: Properties) {

        this.parent = parent;

        this.parent.context.state.selectionManager.subscribe(this.render);

    }

    public onClick = (): void => {

        console.log('clicked')

        this.render();
    }

    public render = (entity?: any) => {

        entity = entity || this.parent.context.state.selectionManager.get();

        const content = this.parent.content;

        content.innerHTML = '';

        if (!entity) return;

        const folder = new Folder(entity.name);
        renderSchema(entity.schema, entity, folder);

        content.appendChild(folder.element);

        content.append()

    }

}
