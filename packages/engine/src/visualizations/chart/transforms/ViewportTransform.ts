import { Transform, Viewport } from "../Interfaces";

export class ViewportTransform implements Transform {

    private rect: Viewport;

    constructor(viewport: Viewport) {

        this.rect = viewport;

    }

    map(x: number, y: number) {

        return {

            x: this.rect.x + x * this.rect.width,

            // notice y flip
            y: this.rect.y + (1 - y) * this.rect.height

        }

    }

}
