import { AnyTypedArray } from "../constants";

/**
 * A ring buffer (aka circular buffer) is a fixed-size buffer that
 * treats the memory as circular
 * 
 * @remarks
 * when the buffer is full, new writes overwrite the oldest data automatically
 */
export class RingBuffer<T> {

    private buffer: (T | undefined)[];  // TODO: check if the undefined makes sense

    /**
     * where the next element will be written
     */
    private head: number = 0;

    /**
     * where the oldest element is
     */
    private tail: number = 0;

    /**
     * number of elements currently stored
     */
    private _size: number = 0;

    /**
     * max size
     */
    public capacity: number;

    constructor(capacity: number) {

        this.buffer = new Array(capacity);
        this.capacity = capacity;

    }

    /**
     * insert newest element
     * @param item 
     */
    public push(item: T): void {

        this.buffer[this.head] = item;
        this.head = (this.head + 1) % this.capacity;

        if (this._size < this.capacity) {

            this._size++;

        } else {

            // overwrite: move tail forward
            this.tail = (this.tail + 1) % this.capacity;

        }

    }
    
    public pop(): T | undefined {

        if ( this._size === 0 ) return undefined;

        this.head = (this.head - 1 + this.capacity) % this.capacity;
        const item = this.buffer[this.head];
        this.buffer[this.head] = undefined;
        this._size--;
        return item;

    }

    /**
     * remove oldest element
     */
    public shift(): T |  undefined {

        if (this._size === 0) return undefined;

        const item = this.buffer[this.tail];
        this.buffer[this.tail] = undefined;
        this.tail = (this.tail + 1) % this.capacity;
        this._size--;
        return item;

    }

    public get(i: number): T | undefined {

        if (i < 0 || i >= this._size) return undefined;

        return this.buffer[(this.tail + i) % this.capacity];

    }

    public toArray(): T[] {

        const arr: T[] = [];

        for (let i = 0; i < this._size; i++) {

            arr.push(this.get(i)!);
        }

        return arr;
    }

    public get length() {

        return this._size;

    }

}