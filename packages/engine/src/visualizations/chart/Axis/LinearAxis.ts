import { Axis } from "../Interfaces";

export interface ConfigOptions {
    min: number;
    max: number;
    majorTickCount: number;
    minorTickCount: number;
    label: string;

}

/**
 * Implements linear scale
 */
export class LinearAxis implements Axis {

    public min = 0;
    public max = 1;
    public majorTickCount: number;
    public minorTickCount: number;
    public label: string;

    constructor(config: ConfigOptions) {

        const { min, max, majorTickCount, minorTickCount, label} = config;

        this.min = min || 0;
        this.max = max || 1;
        this.majorTickCount = majorTickCount;
        this.minorTickCount = minorTickCount;
        this.label = label;
    }

    // TODO: later replace this with nice ticks
    public getTicks(): {major: number[], minor: number[]} {

        const major: number[] = [];

        const step = (this.max - this.min) / (this.majorTickCount - 1);

        for (let i = 0, count = this.majorTickCount; i < count; i++) {

            major.push(this.min + i * step);

        }

        const minor = this.genereateMinorTicks(major, this.minorTickCount);

        return {major, minor};
    }

    public genereateMinorTicks(major: number[], n: number): number[] {

        const minor: number[] = [];

        for (let i = 0, nMajor = major.length; i < nMajor; i++) {

            const a = major[i];
            const b = major[i + 1];

            const step = (b - a) / n;

            // do not include the major tick again
            // that is why k = 1 -> n-1
            for (let k = 1; k < n; k++) {

                minor.push(a + k * step);

            }

        }

        return minor;

    }

}
