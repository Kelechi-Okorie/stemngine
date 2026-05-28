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
import { ControlNode } from "../nodes/ControlNode";

import { Folder } from "../nodes/Folder";

function renderSchema(fields: FieldSchema[], target: any, folder: Folder) {

    for (const field of fields) {

        renderField(field, target, folder);
    }

}

function renderField(field: FieldSchema, target: any, folder: Folder) {

    switch (field.type) {

        case "number":
            renderNumber(field, target, folder);
            break;

        case "boolean":
            renderBoolean(field, target, folder);
            break;

        case "vector3":
            renderVector3(field, target, folder);
            break;

        case "object":
            renderObject(field, target, folder);
            break;

        default:
            throw new Error(`field type not found`)
    }
}

function renderNumber(field: any, target: any, folder: Folder) {

    const { obj, key } = resolvePath(target, field.key);

    const binding = new ParameterBinding<number>(obj, key);
    const control = new NumberControl(binding);
    folder.add(new ControlNode(control, field.label))

}

function renderBoolean(field: any, target: any, folder: Folder) {

    const { obj, key } = resolvePath(target, field.key);

    const binding = new ParameterBinding<boolean>(obj, key);
    const control = new CheckboxControl(binding);
    folder.add(new ControlNode(control, field.label));

}

function renderVector3(field: any, target: any, folder: Folder) {

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

function renderObject(field: any, target: any, folder: Folder) {

    const subFolder = new Folder(field.label);

    const { obj } = resolvePath(target, field.key);

    renderSchema(field.fields, obj, subFolder);

    folder.add(subFolder);
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
    renderNumber,
    renderBoolean,
    renderObject,
    renderVector3
}
