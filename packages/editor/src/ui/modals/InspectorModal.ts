import { Context, LAYERS } from "../../Interfaces";
import { Entity, Layers, Color, Vector2, Vector3 } from "@stemngine/engine";
import { Folder } from "../../pane/nodes/Folder";
import { renderSchema, renderVector3 } from "../../pane/controls/factories";
import { Panel } from "../../pane/Panel";
import { renderNumber } from "../../pane/controls/factories";
import { ParameterBinding } from "../../pane/bindings/ParameterBinding";
import { NumberControl } from "../../pane/controls/NumberControl";
import { ControlNode } from "../../pane/nodes/ControlNode";
import { TextControl } from "../../pane/controls/TextControl";
import { SliderControl } from "../../pane/controls/SliderControl";
import { CheckboxControl } from "../../pane/controls/CheckboxControl";
import { DropDownControl } from "../../pane/controls/DropDownControl";
import { ColorControl } from "../../pane/controls/ColorControl";
import { Control } from "../../pane/controls/Control";
import { ContainerNode } from "../../pane/nodes/ContainerNode";
import { ButtonControl } from "../../pane/controls/ButtonControl";

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
            color3: new Color(0xff0000),
            vector2: new Vector2(),
            vector3: new Vector3(1, 2, 3)
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

        const binding6 = new ParameterBinding<Color>(obj, 'color3');
        const control6 = new ColorControl(binding6);
        folder.add(new ControlNode(control6, 'color3'));

        const bindingX = new ParameterBinding<number>(obj['vector3'], 'x');
        const controlX = new NumberControl(bindingX);
        const bindingY = new ParameterBinding<number>(obj['vector3'], 'y');
        const controlY = new NumberControl(bindingY);
        const bindingZ = new ParameterBinding<number>(obj['vector3'], 'z');
        const controlZ = new NumberControl(bindingZ);
        
        // div.appendChild(new ControlNode(controlX).element);
        const container1 = new ContainerNode();
        const container2 = new ContainerNode();
        container1.element.classList.add('center-y');
        container2.element.classList.add('row', 'center');

        container2.add(new ControlNode(controlX));
        container2.add(new ControlNode(controlY));
        container2.add(new ControlNode(controlZ));

        container1.element.innerText = 'vector3';

        container1.element.classList.add('flex-1');
        container2.element.classList.add('flex-2');

        const container = new ContainerNode();
        container.element.classList.add('row');
        container.add(container1);
        container.add(container2);

        folder.add(container);

        const subFolder = new Folder('sub folder');
        const btnContainer = new ContainerNode();
        btnContainer.element.classList.add('row');
        const action = {trigger: () => console.log('button')}
        const button = new ButtonControl(action, 'Button');
        const button2 = new ButtonControl(action, 'Button2');
        btnContainer.add(button);
        btnContainer.add(button2);
        subFolder.add(btnContainer);
        folder.add(subFolder);

        return panel.element;

    }

}
