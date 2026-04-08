
// TODO: too much duplicate here. refactor

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

export function findSchema(obj: any) {

    if (obj.isMesh) {

        return meshSchema;

    } else {

        console.log(obj);
        throw new Error('Schema: findSchema - obj schema not found');

    }


}
