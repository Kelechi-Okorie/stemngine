import { LineSegments } from '../objects/LineSegments.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Color } from '../math/Color.js';

/**
 * The helper is an object to define grids. Grids are two-dimensional
 * arrays of lines.
 *
 * ```js
 * const size = 10;
 * const divisions = 10;
 *
 * const gridHelper = new GridHelper( size, divisions );
 * scene.add( gridHelper );
 * ```
 *
 * @augments LineSegments
 */
class GridHelper extends LineSegments {

    /**
     * Constructs a new grid helper.
     *
     * @param {number} [size=10] - The size of the grid.
     * @param {number} [divisions=10] - The number of divisions across the grid.
     * @param {number|Color|string} [color1=0x444444] - The color of the center line.
     * @param {number|Color|string} [color2=0x888888] - The color of the lines of the grid.
     */
    constructor(size = 10, divisions = 10, col1 = 0x444444, col2 = 0x888888) {

        const color1 = new Color(col1);
        const color2 = new Color(col2);

        const center = divisions / 2;
        const step = size / divisions;
        const halfSize = size / 2;

        const vertices: number[] = [];
        const colors: number[] = [];

        for (let i = 0, j = 0, k = - halfSize; i <= divisions; i++, k += step) {

            vertices.push(- halfSize, 0, k, halfSize, 0, k);
            vertices.push(k, 0, - halfSize, k, 0, halfSize);

            const color = i === center ? color1 : color2;

            color.toArray(colors, j); j += 3;
            color.toArray(colors, j); j += 3;
            color.toArray(colors, j); j += 3;
            color.toArray(colors, j); j += 3;

        }

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        // geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

        const material = new LineBasicMaterial({ vertexColors: false, toneMapped: false, color: 0xeeeeee });

        super(geometry, material);

        this.type = 'GridHelper';

    }

    /**
     * Frees the GPU-related resources allocated by this instance. Call this
     * method whenever this instance is no longer used in your app.
     */
    dispose() {

        this.geometry.dispose();

        const material = this.material;

        if (Array.isArray(material)) {

            material.forEach((m) => m.dispose());

        } else {

            material.dispose();

        }

    }

}

export { GridHelper };
