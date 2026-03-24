import { Transform } from "../Interfaces"

export class LogScaleTransform implements Transform {
    map(x: number, y: number) {
        return {
            x: Math.log10(x),
            y: Math.log10(y)
        }
    }
}