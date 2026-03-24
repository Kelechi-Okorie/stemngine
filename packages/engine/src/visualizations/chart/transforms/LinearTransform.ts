import { Transform } from "../Interfaces";

export class LinearScaleTransform implements Transform {

    private xMin: number;
    private xMax: number;
    private yMin: number;
    private yMax: number;

    constructor(
        xMin: number,
        xMax: number,
        yMin: number,
        yMax: number
    ) { 
        
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;

    }

    map(x: number, y: number) {

        const nx = (x - this.xMin) / (this.xMax - this.xMin)
        const ny = (y - this.yMin) / (this.yMax - this.yMin)

        return { x: nx, y: ny }

    }

}
