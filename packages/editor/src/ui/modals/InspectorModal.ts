import { Context, LAYERS } from "../../Interfaces";
import { Entity, Layers } from "@stemngine/engine";
import { Folder } from "../../pane/nodes/Folder";
import { renderSchema } from "../../pane/controls/factories";
import { Panel } from "../../pane/Panel";
import { renderNumber } from "../../pane/controls/factories";
import { ParameterBinding } from "../../pane/bindings/ParameterBinding";
import { NumberControl } from "../../pane/controls/NumberControl";
import { ControlNode } from "../../pane/nodes/ControlNode";
import { TextControl } from "../../pane/controls/TextControl";
import { SliderControl } from "../../pane/controls/SliderControl";
import { CheckboxControl } from "../../pane/controls/CheckboxControl";
import { DropDownControl } from "../../pane/controls/DropDownControl";

interface Node {
    id: number;
    name: string;
    type: string;
    visible: boolean;
    children: Node[];
    layers: Layers;
}

export class InspectorModal {

    private context: Context;
    private layers: Layers; // TODO: may be removed

    constructor(context: Context) {

        this.context = context;
        this.layers = new Layers();
        this.layers.set(LAYERS.DEFAULT);

    }

    public render() {

        const panel = new Panel();

        // const entity = this.context.state.selectionManager.get();

        const folder = new Folder('test folder');
        // renderSchema(entity.schema, entity, folder);

        // div.appendChild(folder.element);

        panel.add(folder);

        const obj = {
            factor: 1,
            title: 'hello',
            color: 'color',
            range: 20,
            going: true,
            color2: {
                value: 'red',
                type: 'select',
                options: ['red', 'green', 'blue']
            },
        };

        const binding = new ParameterBinding<number>(obj, 'factor');
        const control = new NumberControl(binding);
        folder.add(new ControlNode(control, 'factor'));

        const binding2 = new ParameterBinding<string>(obj, 'title');
        const control2 = new TextControl(binding2);
        folder.add(new ControlNode(control2, 'title'));

        const binding3 = new ParameterBinding<number>(obj, 'range');
        const control3 = new SliderControl(binding3, { min: -50, max: 50, step: 2 });
        folder.add(new ControlNode(control3, 'range'));

        const binding4 = new ParameterBinding<boolean>(obj, 'going');
        const control4 = new CheckboxControl(binding4);
        folder.add(new ControlNode(control4, 'going'));

        const binding5 = new ParameterBinding<string>(obj, 'color2');
        const control5 = new DropDownControl<string>(binding5, obj.color2.options);
        folder.add(new ControlNode(control5, 'color2'));

        const subFolder = new Folder('sub folder');
        folder.add(subFolder);


        return panel.element;

    }

}
