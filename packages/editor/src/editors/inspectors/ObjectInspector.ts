import { Inspector } from "../../Interfaces";
import { Properties } from "../Properties";
import { ParameterSchema, findSchema } from "../../core/Schemas";
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

        const simulationManager = this.parent.context.simulationManager;
        const content = this.parent.content;

        content.innerHTML = '';

        if (!entity) return;

        const systemType = simulationManager.getEntitySystemType(entity.uuid);
        if (systemType === undefined) return;

        const schema = findSchema(systemType);

        const ui = this.buildUIFromSchema(entity, schema);

        content.appendChild(ui.element);

        content.append()

    }

    private createBinding(obj: any, key: string) {

        return new ParameterBinding(obj, key);

    }

    private buildUIFromSchema(entity: any, schema: Record<string, ParameterSchema>): Node {

        const folder = new Folder(entity.name);

        for (const key in schema) {

            const paramSchema = schema[key];
            const binding = this.createBinding(entity, key);    // TODO: add parameter binding type

            if (paramSchema.children) {

                const childUI = this.buildUIFromSchema(entity[key], paramSchema.children);
                const subFolder = new Folder(paramSchema.label || key);
                subFolder.add(childUI);
                // continue;
            }

            let control: Control<any> | null = null;
            let subFolder: Folder | null = null;

            switch (paramSchema.type) {

                case 'number':

                    control = new NumberControl(binding as IBinding<number>)
                    break;

                case 'bool':
                    control = new CheckboxControl(binding as IBinding<boolean>);
                    break;

                case 'color':

                    control = new ColorControl(binding as IBinding<string>);
                    break;

                case 'vector3':

                    const vec = entity[key];

                    subFolder = new Folder(paramSchema.label || key);

                    subFolder.add(new ControlNode(
                        new NumberControl(this.createBinding(vec, 'x') as IBinding<number>)
                    ));
                    folder.add(subFolder)

                    subFolder.add(new ControlNode(
                        new NumberControl(this.createBinding(vec, 'y') as IBinding<number>)
                    ));
                    folder.add(subFolder)

                    subFolder.add(new ControlNode(
                        new NumberControl(this.createBinding(vec, 'z') as IBinding<number>)
                    ));

                    folder.add(subFolder)

                    break;

                default:
                    console.log('faulty schema', paramSchema)
                    throw new Error(`Unknown type: ${paramSchema.type}`);

            }

            if (control !== null) {

                folder.add(new ControlNode(control, paramSchema.label || key));

            } else if (subFolder !== null) {

                folder.add(subFolder);

            } else {

                console.log({control, subFolder});
                throw new Error('Editor Properties: buildUIFromSchema - unknown control type');
            }

        }

        return folder;

    }

}
