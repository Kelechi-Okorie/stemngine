
// TODO: too much duplicate here. refactor

import { SystemType } from "@stemngine/engine";

export interface ParameterSchema {
    type: 'number' | 'bool' | 'color' | 'vector2' | 'vector3';
    label?: string;
    min?: number;
    max?: number;
    step?: number;
    children?: Record<string, ParameterSchema>; // nested objects
}

export const WorldSchema: Record<string, ParameterSchema> = {
    visible: { type: 'bool' },
    color: { type: 'color' },
};

export const sceneSchema: Record<string, ParameterSchema> = {
    position: {
        type: 'vector3',
        label: 'Position',
        children: {
            x: { type: 'number', min: -10, max: 10, step: 0.1 },
            y: { type: 'number', min: -10, max: 10, step: 0.1 },
            z: { type: 'number', min: -10, max: 10, step: 0.1 }
        }
    },
    visible: { type: 'bool' },
    color: { type: 'color' },
};

export const cameraSchema: Record<string, ParameterSchema> = {
    position: {
        type: 'vector3',
        label: 'Position',
        children: {
            x: { type: 'number', min: -10, max: 10, step: 0.1 },
            y: { type: 'number', min: -10, max: 10, step: 0.1 },
            z: { type: 'number', min: -10, max: 10, step: 0.1 }
        }
    },
    visible: { type: 'bool' },
    color: { type: 'color' },
};

export const lightSchema: Record<string, ParameterSchema> = {
    position: {
        type: 'vector3',
        label: 'Position',
        children: {
            x: { type: 'number', min: -10, max: 10, step: 0.1 },
            y: { type: 'number', min: -10, max: 10, step: 0.1 },
            z: { type: 'number', min: -10, max: 10, step: 0.1 }
        }
    },
    visible: { type: 'bool' },
    color: { type: 'color' },
};

export const meshSchema: Record<string, ParameterSchema> = {
    position: {
        type: 'vector3',
        label: 'Position',
        children: {
            x: { type: 'number', min: -10, max: 10, step: 0.1 },
            y: { type: 'number', min: -10, max: 10, step: 0.1 },
            z: { type: 'number', min: -10, max: 10, step: 0.1 }
        }
    },
    visible: { type: 'bool' },
    color: { type: 'color' },
};

const particleSystem: Record<string, ParameterSchema> = {

    position: {
        type: 'vector3',
        label: 'Position',
        children: {
            x: { type: 'number', min: -10, max: 10, step: 0.1 },
            y: { type: 'number', min: -10, max: 10, step: 0.1 },
            z: { type: 'number', min: -10, max: 10, step: 0.1 }
        }
    },

    velocity: {
        type: 'vector3',
        label: 'Velocity',
        children: {
            x: { type: 'number', min: -10, max: 10, step: 0.1 },
            y: { type: 'number', min: -10, max: 10, step: 0.1 },
            z: { type: 'number', min: -10, max: 10, step: 0.1 }
        }
    },

    mass: {
        type: 'number',
        label: 'Mass',
        min: 0,
        max: 100,
        step: 0.1
    },

    damping: {
        type: 'number',
        label: 'Damping',
        min: 0,
        max: 1,
        step: 0.01
    }

};

export const schemas: Record<SystemType, Record<string, ParameterSchema>> = {
    [SystemType.ParticleSystem]: particleSystem
}

export function findSchema(type: SystemType) {

    const schema = schemas[type];

    if (schema) {

        return schema;

    } else {

        console.log(type)
        throw new Error(`Schema: findSchema - obj schema not found for type - ${type}`);

    }

}
