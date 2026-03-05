
/**
 * A Double Ended Queue.
 * 
 * Supports fast operations on both ends
 */
export class Deque<T> {

    private data: Record<number, T> = {};

    private head = 0;
    private tail = 0;

    // O(1)
    public pushBack(value: T) {

        this.data[this.tail++] = value;

    }

    // O(1)
    public pushFront(value: T) {

        this.data[--this.head] = value;

    }

    // O(1)
    public popFront(): T | undefined {
        
        if (this.head === this.tail) return undefined;

        const value = this.data[this.head];
        delete this.data[this.head++];

        if (this.head > 10000) {

            this.rebase();

        }

        return value;

    }

    // O(1)
    public popBack(): T | undefined {

        if (this.head === this.tail) return undefined;

        const value = this.data[--this.tail];
        delete this.data[this.tail];

        return value;

    }

    // O(1)
    public isEmpty() {

        return this.head === this.tail;

    }

    // O(1)
    public length(): number {

        return this.tail - this.head;

    }

    // O(1)
    public clear() {

        this.data = {};

        this.head = 0;
        this.tail = 0;

    }

    /**
     * O(n)
     * Deque works by letting indices grow
     * 
     * Large indices can eventually cause:
     * - slow hash lookups
     * - large object key strings
     * - worse memory localilty
     * - potential numeric precision edge cases (very long runs)
     * so we occasionally compress indices back toward zero
     * this is called index rebasing
     */
    private rebase() {

        const newData: Record<number, T> = {};

        let i = 0;
        for (let idx = this.head; idx < this.tail; idx++) {

            newData[i++] = this.data[idx];

        }

        this.data = newData;
        this.tail = this.length();
        this.head = 0;

    }

}