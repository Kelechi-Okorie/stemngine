import { Sphere } from '../math/Sphere';
import { Ray } from '../math/Ray';
import { Matrix4 } from '../math/Matrix4';
import { Node3D } from '../core/Node3D';
import { Vector3 } from '../math/Vector3';
import { LineBasicMaterial } from '../materials/LineBasicMaterial';
import { BufferGeometry } from '../core/BufferGeometry';
import { Float32BufferAttribute } from '../core/BufferAttribute';
import { warn } from '../utils';
import { Material, Raycaster } from '../engine';
import { RaycasterIntersection } from '../core/Raycaster';
import { Mesh } from '../engine';

const _vStart = /*@__PURE__*/ new Vector3();
const _vEnd = /*@__PURE__*/ new Vector3();

const _inverseMatrix = /*@__PURE__*/ new Matrix4();
const _ray = /*@__PURE__*/ new Ray();
const _sphere = /*@__PURE__*/ new Sphere();

const _intersectPointOnRay = /*@__PURE__*/ new Vector3();
const _intersectPointOnSegment = /*@__PURE__*/ new Vector3();

/**
 * A continuous line. The line are rendered by connecting consecutive
 * vertices with straight lines.
 *
 * ```js
 * const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
 *
 * const points = [];
 * points.push( new THREE.Vector3( - 10, 0, 0 ) );
 * points.push( new THREE.Vector3( 0, 10, 0 ) );
 * points.push( new THREE.Vector3( 10, 0, 0 ) );
 *
 * const geometry = new THREE.BufferGeometry().setFromPoints( points );
 *
 * const line = new THREE.Line( geometry, material );
 * scene.add( line );
 * ```
 *
 * @augments Object3D
 */
class Line extends Node3D {

    /**
     * This flag can be used for type testing.
     *
     */
    public readonly isLine = true;

    public type = 'Line';
    public geometry: BufferGeometry;
    public material: Material | Array<Material>

    /**
     * A dictionary representing the morph targets in the geometry. The key is the
     * morph targets name, the value its attribute index. This member is `undefined`
     * by default and only set when morph targets are detected in the geometry.
     *
     * @type {Object<string,number>|undefined}
     * @default undefined
     */
    public morphTargetDictionary: Record<string, number> | undefined = undefined;

    /**
     * An array of weights typically in the range `[0,1]` that specify how much of the morph
     * is applied. This member is `undefined` by default and only set when morph targets are
     * detected in the geometry.
     *
     * @type {Array<number>|undefined}
     * @default undefined
     */
    public morphTargetInfluences: Array<number> | undefined = undefined;

    /**
     * Constructs a new line.
     *
     * @param {BufferGeometry} [geometry] - The line geometry.
     * @param {Material|Array<Material>} [material] - The line material.
     */
    constructor(
        geometry = new BufferGeometry(),
        material: Material | Material[] = new LineBasicMaterial()
    ) {

        super();


        /**
         * The line geometry.
         *
         * @type {BufferGeometry}
         */
        this.geometry = geometry;

        /**
         * The line material.
         *
         * @type {Material|Array<Material>}
         * @default LineBasicMaterial
         */
        this.material = material;


        this.updateMorphTargets();

    }

    public copy(source: any, recursive: boolean): this {

        super.copy(source, recursive);

        this.material = Array.isArray(source.material) ? source.material.slice() : source.material;
        this.geometry = source.geometry;

        return this;

    }

    /**
     * Computes an array of distance values which are necessary for rendering dashed lines.
     * For each vertex in the geometry, the method calculates the cumulative length from the
     * current point to the very beginning of the line.
     *
     * @return {Line} A reference to this line.
     */
    public computeLineDistances(): this {

        const geometry = this.geometry;

        // we assume non-indexed geometry

        if (geometry.index === null) {

            const positionAttribute = geometry.attributes.position;
            const lineDistances = [0];

            for (let i = 1, l = positionAttribute.count; i < l; i++) {

                _vStart.fromBufferAttribute(positionAttribute, i - 1);
                _vEnd.fromBufferAttribute(positionAttribute, i);

                lineDistances[i] = lineDistances[i - 1];
                lineDistances[i] += _vStart.distanceTo(_vEnd);

            }

            geometry.setAttribute('lineDistance', new Float32BufferAttribute(lineDistances, 1));

        } else {

            warn('Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.');

        }

        return this;

    }

