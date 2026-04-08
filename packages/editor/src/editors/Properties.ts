import { Vector2, Vector3 } from "@stemngine/engine";

import { State } from "../core/State";
import { Editor } from "../Interfaces";
import { Panel } from "../pane/Panel";
import { IBinding } from "../Interfaces";
import { ParameterBinding } from "../pane/bindings/ParameterBinding";
import { Control } from "../pane/controls/Control";
import { SliderControl } from "../pane/controls/SliderControl";
import { CheckboxControl } from "../pane/controls/CheckboxControl";
import { ColorControl } from "../pane/controls/ColorControl";

import { Folder } from "../pane/nodes/Folder";
import { Node } from "../pane/nodes/Node";
import { ControlNode } from "../pane/nodes/ControlNode";
import { SelectionManager } from "../pane/SelectionManager";
import { ParameterSchema, findSchema } from "../core/Schemas";
import { makeReactive } from "../pane/bindings/extras";

/**
 * The properties panel
 */
export class Properties implements Editor {

    public name: string;
    private state: State;
    private panel!: Panel;
    private selectionManager: SelectionManager;

    constructor(name: string, state: State) {

        const { scene, camera, selectionManager, isDragging } = state;

        this.name = name;
        this.state = state;
        this.selectionManager = selectionManager;

        this.selectionManager.subscribe((obj) => {

            this.rebuild(obj);

        });

    }

    public mount(container: HTMLElement) {

        // this is supposed to be the built properties panel
        const div = document.createElement('div');
        div.className = 'properties';
        div.style.width = "100%";
        div.style.height = "100%";

        const panel = new Panel();
        this.panel = panel;

        container.appendChild(panel.element);
    }

    public resize(width: number, height: number) {

    }

    public update() {

        console.log('updataing the properties panel');

    }

    private rebuild(obj: any) {

        this.panel.element.innerHTML = '';

        if (!obj) return;

        const schema = findSchema(obj);

        const ui = this.buildUIFromSchema(obj, schema);

        const btn = document.createElement('button');
        btn.textContent = 'click me';
        btn.addEventListener('click', () => {

            const obj = makeReactive(this.state.selectionManager.get());
            obj.position.y += -0.5;
            // obj.visible = !obj.visible;
        })

        this.panel.add({ element: btn });


        this.panel.add(ui);

    }

    private createBinding(obj: any, key: string) {

        return new ParameterBinding(obj, key);

    }


    private buildUIFromSchema(obj: any, schema: Record<string, ParameterSchema>): Node {

        const folder = new Folder(obj.name);

        for (const key in schema) {

            const paramSchema = schema[key];
            const binding = this.createBinding(obj, key);

            if (paramSchema.children) {

                const childUI = this.buildUIFromSchema(obj[key], paramSchema.children);
                const subFolder = new Folder(paramSchema.label || key);
                subFolder.add(childUI);
                // continue;
            }

            let control: Control<any> | null = null;
            let subFolder: Folder | null = null;

            switch (paramSchema.type) {

                case 'number':
                    control = new SliderControl(
                        binding as IBinding<number>, {
                        min: paramSchema.min ?? 0,
                        max: paramSchema.max ?? 10,
                        step: paramSchema.step ?? 1
                    });
                    break;

                case 'bool':
                    control = new CheckboxControl(binding as IBinding<boolean>);
                    break;

                case 'color':
                    control = new ColorControl(binding as IBinding<string>);
                    break;
                case 'vector3':
                    // control = new Vector3Control(binding as IBinding<Vector3>);

                    const vec = obj[key];

                    subFolder = new Folder(paramSchema.label || key);

                    subFolder.add(new ControlNode(
                        new SliderControl(this.createBinding(vec, 'x') as IBinding<number>, { min: -10, max: 10, step: 1 }), 'x'
                    ));
                    folder.add(subFolder)

                    subFolder.add(new ControlNode(
                        new SliderControl(this.createBinding(vec, 'y') as IBinding<number>, { min: -10, max: 10, step: 1 }), 'y'
                    ));
                    folder.add(subFolder)

                    subFolder.add(new ControlNode(
                        new SliderControl(this.createBinding(vec, 'z') as IBinding<number>, { min: -10, max: 10, step: 1 }), 'z'
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

                throw new Error('Editor Properties: buildUIFromSchema - unknown control type');
            }


        }

        return folder;

    }

    public destroy() {

        console.log('destroying the properties panel')
    }

}
