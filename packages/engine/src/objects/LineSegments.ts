import { Line } from './Line';
import { Vector3 } from '../math/Vector3';
import { Float32BufferAttribute } from '../core/BufferAttribute';
import { warn } from '../utils';
import { BufferGeometry, Material } from '../engine';

const _start = /*@__PURE__*/ new Vector3();
const _end = /*@__PURE__*/ new Vector3();

/**
 * A series of lines drawn between pairs of vertices.
 *
 * @augments Line
 */
class LineSegments extends Line {

    /**
     * This flag can be used for type testing.
     *
     */
    public readonly isLineSegments = true;

    public type = 'LineSegments';

    /**
     * Constructs a new line segments.
     *
     * @param {BufferGeometry} [geometry] - The line geometry.
     * @param {Material|Array<Material>} [material] - The line material.
     */
    constructor(geometry: BufferGeometry, material: Material | Material[]) {

        super(geometry, material);

    }

    public computeLineDistances() {

        const geometry = this.geometry;

        // we assume non-indexed geometry

        if (geometry.index === null) {

            const positionAttribute = geometry.attributes.position;
            const lineDistances: any = [];  // TODO: type better

            for (let i = 0, l = positionAttribute.count; i < l; i += 2) {

                _start.fromBufferAttribute(positionAttribute, i);
                _end.fromBufferAttribute(positionAttribute, i + 1);

                lineDistances[i] = (i === 0) ? 0 : lineDistances[i - 1];
                lineDistances[i + 1] = lineDistances[i] + _start.distanceTo(_end);

            }

            geometry.setAttribute('lineDistance', new Float32BufferAttribute(lineDistances, 1));

        } else {

            warn('LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.');

        }

        return this;

    }

}

export { LineSegments };