    /**
     * Computes intersection points between a casted ray and this line.
     *
     * @param {Raycaster} raycaster - The raycaster.
     * @param {Array<Object>} intersects - The target array that holds the intersection points.
     */
    public raycast(raycaster: Raycaster, intersects: RaycasterIntersection[]) {

        const geometry = this.geometry;
        const matrixWorld = this.matrixWorld;
        const threshold = raycaster.params.Line.threshold;
        const drawRange = geometry.drawRange;

        // Checking boundingSphere distance to ray

        if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

        _sphere.copy(geometry.boundingSphere!);
        _sphere.applyMatrix4(matrixWorld);
        _sphere.radius += threshold;

        if (raycaster.ray.intersectsSphere(_sphere) === false) return;

        //

        _inverseMatrix.copy(matrixWorld).invert();
        _ray.copy(raycaster.ray).applyMatrix4(_inverseMatrix);

        const localThreshold = threshold / ((this.scale.x + this.scale.y + this.scale.z) / 3);
        const localThresholdSq = localThreshold * localThreshold;

        const step = 'isLineSegments' in this ? 2 : 1;

        const index = geometry.index;
        const attributes = geometry.attributes;
        const positionAttribute = attributes.position;

        if (index !== null) {

            const start = Math.max(0, drawRange.start);
            const end = Math.min(index.count, (drawRange.start + drawRange.count));

            for (let i = start, l = end - 1; i < l; i += step) {

                const a = index.getX(i);
                const b = index.getX(i + 1);

                const intersect = checkIntersection(this, raycaster, _ray, localThresholdSq, a, b, i);

                if (intersect) {

                    intersects.push(intersect);

                }

            }

            if ('isLineLoop' in this) {

                const a = index.getX(end - 1);
                const b = index.getX(start);

                const intersect = checkIntersection(this, raycaster, _ray, localThresholdSq, a, b, end - 1);

                if (intersect) {

                    intersects.push(intersect);

                }

            }

        } else {

            const start = Math.max(0, drawRange.start);
            const end = Math.min(positionAttribute.count, (drawRange.start + drawRange.count));

            for (let i = start, l = end - 1; i < l; i += step) {

                const intersect = checkIntersection(this, raycaster, _ray, localThresholdSq, i, i + 1, i);

                if (intersect) {

                    intersects.push(intersect);

                }

            }

            if ('isLineLoop' in this) {

                const intersect = checkIntersection(this, raycaster, _ray, localThresholdSq, end - 1, start, end - 1);

                if (intersect) {

                    intersects.push(intersect);

                }

            }

        }

    }

    /**
     * Sets the values of {@link Line#morphTargetDictionary} and {@link Line#morphTargetInfluences}
     * to make sure existing morph targets can influence this 3D object.
     */
    updateMorphTargets() {

        const geometry = this.geometry;

        const morphAttributes = geometry.morphAttributes;
        const keys = Object.keys(morphAttributes);

        if (keys.length > 0) {

            const morphAttribute = morphAttributes[keys[0]];

            if (morphAttribute !== undefined) {

                this.morphTargetInfluences = [];
                this.morphTargetDictionary = {};

                for (let m = 0, ml = morphAttribute.length; m < ml; m++) {

                    const name = morphAttribute[m].name || String(m);

                    this.morphTargetInfluences.push(0);
                    this.morphTargetDictionary[name] = m;

                }

            }

        }

    }

}


function checkIntersection(
    object: any,
    raycaster: Raycaster,
    ray: Ray,
    thresholdSq: number,
    a: number,
    b: number,
    i: number
): RaycasterIntersection | undefined {

    const positionAttribute = object.geometry.attributes.position;

    _vStart.fromBufferAttribute(positionAttribute, a);
    _vEnd.fromBufferAttribute(positionAttribute, b);

    const distSq = ray.distanceSqToSegment(_vStart, _vEnd, _intersectPointOnRay, _intersectPointOnSegment);

    if (distSq > thresholdSq) return;

    _intersectPointOnRay.applyMatrix4(object.matrixWorld); // Move back to world space for distance calculation

    const distance = raycaster.ray.origin.distanceTo(_intersectPointOnRay);

    if (distance < raycaster.near || distance > raycaster.far) return;

    return {

        distance: distance,
        // What do we want? intersection point on the ray or on the segment??
        // point: raycaster.ray.at( distance ),
        point: _intersectPointOnSegment.clone().applyMatrix4(object.matrixWorld),
        // faceIndex: i,
        face: undefined,
        faceIndex: undefined,
        barycoord: undefined,
        object: object

    };

}

export { Line };
