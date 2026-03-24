import { DataSource, PointAttribute, DataSourceOptions, DataPoint, DataSourceTypes } from "../Interfaces";
import { aosToBuffer, createEmptyBuffer } from "../extras/DataAdapter";

// The difference between StaticArraySource and StreamingSource
// is not memory format, but the data lifecycle and update model

// streamind data is not just "more data"  it's a changing window over a ring buffer

export class StreamingSource implements DataSource {

    public buffer: Float32Array;
    public stride: number;
    public maxCount: number = 1024;    // total slots in buffer
    public attributes: PointAttribute[];

    private head = 0; // index of next write
    private currentCount = 0; // how many points currently stored

    private listeners = new Set<(point: DataPoint) => void>();

    constructor(config: DataSourceOptions) {

        const { type, data, schema, layout } = config;

        switch (type) {

            case DataSourceTypes.AOS:
                if (!schema) {  // TODO: also check if schema is not an array of strings

                    throw new Error('StreamingSource: no schema passed')
                }

                // preloaded data
                if (data && (data as Record<string, any>[]).length) {

                    let { buffer, stride, count, attributes } = aosToBuffer(data as any, schema);

                    // this.buffer = buffer;
                    this.buffer = new Float32Array(this.maxCount * stride)
                    this.stride = stride;
                    this.attributes = attributes;

                    // copy initial data into buffer
                    this.buffer.set(buffer);
                    this.currentCount = count;

                } else {

                    // streaming mode (empty start)
                    let { buffer, stride, count, attributes } = createEmptyBuffer(schema, this.maxCount);

                    this.buffer = buffer;
                    this.stride = stride;
                    this.attributes = attributes;
                    this.currentCount = 0;
                }

                // const layout = createEmptyBuffer(schema, this.maxCount);

                break;

            case DataSourceTypes.BUFFER:

                if (layout === undefined) {

                    throw new Error('StreamingSource: layout is undefined');
                }

                this.buffer = layout.buffer;
                this.stride = layout.stride;
                this.currentCount = layout.count;
                this.attributes = layout.attributes;
                break;

            default:
                throw new Error('StreamingSource unknown data type passed in')

        }

    }

    public getHead() {

        return this.head;

    }

    public getCount() {

        return this.currentCount;

    }

    public getMaxCount() {

        return this.maxCount;

    }

    public subscribe(callback: (point: DataPoint) => void): void {

        this.listeners.add(callback)

    }

    public unsubscribe(callback: (point: DataPoint) => void): void {

        this.listeners.delete(callback);

    }

    /**
     * So when streaming data arrives
     * sensor → emit → series → redraw chart
     * @param point 
     */
    public emit(point: DataPoint): void {

        const base = this.head * this.stride;

        const xAttr = this.attributes.find(a => a.name === 'x')!;
        const yAttr = this.attributes.find(a => a.name === 'y')!;

        // TODO: make sure to add other attributes as well
        this.buffer[base + xAttr.offset] = point.x;
        this.buffer[base + yAttr.offset] = point.y;

        // advance ring buffer head
        this.head = (this.head + 1) % this.maxCount;
        if (this.currentCount < this.maxCount) this.currentCount++;

        // notify all listeners
        this.listeners.forEach(listener => listener(point))

    }

    /**
     * Read all data in order (oldest -> newest)
     * @returns 
     */
    public getData(): DataPoint[] {


        const points: DataPoint[] = [];

        if (this.currentCount === 0) {

            return points;

        }

        const xAttr = this.attributes.find(a => a.name === 'x');
        const yAttr = this.attributes.find(a => a.name === 'y');

        if (!xAttr || !yAttr) {

            throw new Error("StreamingSource: getData() - Missing x or y attributes");

        }

        // find oldest data
        const start = (this.head - this.currentCount + this.maxCount) % this.maxCount;

        for (let i = 0; i < this.currentCount; i++) {

            // wrap around buffer
            const idx = (start + i) % this.maxCount;
            const base = idx * this.stride;

            points.push({
                x: this.buffer[base + xAttr.offset],
                y: this.buffer[base + yAttr.offset]
            });
        }

        return points;
    }
}
