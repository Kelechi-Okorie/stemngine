import { Inspector } from "../../Interfaces";
import { Properties } from "../Properties";
import { worldIcon } from "../../assets/icons/world";
import { SolverDefinition, SolverRegistry, SolverManager, FieldSchema } from "@stemngine/engine";
import { ParameterBinding } from "../../pane/bindings/ParameterBinding";
import { NumberControl } from "../../pane/controls/NumberControl";
import { Folder } from "../../pane/nodes/Folder";
import { ControlNode } from "../../pane/nodes/ControlNode";
import { CheckboxControl } from "../../pane/controls/CheckboxControl";

export class WorldInspector implements Inspector {

    public readonly id = 'world';
    public readonly name = ' World';
    public icon = worldIcon;

    private overlay: HTMLElement | null = null;

    private parent: Properties;
    private SolverRegistryInstance: SolverRegistry;
    private solverManager: SolverManager;
    private content: HTMLElement;

    constructor(parent: Properties) {

        this.parent = parent;
        this.SolverRegistryInstance = parent.context.simulationManager.SolverRegistryInstance;
        this.solverManager = parent.context.simulationManager.solverManager;
        this.content = this.parent.content;

    }

    public onClick = () => {

        this.render();

    }

    public render() {

        console.log(this.parent);

        const registrySolvers = this.SolverRegistryInstance.getAll();
        const solvers = this.solverManager.getAll();

        console.log({ solvers, registrySolvers });

        this.content.innerHTML = ''

        for (const solver of solvers) {

            const box = document.createElement('div');

            // header
            const header = document.createElement('div');
            header.innerText = solver.name;

            // params
            const body = document.createElement('div');

            if (solver.schema) {

                this.renderSchema(solver.schema, solver, body);

            }

            box.appendChild(header);
            box.appendChild(body);

            this.content.appendChild(box);

        }

        const btn = document.createElement('button');
        btn.innerText = '+ Add Solver';

        btn.onclick = () => {

            // simple version first
            this.createAddMenu(registrySolvers);

        };

        this.content.appendChild(btn);

    }

    private createAddMenu(registrySolvers: SolverDefinition[]) {

        const content = this.parent.content;
        const overlay = document.createElement('div');
        overlay.dataset.name = 'the overlay'

        overlay.classList.add('add-tool');

        const input = document.createElement('input');
        input.name = 'add-object';
        input.placeholder = 'Search objects...';

        input.addEventListener('input', () => {

            const query = input.value.toLowerCase();

            const filtered = registrySolvers.filter(o => o.name.toLocaleLowerCase().includes(query));

            this.renderList(listElement, filtered);
        })

        const listElement = document.createElement('div');

        this.renderList(listElement, registrySolvers);

        overlay.appendChild(input);
        overlay.appendChild(listElement);

        this.overlay = overlay;
        // this.container = container;

        content.appendChild(overlay);

        input.focus();

        return { overlay, input, listElement };
    }

    private renderList(listEl: HTMLElement, solverDefinitions: SolverDefinition[]) {

        listEl.innerHTML = '';

        solverDefinitions.forEach(solverDefinition => {

            const row = document.createElement('div');
            row.innerText = solverDefinition.name;
            row.classList.add('menu-row');

            row.onclick = () => {
                this.addSolver(solverDefinition);

                // prevent double-click spam
                // close after spawn succeeds
                requestAnimationFrame(() => {

                    this.closeMenu();
                    this.render();

                });
            }

            listEl.appendChild(row);
        });

    }

    private addSolver(solverDefinition: SolverDefinition) {

        this.solverManager.add(solverDefinition.create());
    }

    private closeMenu() {

        if (this.overlay?.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }

    }

    private renderSchema(fields: FieldSchema[], target: any, parent: HTMLElement) {

        const folder = new Folder(target.name ?? 'Unnamed');

        for (const field of fields) {

            this.renderField(field, target, folder);
        }

        parent.appendChild(folder.element);
    }

    private renderField(field: FieldSchema, target: any, folder: Folder) {


        switch (field.type) {

            case "number":
                this.renderNumber(field, target, folder);
                break;

            case "boolean":
                this.renderBoolean(field, target, folder);
                break;

            case "vector3":
                this.renderVector3(field, target, folder);
                break;

            case "object":
                this.renderObject(field, target, folder);
                break;
        }
    }

    private renderNumber(field: any, target: any, folder: Folder) {

        const { obj, key } = resolvePath(target, field.key);
        const binding = new ParameterBinding<number>(obj, key);

        const control = new NumberControl(binding);

        folder.add(new ControlNode(control, field.label))

    }

    private renderBoolean(field: any, target: any, folder: Folder) {

        const { obj, key } = resolvePath(target, field.key);

        const binding = new ParameterBinding<boolean>(obj, key);
        const control = new CheckboxControl(binding);
        folder.add(new ControlNode(control, field.name));

    }

    private renderVector3(field: any, target: any, folder: Folder) {

        const subFolder = new Folder(field.label);

        const axes = ["x", "y", "z"] as const;

        for (const axis of axes) {

            const subField = field.fields?.[axis];

            if (!subField) continue; // axis locked or hidden

            const path = `${field.key}.${axis}`;
            const { obj, key } = resolvePath(target, path);

            const binding = new ParameterBinding<number>(obj, key);

            const control = new NumberControl(binding);

            subFolder.add(new ControlNode(control, subField.label))

        }

        folder.add(subFolder);

    }

    private renderObject(field: any, target: any, folder: Folder) {

        const subFolder = new Folder(field.label);

        const { obj } = resolvePath(target, field.key);

        this.renderSchema(field.fields, obj, subFolder.element);

        folder.add(subFolder);
    }

}

export function resolvePath(target: any, path: string) {

    const parts = path.split(".");
    let obj = target;

    for (let i = 0; i < parts.length - 1; i++) {

        obj = obj[parts[i]];

        if (obj === undefined || obj === null) {
            throw new Error(`Invalid path: ${path}`);
        }
    }

    const key = parts[parts.length - 1];

    return { obj, key };
}
