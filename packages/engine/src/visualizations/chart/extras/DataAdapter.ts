import { BufferLayout } from "../Interfaces";

export function aosToBuffer(
    data: Record<string, number>[],
    schema: string[],
): BufferLayout {

    const count = data.length;
    const stride = schema.length;

    const buffer = new Float32Array(count * stride);

    // build attribute metadata
    const attributes = schema.map((name, i) => ({
        name,
        offset: i
    }));

    for (let i = 0; i < count; i++) {

        const point = data[i];
        const base = i * stride;

        for (let j = 0; j < stride; j++) {

            const key = schema[j];

            if (!(key in point)) {

                throw new Error(`DataAdapter: AOSToBuffer - Missing attribute ${key}`);

            }

            const value = point[key];

            // optional safety check and default value - how to treat missing values
            buffer[base + j] = value ?? 0;
        }

    }

    return { buffer, stride, count, attributes };

}

export function bufferToAOS(layout: BufferLayout): Record<string, number>[] {

    const { buffer, stride, count, attributes } = layout;

    const result: Record<string, number>[] = new Array(count);

    for (let i = 0; i < count; i++) {

        const base = i * stride;
        const obj: Record<string, number> = {};

        for (const attr of attributes) {

            obj[attr.name] = buffer[base + attr.offset];

        }

        result[i] = obj;

    }

    return result;

}

export function createEmptyBuffer(schema: string[], maxCount: number): BufferLayout {

    const stride = schema.length;

    const buffer = new Float32Array(maxCount * stride);

    const attributes = schema.map((name, i) => ({
        name,
        offset: i
    }));

    return {
        buffer,
        stride,
        count: 0,   // no data yet
        attributes
    };

}
