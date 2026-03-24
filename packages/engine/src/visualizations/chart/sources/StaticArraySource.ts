import { DataSource, PointAttribute, DataSourceOptions, DataPoint, DataSourceTypes } from "../Interfaces";
import { aosToBuffer, bufferToAOS } from "../extras/DataAdapter";

/**
 * Static array source
 * 
 * @remarks
 * Data could come from
 * - csv file
 * - scientific dataset
 * - precomputed simulation results
 * 
 * Whole dataset available immediately
 */
export class StaticArraySource implements DataSource {

    public buffer: Float32Array;
    public stride: number;
    public count: number;
    public attributes: PointAttribute[];

    constructor(config: DataSourceOptions) {

        const { type, data, schema, layout } = config;

        switch (type) {

            case DataSourceTypes.AOS:
                if (!schema) {  // TODO: also check if schema is not an array of strings

                    throw new Error('StaticArraySource: no schema passed')
                }

                let { buffer, stride, count, attributes } = aosToBuffer(data as any, schema);

                this.buffer = buffer;
                this.stride = stride;
                this.count = count;
                this.attributes = attributes;
                break;

            case DataSourceTypes.BUFFER:

                if (layout === undefined) {

                    throw new Error('StaticArraySource: layout is undefined');
                }

                this.buffer = layout.buffer;
                this.stride = layout.stride;
                this.count = layout.count;
                this.attributes = layout.attributes;
                break;

            default:
                throw new Error('StaticArraySource unknown data type passed in');

        }

    }

    public subscribe(callback: (point: DataPoint) => void): void {


    }

    public unsubscribe(callback: (point: DataPoint) => void): void {

    }

    public getData(): DataPoint[] {

        const data: { x: number, y: number }[] = [];

        // TODO: find the position of x and y attributes
        // don't just assume an ordering
        const buffer = this.buffer;
        const stride = this.stride;

        for (let i = 0; i < buffer.length; i += stride) {

            data.push({ x: buffer[i], y: buffer[i + 1] });

        }

        return data;

    }
}
