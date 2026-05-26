import { Context } from "../../Interfaces";
import { RepresentationStore } from "../../core/RepresentationStore";
import { MathUtils } from "@stemngine/engine";

const OBJECTS = [
    // physics - state carriers
    { name: "Particle", type: "particle" },
    { name: "Rigid Body", type: "rigid_body" },

    // physics - constraints / relations
    { name: "Distance", type: "distance" },
    { name: "Fixed Point", type: "fixed_point" },
    { name: "Joint (hinge, slider)", type: "joint" },

    // // physics - forces
    // { name: "Gravity", type: "gravity" },
    // { name: "Spring", type: "spring" },
    // { name: "External", type: "external" },

    // // math - objects
    // { name: "Point", type: "point" },
    // { name: "Scalar", type: "scalar" },
    // { name: "Vector", type: "vector" },

    // // math - mappings
    // { name: "Function f(x)", type: "function" },
    // { name: "Parametric curve", type: "parametric_curve" },

    // // math relations
    // { name: "Equation", type: "equation" },
    // { name: "Constraint", type: "con" }
];


export class AddToolModal {

    private context: Context;

    constructor(context: Context) {

        this.context = context;

    }

    public render() {

        const div = document.createElement('div');
        const input = document.createElement('input');
        input.name = 'add-object';
        input.placeholder = 'Search objects...';

        input.addEventListener('input', () => {

            const query = input.value.toLowerCase();

            const filtered = OBJECTS.filter(o => o.name.toLocaleLowerCase().includes(query));

            this.renderList(listElement, filtered);
        })

        const listElement = document.createElement('div');
        listElement.classList.add('column');

        this.renderList(listElement, OBJECTS);

        div.appendChild(input);
        div.appendChild(listElement);

        input.focus();

        return div;

    }

    public renderList(listEl: HTMLElement, items: { name: string, type: string }[]) {

        listEl.innerHTML = '';

        items.forEach(item => {

            const div = document.createElement('div');
            div.innerText = item.name;
            div.classList.add('li', 'fill');

            div.onclick = () => {

                this.spawnObject(item);

                // prevent double-click spam
                // close after spawn succeeds
                requestAnimationFrame(() => {

                    // this.closeMenu();

                });
            }

            listEl.appendChild(div);
        });

    }

    public spawnObject(config: Record<string, any>) {

        const position = this.context.state.cursor.position.clone();
        config = { ...config, position }

        const entity = this.context.simulationManager.addEntity(config);

        RepresentationStore.add({
            id: MathUtils.generateUUID(),
            entityId: entity.uuid,
            entity,
            kind: 'point', // default view for this tool
            color: 0x00ff00,
            size: 1
        });

    }

}
