import { FieldSchema } from "@stemngine/engine";

import { ParameterBinding } from "../bindings/ParameterBinding";
import { CheckboxControl } from "./CheckboxControl";
import { ColorControl } from "./ColorControl";
import { Control } from "./Control";
import { DropDownControl } from "./DropDownControl";
import { NumberControl } from "./NumberControl";
import { SliderControl } from "./SliderControl";
import { Vector2Control } from "./Vector2Control";
import { Vector3Control } from "./Vector3Control";
import { TextControl } from "./TextControl";
import { ControlNode } from "../nodes/ControlNode";
import { ContainerNode } from "../nodes/ContainerNode";
import { Panel } from "../Panel";

import { Folder } from "../nodes/Folder";

function renderSchema(fields: FieldSchema[], target: any, container: ContainerNode) {

    for (const field of fields) {

        renderField(field, target, container);
    }

}

function renderField(field: FieldSchema, target: any, container: ContainerNode) {

    switch (field.type) {

        case "string":
            renderText(field, target, container);
            break;

        case "number":
            renderNumber(field, target, container);
            break;

        case "boolean":
            renderBoolean(field, target, container);
            break;

        case "vector3":
            renderVector3(field, target, container);
            break;

        case "object":
            renderObject(field, target, container);
            break;

        default:
            throw new Error(`field type not found`)
    }
}

function renderText(field: any, target: any, container: ContainerNode) {

    const { obj, key } = resolvePath(target, field.key);

    const binding = new ParameterBinding<string>(obj, key);
    const control = new TextControl(binding);
    container.add(new ControlNode(control, field.label))

}

function renderNumber(field: any, target: any, container: ContainerNode) {

    const { obj, key } = resolvePath(target, field.key);

    const binding = new ParameterBinding<number>(obj, key);
    const control = new NumberControl(binding);
    container.add(new ControlNode(control, field.label))

}

function renderBoolean(field: any, target: any, container: ContainerNode) {

    const { obj, key } = resolvePath(target, field.key);

    const binding = new ParameterBinding<boolean>(obj, key);
    const control = new CheckboxControl(binding);
    container.add(new ControlNode(control, field.label));

}

function renderVector3(field: any, target: any, container: ContainerNode) {

    const axes = ["x", "y", "z"] as const;

    const container1 = new ContainerNode();
    const container2 = new ContainerNode();
    container1.element.classList.add('center-y', 'flex-1');
    container2.element.classList.add('row', 'center', 'flex-2');

    for (const axis of axes) {

        const subField = field.fields?.[axis];

        if (!subField) continue; // axis locked or hidden

        const path = `${field.key}.${axis}`;
        const { obj, key } = resolvePath(target, path);

        const binding = new ParameterBinding<number>(obj, key);

        const control = new NumberControl(binding);

        container2.add(new ControlNode(control));

    }

    container1.element.innerText = field.label;

    const fieldContainer = new ContainerNode();
    fieldContainer.element.classList.add('row');
    fieldContainer.add(container1);
    fieldContainer.add(container2);

    container.add(fieldContainer);

}

function renderObject(field: any, target: any, container: ContainerNode) {

    const subFolder = new Folder(field.label);

    const { obj } = resolvePath(target, field.key);

    renderSchema(field.fields, obj, subFolder);

    container.add(subFolder);
}

function resolvePath(target: any, path: string) {

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

export {
    renderSchema,
    renderField,
    renderText,
    renderNumber,
    renderBoolean,
    renderObject,
    renderVector3
}
