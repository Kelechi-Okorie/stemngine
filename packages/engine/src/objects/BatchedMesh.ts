import { BufferAttribute } from '../core/BufferAttribute';
import { BufferGeometry } from '../core/BufferGeometry';
import { DataTexture } from '../textures/DataTexture';
import { FloatType, RedIntegerFormat, UnsignedIntType, RGBAFormat, AnyTypedArray } from '../constants';
import { Matrix4 } from '../math/Matrix4';
import { Mesh } from './Mesh';
import { ColorManagement } from '../math/ColorManagement';
import { Box3 } from '../math/Box3';
import { Sphere } from '../math/Sphere';
import { Frustum } from '../math/Frustum';
import { Vector3 } from '../math/Vector3';
import { Color } from '../math/Color';
import { FrustumArray } from '../math/FrustumArray';
import { InterleavedBufferAttribute, isInterleavedBufferAttribute } from '../core/InterleavedBufferAttribute';
import { Material } from '../materials/Material';
import { RenderItem } from '../renderers/webgl/WebGLRenderLists';
import { Raycaster, RaycasterIntersection } from '../core/Raycaster';
import { Camera } from '../cameras/Camera';
import { WebGLRenderer } from '../renderers/WebGLRenderer';
import { Scene } from '../scenes/Scene';
import { ArrayCamera } from '../cameras/ArrayCamera';

export interface DrawItem {
  start: number;
  count: number;
  z: number;
  index: number;
}

interface InstanceInfo {
  visible: boolean;
  active: boolean;
  geometryIndex: number;
}

interface GeometryInfo {
  // geometry information
  vertexStart: number;
  vertexCount: number;
  reservedVertexCount: number;

  indexStart: number;
  indexCount: number;
  reservedIndexCount: number;

  // draw range information
  start: number;
  count: number;

  // state
  boundingBox: Box3 | null;
  boundingSphere: Sphere | null;
  active: boolean;
};

interface BatchedIntersection extends RaycasterIntersection {
  batchId: number;
  instanceId: number;
  drawId: number;
}

export interface BatchedRaycasterIntersection extends RaycasterIntersection {
  batchId: number;
}

function ascIdSort(a: number, b: number) {

  return a - b;

}

function sortOpaque(a: DrawItem, b: DrawItem) {

  return a.z - b.z;

}

function sortTransparent(a: DrawItem, b: DrawItem) {

  return b.z - a.z;

}

class MultiDrawRenderList {

  public index = 0;
  public pool: DrawItem[] = [];
  public list: DrawItem[] = [];


  constructor() { }

  public push(start: number, count: number, z: number, index: number): void {

    const pool = this.pool;
    const list = this.list;

    if (this.index >= pool.length) {

      pool.push({

        start: - 1,
        count: - 1,
        z: - 1,
        index: - 1,

      });

    }

    const item = pool[this.index];
    list.push(item);
    this.index++;

    item.start = start;
    item.count = count;
    item.z = z;
    item.index = index;

  }

  reset(): void {

    this.list.length = 0;
    this.index = 0;

  }

}

const _matrix = /*@__PURE__*/ new Matrix4();
const _whiteColor = /*@__PURE__*/ new Color(1, 1, 1);
const _frustum = /*@__PURE__*/ new Frustum();
const _frustumArray = /*@__PURE__*/ new FrustumArray();
const _box = /*@__PURE__*/ new Box3();
const _sphere = /*@__PURE__*/ new Sphere();
const _vector = /*@__PURE__*/ new Vector3();
const _forward = /*@__PURE__*/ new Vector3();
const _temp = /*@__PURE__*/ new Vector3();
const _renderList = /*@__PURE__*/ new MultiDrawRenderList();
const _mesh = /*@__PURE__*/ new Mesh();
const _batchIntersects: BatchedRaycasterIntersection[] = [];

// copies data from attribute "src" into "target" starting at "targetOffset"
function copyAttributeData(
  src: BufferAttribute | InterleavedBufferAttribute,
  target: BufferAttribute | InterleavedBufferAttribute,
  targetOffset = 0
) {

  const itemSize = target.itemSize;
  if (isInterleavedBufferAttribute(src) || src.array.constructor !== target.array.constructor) {

    // use the component getters and setters if the array data cannot
    // be copied directly
    const vertexCount = src.count;
    for (let i = 0; i < vertexCount; i++) {

      for (let c = 0; c < itemSize; c++) {

        target.setComponent(i + targetOffset, c, src.getComponent(i, c));

      }

    }

  } else {

    // faster copy approach using typed array set function
    target.array.set(src.array, targetOffset * itemSize);

  }

  target.needsUpdate = true;

}

// TODO: type well
// safely copies array contents to a potentially smaller array
function copyArrayContents<T extends AnyTypedArray>(
  src: any,
  target: any
) {

  if (src.constructor !== target.constructor) {

    // if arrays are of a different type (eg due to index size increasing) then data must be per-element copied
    const len = Math.min(src.length, target.length);
    for (let i = 0; i < len; i++) {

      target[i] = src[i];

    }

  } else {

    // if the arrays use the same data layout we can use a fast block copy
    const len = Math.min(src.length, target.length);
    target.set(new src.constructor(src.buffer, 0, len));

  }

}

/**
 * A special version of a mesh with multi draw batch rendering support. Use
 * this class if you have to render a large number of objects with the same
 * material but with different geometries or world transformations. The usage of
 * `BatchedMesh` will help you to reduce the number of draw calls and thus improve the overall
 * rendering performance in your application.
 *
 * ```js
 * const box = new THREE.BoxGeometry( 1, 1, 1 );
 * const sphere = new THREE.SphereGeometry( 1, 12, 12 );
 * const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
 *
 * // initialize and add geometries into the batched mesh
 * const batchedMesh = new BatchedMesh( 10, 5000, 10000, material );
 * const boxGeometryId = batchedMesh.addGeometry( box );
 * const sphereGeometryId = batchedMesh.addGeometry( sphere );
 *
 * // create instances of those geometries
 * const boxInstancedId1 = batchedMesh.addInstance( boxGeometryId );
 * const boxInstancedId2 = batchedMesh.addInstance( boxGeometryId );
 *
 * const sphereInstancedId1 = batchedMesh.addInstance( sphereGeometryId );
 * const sphereInstancedId2 = batchedMesh.addInstance( sphereGeometryId );
 *
 * // position the geometries
 * batchedMesh.setMatrixAt( boxInstancedId1, boxMatrix1 );
 * batchedMesh.setMatrixAt( boxInstancedId2, boxMatrix2 );
 *
 * batchedMesh.setMatrixAt( sphereInstancedId1, sphereMatrix1 );
 * batchedMesh.setMatrixAt( sphereInstancedId2, sphereMatrix2 );
 *
 * scene.add( batchedMesh );
 * ```
 *
 * @augments Mesh
 */
export class BatchedMesh extends Mesh {

  /**
 * This flag can be used for type testing.
 *
 * @readonly
 * @default true
 */
  public readonly isBatchedMesh = true;

  /**
   * When set ot `true`, the individual objects of a batch are frustum culled.
   *
   * @default true
   */
  public perObjectFrustumCulled = true;

  /**
   * When set to `true`, the individual objects of a batch are sorted to improve overdraw-related artifacts.
   * If the material is marked as "transparent" objects are rendered back to front and if not then they are
   * rendered front to back.
   *
   * @default true
   */
  public sortObjects = true;

  /**
   * The bounding box of the batched mesh. Can be computed via {@link BatchedMesh#computeBoundingBox}.
   *
   * @default null
   */
  public boundingBox: Box3 | null = null;

  /**
   * The bounding sphere of the batched mesh. Can be computed via {@link BatchedMesh#computeBoundingSphere}.
   *
   * @default null
   */
  public boundingSphere: Sphere | null = null;

  /**
   * Takes a sort a function that is run before render. The function takes a list of instances to
   * sort and a camera. The objects in the list include a "z" field to perform a depth-ordered
   * sort with.
   *
   * @type {?Function}
   * @default null
   */
  public customSort: ((instances: { z: number }[], camera: Camera) => void) | null = null;

  // stores visible, active, and geometry id per instance and reserved buffer ranges for geometries
  private _instanceInfo: InstanceInfo[] = [];
  private _geometryInfo: GeometryInfo[] = [];

  // instance, geometry ids that have been set as inactive, and are available to be overwritten
  private _availableInstanceIds: number[] = [];
  private _availableGeometryIds: number[] = [];

  // used to track where the next point is that geometry should be inserted
  private _nextIndexStart = 0;
  private _nextVertexStart = 0;
  private _geometryCount = 0;

  // flags
  private _visibilityChanged = true;
  private _geometryInitialized = false;

  // cached user options
  private _maxInstanceCount: number;
  private _maxVertexCount: number;
  private _maxIndexCount: number;

  // buffers for multi draw
  private _multiDrawCounts: Int32Array;
  private _multiDrawStarts: Int32Array;
  private _multiDrawCount = 0;
  private _multiDrawInstances = null;

  // Local matrix per geometry by using data texture
  private _matricesTexture: DataTexture | null = null;
  private _indirectTexture: DataTexture | null = null;
  private _colorsTexture: DataTexture | null = null;

  private cm = ColorManagement.instance;



  /**
   * Constructs a new batched mesh.
   *
   * @param {number} maxInstanceCount - The maximum number of individual instances planned to be added and rendered.
   * @param {number} maxVertexCount - The maximum number of vertices to be used by all unique geometries.
   * @param {number} [maxIndexCount=maxVertexCount*2] - The maximum number of indices to be used by all unique geometries
   * @param {Material|Array<Material>} [material] - The mesh material.
   */
  constructor(
    maxInstanceCount: number,
    maxVertexCount: number,
    maxIndexCount = maxVertexCount * 2,
    material: Material | Material[]
  ) {

    super(new BufferGeometry(), material);

    // cached user options
    this._maxInstanceCount = maxInstanceCount;
    this._maxVertexCount = maxVertexCount;
    this._maxIndexCount = maxIndexCount;

    // buffers for multi draw
    this._multiDrawCounts = new Int32Array(maxInstanceCount);
    this._multiDrawStarts = new Int32Array(maxInstanceCount);


    this._initMatricesTexture();
    this._initIndirectTexture();

  }

  /**
   * The maximum number of individual instances that can be stored in the batch.
   *
   * @type {number}
   * @readonly
   */
  public get maxInstanceCount(): number {

    return this._maxInstanceCount;

  }

  /**
   * The instance count.
   *
   * @type {number}
   * @readonly
   */
  public get instanceCount(): number {

    return this._instanceInfo.length - this._availableInstanceIds.length;

  }

  /**
   * The number of unused vertices.
   *
   * @type {number}
   * @readonly
   */
  public get unusedVertexCount(): number {

    return this._maxVertexCount - this._nextVertexStart;

  }

  /**
   * The number of unused indices.
   *
   * @type {number}
   * @readonly
   */
  public get unusedIndexCount(): number {

    return this._maxIndexCount - this._nextIndexStart;

  }

  private _initMatricesTexture(): void {

    // layout (1 matrix = 4 pixels)
    //      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
    //  with  8x8  pixel texture max   16 matrices * 4 pixels =  (8 * 8)
    //       16x16 pixel texture max   64 matrices * 4 pixels = (16 * 16)
    //       32x32 pixel texture max  256 matrices * 4 pixels = (32 * 32)
    //       64x64 pixel texture max 1024 matrices * 4 pixels = (64 * 64)

    let size = Math.sqrt(this._maxInstanceCount * 4); // 4 pixels needed for 1 matrix
    size = Math.ceil(size / 4) * 4;
    size = Math.max(size, 4);

    const matricesArray = new Float32Array(size * size * 4); // 4 floats per RGBA pixel
    const matricesTexture = new DataTexture(matricesArray, size, size, RGBAFormat, FloatType);

    this._matricesTexture = matricesTexture;

  }

  private _initIndirectTexture(): void {

    let size = Math.sqrt(this._maxInstanceCount);
    size = Math.ceil(size);

    const indirectArray = new Uint32Array(size * size);
    const indirectTexture = new DataTexture(indirectArray, size, size, RedIntegerFormat, UnsignedIntType);

    this._indirectTexture = indirectTexture;

  }

  private _initColorsTexture(): void {

    let size = Math.sqrt(this._maxInstanceCount);
    size = Math.ceil(size);

    // 4 floats per RGBA pixel initialized to white
    const colorsArray = new Float32Array(size * size * 4).fill(1);
    const colorsTexture = new DataTexture(colorsArray, size, size, RGBAFormat, FloatType);
    colorsTexture.colorSpace = this.cm.workingColorSpace;

    this._colorsTexture = colorsTexture;

  }

  public _initializeGeometry(reference: any): void {

    const geometry = this.geometry;
    const maxVertexCount = this._maxVertexCount;
    const maxIndexCount = this._maxIndexCount;
    if (this._geometryInitialized === false) {

      for (const attributeName in reference.attributes) {

        const srcAttribute = reference.getAttribute(attributeName);
        const { array, itemSize, normalized } = srcAttribute;

        const dstArray = new array.constructor(maxVertexCount * itemSize);
        const dstAttribute = new BufferAttribute(dstArray, itemSize, normalized);

        geometry.setAttribute(attributeName, dstAttribute);

      }

      if (reference.getIndex() !== null) {

        // Reserve last u16 index for primitive restart.
        const indexArray = maxVertexCount > 65535
          ? new Uint32Array(maxIndexCount)
          : new Uint16Array(maxIndexCount);

        geometry.setIndex(new BufferAttribute(indexArray, 1));

      }

      this._geometryInitialized = true;

    }

  }

  // Make sure the geometry is compatible with the existing combined geometry attributes
  private _validateGeometry(geometry: BufferGeometry): void {

    // check to ensure the geometries are using consistent attributes and indices
    const batchGeometry = this.geometry;
    if (Boolean(geometry.getIndex()) !== Boolean(batchGeometry.getIndex())) {

      throw new Error('BatchedMesh: All geometries must consistently have "index".');

    }

    for (const attributeName in batchGeometry.attributes) {

      if (!geometry.hasAttribute(attributeName)) {

        throw new Error(`BatchedMesh: Added geometry missing "${attributeName}". All geometries must have consistent attributes.`);

      }

      const srcAttribute = geometry.getAttribute(attributeName);
      const dstAttribute = batchGeometry.getAttribute(attributeName);

      if (srcAttribute === undefined || dstAttribute === undefined) {
        throw new Error('srcAttribute and/or dstAttribute is undefined');
      }

      if (srcAttribute.itemSize !== dstAttribute.itemSize || srcAttribute.normalized !== dstAttribute.normalized) {

        throw new Error('BatchedMesh: All attributes must have a consistent itemSize and normalized value.');

      }

    }

  }

  /**
   * Validates the instance defined by the given ID.
   *
   * @param {number} instanceId - The instance to validate.
   */
  private validateInstanceId(instanceId: number): void {

    const instanceInfo = this._instanceInfo;
    if (instanceId < 0 || instanceId >= instanceInfo.length || instanceInfo[instanceId].active === false) {

      throw new Error(`BatchedMesh: Invalid instanceId ${instanceId}. Instance is either out of range or has been deleted.`);

    }

  }

  /**
   * Validates the geometry defined by the given ID.
   *
   * @param {number} geometryId - The geometry to validate.
   */
  private validateGeometryId(geometryId: number): void {

    const geometryInfoList = this._geometryInfo;
    if (geometryId < 0 || geometryId >= geometryInfoList.length || geometryInfoList[geometryId].active === false) {

      throw new Error(`BatchedMesh: Invalid geometryId ${geometryId}. Geometry is either out of range or has been deleted.`);

    }

  }

  /**
   * Takes a sort a function that is run before render. The function takes a list of instances to
   * sort and a camera. The objects in the list include a "z" field to perform a depth-ordered sort with.
   *
   * @param {Function} func - The custom sort function.
   * @return {BatchedMesh} A reference to this batched mesh.
   */
  public setCustomSort(func: any) {

    this.customSort = func;
    return this;

  }

  /**
   * Computes the bounding box, updating {@link BatchedMesh#boundingBox}.
   * Bounding boxes aren't computed by default. They need to be explicitly computed,
   * otherwise they are `null`.
   */
  public computeBoundingBox(): void {

    if (this.boundingBox === null) {

      this.boundingBox = new Box3();

    }

    const boundingBox = this.boundingBox;
    const instanceInfo = this._instanceInfo;

    boundingBox.makeEmpty();
    for (let i = 0, l = instanceInfo.length; i < l; i++) {

      if (instanceInfo[i].active === false) continue;

      const geometryId = instanceInfo[i].geometryIndex;
      this.getMatrixAt(i, _matrix);

      const box = this.getBoundingBoxAt(geometryId, _box);

      if (box !== null) {
        box.applyMatrix4(_matrix);
        boundingBox.union(_box);
      }

    }

  }

  /**
   * Computes the bounding sphere, updating {@link BatchedMesh#boundingSphere}.
   * Bounding spheres aren't computed by default. They need to be explicitly computed,
   * otherwise they are `null`.
   */
  public computeBoundingSphere(): void {

    if (this.boundingSphere === null) {

      this.boundingSphere = new Sphere();

    }

    const boundingSphere = this.boundingSphere;
    const instanceInfo = this._instanceInfo;

    boundingSphere.makeEmpty();
    for (let i = 0, l = instanceInfo.length; i < l; i++) {

      if (instanceInfo[i].active === false) continue;

      const geometryId = instanceInfo[i].geometryIndex;
      this.getMatrixAt(i, _matrix);

      const sphere = this.getBoundingSphereAt(geometryId, _sphere);

      if (sphere !== null) {
        sphere.applyMatrix4(_matrix);
        boundingSphere.union(_sphere);
      }

    }

  }

  /**
   * Adds a new instance to the batch using the geometry of the given ID and returns
   * a new id referring to the new instance to be used by other functions.
   *
   * @param {number} geometryId - The ID of a previously added geometry via {@link BatchedMesh#addGeometry}.
   * @return {number} The instance ID.
   */
  public addInstance(geometryId: number): number {

    const atCapacity = this._instanceInfo.length >= this.maxInstanceCount;

    // ensure we're not over geometry
    if (atCapacity && this._availableInstanceIds.length === 0) {

      throw new Error('BatchedMesh: Maximum item count reached.');

    }

    const instanceInfo = {
      visible: true,
      active: true,
      geometryIndex: geometryId,
    };

    let drawId = null;

    // Prioritize using previously freed instance ids
    if (this._availableInstanceIds.length > 0) {

      this._availableInstanceIds.sort(ascIdSort);

      drawId = this._availableInstanceIds.shift();

      if (drawId === undefined) {
        throw new Error('Invariant violation: availableInstanceIds was non-empty.');
      }

      this._instanceInfo[drawId] = instanceInfo;

    } else {

      drawId = this._instanceInfo.length;
      this._instanceInfo.push(instanceInfo);

    }

    const matricesTexture = this._matricesTexture;

    if (matricesTexture === null) {
      throw new Error('BatchedMesh: matricesTexture has not been initialized.');
    }

    _matrix.identity().toArray(matricesTexture.image.data, drawId * 16);
    matricesTexture.needsUpdate = true;

    const colorsTexture = this._colorsTexture;
    if (colorsTexture) {

      _whiteColor.toArray(colorsTexture.image.data, drawId * 4);
      colorsTexture.needsUpdate = true;

    }

    this._visibilityChanged = true;
    return drawId;

  }

  /**
   * Adds the given geometry to the batch and returns the associated
   * geometry id referring to it to be used in other functions.
   *
   * @param {BufferGeometry} geometry - The geometry to add.
   * @param {number} [reservedVertexCount=-1] - Optional parameter specifying the amount of
   * vertex buffer space to reserve for the added geometry. This is necessary if it is planned
   * to set a new geometry at this index at a later time that is larger than the original geometry.
   * Defaults to the length of the given geometry vertex buffer.
   * @param {number} [reservedIndexCount=-1] - Optional parameter specifying the amount of index
   * buffer space to reserve for the added geometry. This is necessary if it is planned to set a
   * new geometry at this index at a later time that is larger than the original geometry. Defaults to
   * the length of the given geometry index buffer.
   * @return {number} The geometry ID.
   */
  public addGeometry(
    geometry: BufferGeometry,
    reservedVertexCount = - 1,
    reservedIndexCount = - 1
  ): number {

    this._initializeGeometry(geometry);

    this._validateGeometry(geometry);

    const geometryInfo = {
      // geometry information
      vertexStart: - 1,
      vertexCount: - 1,
      reservedVertexCount: - 1,

      indexStart: - 1,
      indexCount: - 1,
      reservedIndexCount: - 1,

      // draw range information
      start: - 1,
      count: - 1,

      // state
      boundingBox: null,
      boundingSphere: null,
      active: true,
    };

    const geometryInfoList = this._geometryInfo;
    geometryInfo.vertexStart = this._nextVertexStart;

    const position = geometry.getAttribute('position');
    if (!position) {
      throw new Error('BatchedMesh: Geometry must have a position attribute.');
    }

    geometryInfo.reservedVertexCount = reservedVertexCount === - 1 ? position.count : reservedVertexCount;

    const index = geometry.getIndex();
    const hasIndex = index !== null;
    if (hasIndex) {

      geometryInfo.indexStart = this._nextIndexStart;
      geometryInfo.reservedIndexCount = reservedIndexCount === - 1 ? index.count : reservedIndexCount;

    }

    if (
      geometryInfo.indexStart !== - 1 &&
      geometryInfo.indexStart + geometryInfo.reservedIndexCount > this._maxIndexCount ||
      geometryInfo.vertexStart + geometryInfo.reservedVertexCount > this._maxVertexCount
    ) {

      throw new Error('BatchedMesh: Reserved space request exceeds the maximum buffer size.');

    }

    // update id
    let geometryId;
    if (this._availableGeometryIds.length > 0) {

      this._availableGeometryIds.sort(ascIdSort);

      geometryId = this._availableGeometryIds.shift();

      if (geometryId === undefined) {
        throw new Error('Invariant violation: availableInstanceIds was non-empty.');
      }

      geometryInfoList[geometryId] = geometryInfo;


    } else {

      geometryId = this._geometryCount;
      this._geometryCount++;
      geometryInfoList.push(geometryInfo);

    }

    // update the geometry
    this.setGeometryAt(geometryId, geometry);

    // increment the next geometry position
    this._nextIndexStart = geometryInfo.indexStart + geometryInfo.reservedIndexCount;
    this._nextVertexStart = geometryInfo.vertexStart + geometryInfo.reservedVertexCount;

    return geometryId;

  }

  /**
   * Replaces the geometry at the given ID with the provided geometry. Throws an error if there
   * is not enough space reserved for geometry. Calling this will change all instances that are
   * rendering that geometry.
   *
   * @param {number} geometryId - The ID of the geometry that should be replaced with the given geometry.
   * @param {BufferGeometry} geometry - The new geometry.
   * @return {number} The geometry ID.
   */
  public setGeometryAt(geometryId: number, geometry: BufferGeometry): number {

    if (geometryId >= this._geometryCount) {

      throw new Error('BatchedMesh: Maximum geometry count reached.');

    }

    this._validateGeometry(geometry);

    const batchGeometry = this.geometry;
    const hasIndex = batchGeometry.getIndex() !== null;
    const dstIndex = batchGeometry.getIndex();
    const srcIndex = geometry.getIndex();

    if (srcIndex === null || dstIndex === null) {
      throw new Error('BatchedMesh: srcIndex or dstIndex cannot be null');
    }

    const geometryInfo = this._geometryInfo[geometryId];
    if (
      hasIndex &&
      srcIndex.count > geometryInfo.reservedIndexCount ||
      geometry.attributes.position.count > geometryInfo.reservedVertexCount
    ) {

      throw new Error('BatchedMesh: Reserved space not large enough for provided geometry.');

    }

    // copy geometry buffer data over
    const vertexStart = geometryInfo.vertexStart;
    const reservedVertexCount = geometryInfo.reservedVertexCount;

    const position = geometry.getAttribute('position');

    if (!position) {
      throw new Error('BatchedMesh: Geometry must have a position attribute.');
    }

    geometryInfo.vertexCount = position.count;

    for (const attributeName in batchGeometry.attributes) {

      // copy attribute data
      const srcAttribute = geometry.getAttribute(attributeName);
      const dstAttribute = batchGeometry.getAttribute(attributeName);

      if (!srcAttribute || !dstAttribute) {
        throw new Error(
          `BatchedMesh: Geometry is missing required attribute '${attributeName}'.`
        );
      }
      copyAttributeData(srcAttribute, dstAttribute, vertexStart);

      // fill the rest in with zeroes
      const itemSize = srcAttribute.itemSize;
      for (let i = srcAttribute.count, l = reservedVertexCount; i < l; i++) {

        const index = vertexStart + i;
        for (let c = 0; c < itemSize; c++) {

          dstAttribute.setComponent(index, c, 0);

        }

      }

      dstAttribute.needsUpdate = true;

      if (srcAttribute instanceof InterleavedBufferAttribute ||
        dstAttribute instanceof InterleavedBufferAttribute) {

        throw new Error(
          'BatchedMesh: InterleavedBufferAttribute is not supported.'
        );

      }

      dstAttribute.addUpdateRange(vertexStart * itemSize, reservedVertexCount * itemSize);

    }

    // copy index
    if (hasIndex) {

      const indexStart = geometryInfo.indexStart;
      const reservedIndexCount = geometryInfo.reservedIndexCount;

      const index = geometry.getIndex();

      if (index === null) {
        throw new Error('BatchedMesh: geometry must have an index buffer');
      }

      geometryInfo.indexCount = index.count;

      // copy index data over
      for (let i = 0; i < srcIndex.count; i++) {

        dstIndex.setX(indexStart + i, vertexStart + srcIndex.getX(i));

      }

      // fill the rest in with zeroes
      for (let i = srcIndex.count, l = reservedIndexCount; i < l; i++) {

        dstIndex.setX(indexStart + i, vertexStart);

      }

      dstIndex.needsUpdate = true;
      dstIndex.addUpdateRange(indexStart, geometryInfo.reservedIndexCount);

    }

    // update the draw range
    geometryInfo.start = hasIndex ? geometryInfo.indexStart : geometryInfo.vertexStart;
    geometryInfo.count = hasIndex ? geometryInfo.indexCount : geometryInfo.vertexCount;

    // store the bounding boxes
    geometryInfo.boundingBox = null;
    if (geometry.boundingBox !== null) {

      geometryInfo.boundingBox = geometry.boundingBox.clone();

    }

    geometryInfo.boundingSphere = null;
    if (geometry.boundingSphere !== null) {

      geometryInfo.boundingSphere = geometry.boundingSphere.clone();

    }

    this._visibilityChanged = true;
    return geometryId;

  }

  /**
   * Deletes the geometry defined by the given ID from this batch. Any instances referencing
   * this geometry will also be removed as a side effect.
   *
   * @param {number} geometryId - The ID of the geometry to remove from the batch.
   * @return {BatchedMesh} A reference to this batched mesh.
   */
  public deleteGeometry(geometryId: number): this {

    const geometryInfoList = this._geometryInfo;
    if (geometryId >= geometryInfoList.length || geometryInfoList[geometryId].active === false) {

      return this;

    }

    // delete any instances associated with this geometry
    const instanceInfo = this._instanceInfo;
    for (let i = 0, l = instanceInfo.length; i < l; i++) {

      if (instanceInfo[i].active && instanceInfo[i].geometryIndex === geometryId) {

        this.deleteInstance(i);

      }

    }

    geometryInfoList[geometryId].active = false;
    this._availableGeometryIds.push(geometryId);
    this._visibilityChanged = true;

    return this;

  }

  /**
   * Deletes an existing instance from the batch using the given ID.
   *
   * @param {number} instanceId - The ID of the instance to remove from the batch.
   * @return {BatchedMesh} A reference to this batched mesh.
   */
  public deleteInstance(instanceId: number): BatchedMesh {

    this.validateInstanceId(instanceId);

    this._instanceInfo[instanceId].active = false;
    this._availableInstanceIds.push(instanceId);
    this._visibilityChanged = true;

    return this;

  }

  /**
   * Repacks the sub geometries in [name] to remove any unused space remaining from
   * previously deleted geometry, freeing up space to add new geometry.
   *
   * @param {number} instanceId - The ID of the instance to remove from the batch.
   * @return {BatchedMesh} A reference to this batched mesh.
   */
  public optimize(): this {

    // track the next indices to copy data to
    let nextVertexStart = 0;
    let nextIndexStart = 0;

    // Iterate over all geometry ranges in order sorted from earliest in the geometry buffer to latest
    // in the geometry buffer. Because draw range objects can be reused there is no guarantee of their order.
    const geometryInfoList = this._geometryInfo;
    const indices = geometryInfoList
      .map((e, i) => i)
      .sort((a, b) => {

        return geometryInfoList[a].vertexStart - geometryInfoList[b].vertexStart;

      });

    const geometry = this.geometry;
    for (let i = 0, l = geometryInfoList.length; i < l; i++) {

      // if a geometry range is inactive then don't copy anything
      const index = indices[i];
      const geometryInfo = geometryInfoList[index];
      if (geometryInfo.active === false) {

        continue;

      }

      // if a geometry contains an index buffer then shift it, as well
      if (geometry.index !== null) {

        if (geometryInfo.indexStart !== nextIndexStart) {

          const { indexStart, vertexStart, reservedIndexCount } = geometryInfo;
          const index = geometry.index;
          const array = index.array;

          // shift the index pointers based on how the vertex data will shift
          // adjusting the index must happen first so the original vertex start value is available
          const elementDelta = nextVertexStart - vertexStart;
          for (let j = indexStart; j < indexStart + reservedIndexCount; j++) {

            array[j] = array[j] + elementDelta;

          }

          index.array.copyWithin(nextIndexStart, indexStart, indexStart + reservedIndexCount);
          index.addUpdateRange(nextIndexStart, reservedIndexCount);

          geometryInfo.indexStart = nextIndexStart;

        }

        nextIndexStart += geometryInfo.reservedIndexCount;

      }

      // if a geometry needs to be moved then copy attribute data to overwrite unused space
      if (geometryInfo.vertexStart !== nextVertexStart) {

        const { vertexStart, reservedVertexCount } = geometryInfo;
        const attributes = geometry.attributes;
        for (const key in attributes) {

          const attribute = attributes[key];
          const { array, itemSize } = attribute;
          array.copyWithin(nextVertexStart * itemSize, vertexStart * itemSize, (vertexStart + reservedVertexCount) * itemSize);

          if (attribute instanceof InterleavedBufferAttribute) {
            throw new Error(
              'BatchedMesh: InterleavedBufferAttribute is not supported.'
            );
          }

          attribute.addUpdateRange(nextVertexStart * itemSize, reservedVertexCount * itemSize);

        }

        geometryInfo.vertexStart = nextVertexStart;

      }

      nextVertexStart += geometryInfo.reservedVertexCount;
      geometryInfo.start = geometry.index ? geometryInfo.indexStart : geometryInfo.vertexStart;

      // step the next geometry points to the shifted position
      this._nextIndexStart = geometry.index ? geometryInfo.indexStart + geometryInfo.reservedIndexCount : 0;
      this._nextVertexStart = geometryInfo.vertexStart + geometryInfo.reservedVertexCount;

    }

    return this;

  }

  /**
   * Returns the bounding box for the given geometry.
   *
   * @param {number} geometryId - The ID of the geometry to return the bounding box for.
   * @param {Box3} target - The target object that is used to store the method's result.
   * @return {?Box3} The geometry's bounding box. Returns `null` if no geometry has been found for the given ID.
   */
  public getBoundingBoxAt(geometryId: number, target: Box3): Box3 | null {

    if (geometryId >= this._geometryCount) {

      return null;

    }

    // compute bounding box
    const geometry = this.geometry;
    const geometryInfo = this._geometryInfo[geometryId];
    if (geometryInfo.boundingBox === null) {

      const box = new Box3();
      const index = geometry.index;
      const position = geometry.attributes.position;
      for (let i = geometryInfo.start, l = geometryInfo.start + geometryInfo.count; i < l; i++) {

        let iv = i;
        if (index) {

          iv = index.getX(iv);

        }

        box.expandByPoint(_vector.fromBufferAttribute(position, iv));

      }

      geometryInfo.boundingBox = box;

    }

    target.copy(geometryInfo.boundingBox);
    return target;

  }

  /**
   * Returns the bounding sphere for the given geometry.
   *
   * @param {number} geometryId - The ID of the geometry to return the bounding sphere for.
   * @param {Sphere} target - The target object that is used to store the method's result.
   * @return {?Sphere} The geometry's bounding sphere. Returns `null` if no geometry has been found for the given ID.
   */
  public getBoundingSphereAt(geometryId: number, target: Sphere): Sphere | null {

    if (geometryId >= this._geometryCount) {

      return null;

    }

    // compute bounding sphere
    const geometry = this.geometry;
    const geometryInfo = this._geometryInfo[geometryId];
    if (geometryInfo.boundingSphere === null) {

      const sphere = new Sphere();
      this.getBoundingBoxAt(geometryId, _box);
      _box.getCenter(sphere.center);

      const index = geometry.index;
      const position = geometry.attributes.position;

      let maxRadiusSq = 0;
      for (let i = geometryInfo.start, l = geometryInfo.start + geometryInfo.count; i < l; i++) {

        let iv = i;
        if (index) {

          iv = index.getX(iv);

        }

        _vector.fromBufferAttribute(position, iv);
        maxRadiusSq = Math.max(maxRadiusSq, sphere.center.distanceToSquared(_vector));

      }

      sphere.radius = Math.sqrt(maxRadiusSq);
      geometryInfo.boundingSphere = sphere;

    }

    target.copy(geometryInfo.boundingSphere);
    return target;

  }

  /**
   * Sets the given local transformation matrix to the defined instance.
   * Negatively scaled matrices are not supported.
   *
   * @param {number} instanceId - The ID of an instance to set the matrix of.
   * @param {Matrix4} matrix - A 4x4 matrix representing the local transformation of a single instance.
   * @return {BatchedMesh} A reference to this batched mesh.
   */
  public setMatrixAt(instanceId: number, matrix: Matrix4): this {

    this.validateInstanceId(instanceId);

    if (this._matricesTexture === null) {
      throw new Error("BatchedMesh: matrices texture has not been initialized.");
    }

    const matricesTexture = this._matricesTexture;
    const matricesArray = this._matricesTexture.image.data;
    matrix.toArray(matricesArray, instanceId * 16);
    matricesTexture.needsUpdate = true;

    return this;

  }

  /**
   * Returns the local transformation matrix of the defined instance.
   *
   * @param {number} instanceId - The ID of an instance to get the matrix of.
   * @param {Matrix4} matrix - The target object that is used to store the method's result.
   * @return {Matrix4} The instance's local transformation matrix.
   */
  public getMatrixAt(instanceId: number, matrix: Matrix4): Matrix4 {

    this.validateInstanceId(instanceId);

    if (this._matricesTexture === null) {
      throw new Error("BatchedMesh: matrices texture has not been initialized.");
    }
    return matrix.fromArray(this._matricesTexture.image.data, instanceId * 16);

  }

  /**
   * Sets the given color to the defined instance.
   *
   * @param {number} instanceId - The ID of an instance to set the color of.
   * @param {Color} color - The color to set the instance to.
   * @return {BatchedMesh} A reference to this batched mesh.
   */
  public setColorAt(instanceId: number, color: Color): this {

    this.validateInstanceId(instanceId);

    if (this._colorsTexture === null) {

      this._initColorsTexture();

    }

    color.toArray(this._colorsTexture!.image.data, instanceId * 4);
    this._colorsTexture!.needsUpdate = true;

    return this;

  }

  /**
   * Returns the color of the defined instance.
   *
   * @param {number} instanceId - The ID of an instance to get the color of.
   * @param {Color} color - The target object that is used to store the method's result.
   * @return {Color} The instance's color.
   */
  public getColorAt(instanceId: number, color: Color): Color {

    this.validateInstanceId(instanceId);

    if (this._colorsTexture === null) {
      throw new Error("BatchedMesh: matrices texture has not been initialized.");
    }

    return color.fromArray(this._colorsTexture.image.data, instanceId * 4);

  }

  /**
   * Sets the visibility of the instance.
   *
   * @param {number} instanceId - The id of the instance to set the visibility of.
   * @param {boolean} visible - Whether the instance is visible or not.
   * @return {BatchedMesh} A reference to this batched mesh.
   */
  public setVisibleAt(instanceId: number, visible: boolean): this {

    this.validateInstanceId(instanceId);

    if (this._instanceInfo[instanceId].visible === visible) {

      return this;

    }

    this._instanceInfo[instanceId].visible = visible;
    this._visibilityChanged = true;

    return this;

  }

  /**
   * Returns the visibility state of the defined instance.
   *
   * @param {number} instanceId - The ID of an instance to get the visibility state of.
   * @return {boolean} Whether the instance is visible or not.
   */
  public getVisibleAt(instanceId: number): boolean {

    this.validateInstanceId(instanceId);

    return this._instanceInfo[instanceId].visible;

  }

  /**
   * Sets the geometry ID of the instance at the given index.
   *
   * @param {number} instanceId - The ID of the instance to set the geometry ID of.
   * @param {number} geometryId - The geometry ID to be use by the instance.
   * @return {BatchedMesh} A reference to this batched mesh.
   */
  public setGeometryIdAt(instanceId: number, geometryId: number): this {

    this.validateInstanceId(instanceId);
    this.validateGeometryId(geometryId);

    this._instanceInfo[instanceId].geometryIndex = geometryId;

    return this;

  }

  /**
   * Returns the geometry ID of the defined instance.
   *
   * @param {number} instanceId - The ID of an instance to get the geometry ID of.
   * @return {number} The instance's geometry ID.
   */
  public getGeometryIdAt(instanceId: number): number {

    this.validateInstanceId(instanceId);

    return this._instanceInfo[instanceId].geometryIndex;

  }

  /**
   * Get the range representing the subset of triangles related to the attached geometry,
   * indicating the starting offset and count, or `null` if invalid.
   *
   * @param {number} geometryId - The id of the geometry to get the range of.
   * @param {Object} [target] - The target object that is used to store the method's result.
   * @return {{
   * 	vertexStart:number,vertexCount:number,reservedVertexCount:number,
   * 	indexStart:number,indexCount:number,reservedIndexCount:number,
   * 	start:number,count:number
   * }} The result object with range data.
   */
  public getGeometryRangeAt(geometryId: number, target?: GeometryInfo): GeometryInfo {

    this.validateGeometryId(geometryId);

    if (target === undefined) {
      target = {
        // geometry information
        vertexStart: - 1,
        vertexCount: - 1,
        reservedVertexCount: - 1,

        indexStart: - 1,
        indexCount: - 1,
        reservedIndexCount: - 1,

        // draw range information
        start: - 1,
        count: - 1,

        // state
        boundingBox: null,
        boundingSphere: null,
        active: true,
      };

    }

    const geometryInfo = this._geometryInfo[geometryId];
    target.vertexStart = geometryInfo.vertexStart;
    target.vertexCount = geometryInfo.vertexCount;
    target.reservedVertexCount = geometryInfo.reservedVertexCount;

    target.indexStart = geometryInfo.indexStart;
    target.indexCount = geometryInfo.indexCount;
    target.reservedIndexCount = geometryInfo.reservedIndexCount;

    target.start = geometryInfo.start;
    target.count = geometryInfo.count;

    return target;

  }

  /**
   * Resizes the necessary buffers to support the provided number of instances.
   * If the provided arguments shrink the number of instances but there are not enough
   * unused Ids at the end of the list then an error is thrown.
   *
   * @param {number} maxInstanceCount - The max number of individual instances that can be added and rendered by the batch.
  */
  public setInstanceCount(maxInstanceCount: number) {

    // shrink the available instances as much as possible
    const availableInstanceIds = this._availableInstanceIds;
    const instanceInfo = this._instanceInfo;
    availableInstanceIds.sort(ascIdSort);
    while (availableInstanceIds[availableInstanceIds.length - 1] === instanceInfo.length - 1) {

      instanceInfo.pop();
      availableInstanceIds.pop();

    }

    // throw an error if it can't be shrunk to the desired size
    if (maxInstanceCount < instanceInfo.length) {

      throw new Error(`BatchedMesh: Instance ids outside the range ${maxInstanceCount} are being used. Cannot shrink instance count.`);

    }

    // copy the multi draw counts
    const multiDrawCounts = new Int32Array(maxInstanceCount);
    const multiDrawStarts = new Int32Array(maxInstanceCount);
    copyArrayContents(this._multiDrawCounts, multiDrawCounts);
    copyArrayContents(this._multiDrawStarts, multiDrawStarts);

    this._multiDrawCounts = multiDrawCounts;
    this._multiDrawStarts = multiDrawStarts;
    this._maxInstanceCount = maxInstanceCount;

    // update texture data for instance sampling
    // const indirectTexture = this._indirectTexture;
    // const matricesTexture = this._matricesTexture;
    // const colorsTexture = this._colorsTexture;

    // update texture data for instance sampling
    const indirectTexture = this.requireIndirectTexture();
    const matricesTexture = this.requireMatricesTexture();
    const colorsTexture = this._colorsTexture; // optional feature

    indirectTexture.dispose();
    this._initIndirectTexture();
    copyArrayContents(indirectTexture.image.data, this._indirectTexture!.image.data);

    matricesTexture.dispose();
    this._initMatricesTexture();
    copyArrayContents(matricesTexture.image.data, this._matricesTexture!.image.data);

    if (colorsTexture) {

      colorsTexture.dispose();
      this._initColorsTexture();
      copyArrayContents(colorsTexture.image.data, this._colorsTexture!.image.data);

    }

  }

  /**
   * Resizes the available space in the batch's vertex and index buffer attributes to the provided sizes.
   * If the provided arguments shrink the geometry buffers but there is not enough unused space at the
   * end of the geometry attributes then an error is thrown.
   *
   * @param {number} maxVertexCount - The maximum number of vertices to be used by all unique geometries to resize to.
   * @param {number} maxIndexCount - The maximum number of indices to be used by all unique geometries to resize to.
  */
  public setGeometrySize(maxVertexCount: number, maxIndexCount: number): void {

    // Check if we can shrink to the requested vertex attribute size
    const validRanges = [...this._geometryInfo].filter(info => info.active);
    const requiredVertexLength = Math.max(...validRanges.map(range => range.vertexStart + range.reservedVertexCount));
    if (requiredVertexLength > maxVertexCount) {

      throw new Error(`BatchedMesh: Geometry vertex values are being used outside the range ${maxIndexCount}. Cannot shrink further.`);

    }

    // Check if we can shrink to the requested index attribute size
    if (this.geometry.index) {

      const requiredIndexLength = Math.max(...validRanges.map(range => range.indexStart + range.reservedIndexCount));
      if (requiredIndexLength > maxIndexCount) {

        throw new Error(`BatchedMesh: Geometry index values are being used outside the range ${maxIndexCount}. Cannot shrink further.`);

      }

    }

    // dispose of the previous geometry
    const oldGeometry = this.geometry;
    oldGeometry.dispose();

    // recreate the geometry needed based on the previous variant
    this._maxVertexCount = maxVertexCount;
    this._maxIndexCount = maxIndexCount;

    if (this._geometryInitialized) {

      this._geometryInitialized = false;
      this.geometry = new BufferGeometry();
      this._initializeGeometry(oldGeometry);

    }

    // copy data from the previous geometry
    const geometry = this.geometry;
    if (geometry.index === null) {
      throw new Error('BatchedMesh: geometry cannot be null');
    }
    if (oldGeometry.index) {

      copyArrayContents(oldGeometry.index.array, geometry.index.array);

    }

    for (const key in oldGeometry.attributes) {

      copyArrayContents(oldGeometry.attributes[key].array, geometry.attributes[key].array);

    }

  }

  public raycast(raycaster: Raycaster, intersects: BatchedRaycasterIntersection[]) {

    const instanceInfo = this._instanceInfo;
    const geometryInfoList = this._geometryInfo;
    const matrixWorld = this.matrixWorld;
    const batchGeometry = this.geometry;

    // iterate over each geometry
    _mesh.material = this.material;
    _mesh.geometry.index = batchGeometry.index;
    _mesh.geometry.attributes = batchGeometry.attributes;
    if (_mesh.geometry.boundingBox === null) {

      _mesh.geometry.boundingBox = new Box3();

    }

    if (_mesh.geometry.boundingSphere === null) {

      _mesh.geometry.boundingSphere = new Sphere();

    }

    for (let i = 0, l = instanceInfo.length; i < l; i++) {

      if (!instanceInfo[i].visible || !instanceInfo[i].active) {

        continue;

      }

      const geometryId = instanceInfo[i].geometryIndex;
      const geometryInfo = geometryInfoList[geometryId];
      _mesh.geometry.setDrawRange(geometryInfo.start, geometryInfo.count);

      // get the intersects
      this.getMatrixAt(i, _mesh.matrixWorld).premultiply(matrixWorld);
      this.getBoundingBoxAt(geometryId, _mesh.geometry.boundingBox);
      this.getBoundingSphereAt(geometryId, _mesh.geometry.boundingSphere);
      _mesh.raycast(raycaster, _batchIntersects);

      // add batch id to the intersects
      for (let j = 0, l = _batchIntersects.length; j < l; j++) {

        const intersect = _batchIntersects[j];
        intersect.object = this;
        intersect.batchId = i;
        intersects.push(intersect);

      }

      _batchIntersects.length = 0;

    }

    // TODO: check if to uncomment
    // _mesh.material = null;
    _mesh.geometry.index = null;
    _mesh.geometry.attributes = {};
    _mesh.geometry.setDrawRange(0, Infinity);

  }

  public copy(source: any) {

    super.copy(source);

    this.geometry = source.geometry.clone();
    this.perObjectFrustumCulled = source.perObjectFrustumCulled;
    this.sortObjects = source.sortObjects;
    this.boundingBox = source.boundingBox !== null ? source.boundingBox.clone() : null;
    this.boundingSphere = source.boundingSphere !== null ? source.boundingSphere.clone() : null;

    this._geometryInfo = source._geometryInfo.map((info: GeometryInfo) => ({
      ...info,

      boundingBox: info.boundingBox !== null ? info.boundingBox.clone() : null,
      boundingSphere: info.boundingSphere !== null ? info.boundingSphere.clone() : null,
    }));
    this._instanceInfo = source._instanceInfo.map((info: GeometryInfo) => ({ ...info }));

    this._availableInstanceIds = source._availableInstanceIds.slice();
    this._availableGeometryIds = source._availableGeometryIds.slice();

    this._nextIndexStart = source._nextIndexStart;
    this._nextVertexStart = source._nextVertexStart;
    this._geometryCount = source._geometryCount;

    this._maxInstanceCount = source._maxInstanceCount;
    this._maxVertexCount = source._maxVertexCount;
    this._maxIndexCount = source._maxIndexCount;

    this._geometryInitialized = source._geometryInitialized;
    this._multiDrawCounts = source._multiDrawCounts.slice();
    this._multiDrawStarts = source._multiDrawStarts.slice();

    this._indirectTexture = source._indirectTexture.clone();

    if (this._indirectTexture) {
      this._indirectTexture.image.data = this._indirectTexture.image.data.slice();
    }

    this._matricesTexture = source._matricesTexture.clone();

    if (this._matricesTexture) {
      this._matricesTexture.image.data = this._matricesTexture.image.data.slice();
    }

    if (this._colorsTexture !== null) {

      this._colorsTexture = source._colorsTexture.clone();

      if (this._colorsTexture) {
        this._colorsTexture.image.data = this._colorsTexture.image.data.slice();
      }

    }

    return this;

  }

  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever this instance is no longer used in your app.
   */
  public dispose() {

    // Assuming the geometry is not shared with other meshes
    this.geometry.dispose();

    if (this._matricesTexture) {
      this._matricesTexture.dispose();
    }
    this._matricesTexture = null;

    if (this._indirectTexture) {
      this._indirectTexture.dispose();
    }
    this._indirectTexture = null;

    if (this._colorsTexture !== null) {

      this._colorsTexture.dispose();
      this._colorsTexture = null;

    }

  }

  public onBeforeRender(
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    geometry: any,
    material: any
    /*, _group*/
  ) {

    // if visibility has not changed and frustum culling and object sorting is not required
    // then skip iterating over all items
    if (!this._visibilityChanged && !this.perObjectFrustumCulled && !this.sortObjects) {

      return;

    }

    // the indexed version of the multi draw function requires specifying the start
    // offset in bytes.
    const index = geometry.getIndex();
    const bytesPerElement = index === null ? 1 : index.array.BYTES_PER_ELEMENT;

    const instanceInfo = this._instanceInfo;
    const multiDrawStarts = this._multiDrawStarts;
    const multiDrawCounts = this._multiDrawCounts;
    const geometryInfoList = this._geometryInfo;
    const perObjectFrustumCulled = this.perObjectFrustumCulled;
    const indirectTexture = this._indirectTexture;
    const indirectArray = indirectTexture?.image.data;

    const frustum = 'isArrayCamera' in camera ? _frustumArray : _frustum;
    // prepare the frustum in the local frame
    if (perObjectFrustumCulled && !('isArrayCamera' in camera)) {

      _matrix
        .multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
        .multiply(this.matrixWorld);

      _frustum.setFromProjectionMatrix(
        _matrix,
        camera.coordinateSystem,
        camera.reversedDepth
      );

    }

    let multiDrawCount = 0;
    if (this.sortObjects) {

      // get the camera position in the local frame
      _matrix.copy(this.matrixWorld).invert();
      _vector.setFromMatrixPosition(camera.matrixWorld).applyMatrix4(_matrix);
      _forward.set(0, 0, - 1).transformDirection(camera.matrixWorld).transformDirection(_matrix);

      for (let i = 0, l = instanceInfo.length; i < l; i++) {

        if (instanceInfo[i].visible && instanceInfo[i].active) {

          const geometryId = instanceInfo[i].geometryIndex;

          // get the bounds in world space
          this.getMatrixAt(i, _matrix);
          // this.getBoundingSphereAt(geometryId, _sphere).applyMatrix4(_matrix);

          const sphere = this.getBoundingSphereAt(geometryId, _sphere);

          if (sphere !== null) {
            sphere.applyMatrix4(_matrix);
          }

          // determine whether the batched geometry is within the frustum
          let culled = false;
          if (perObjectFrustumCulled) {

            culled = !frustum.intersectsSphere(_sphere, camera as ArrayCamera);

          }

          if (!culled) {

            // get the distance from camera used for sorting
            const geometryInfo = geometryInfoList[geometryId];
            const z = _temp.subVectors(_sphere.center, _vector).dot(_forward);
            _renderList.push(geometryInfo.start, geometryInfo.count, z, i);

          }

        }

      }

      // Sort the draw ranges and prep for rendering
      const list = _renderList.list;
      const customSort = this.customSort;
      if (customSort === null) {

        list.sort(material.transparent ? sortTransparent : sortOpaque);

      } else {

        customSort.call(this, list, camera);

      }

      for (let i = 0, l = list.length; i < l; i++) {

        const item = list[i];
        multiDrawStarts[multiDrawCount] = item.start * bytesPerElement;
        multiDrawCounts[multiDrawCount] = item.count;
        indirectArray[multiDrawCount] = item.index;
        multiDrawCount++;

      }

      _renderList.reset();

    } else {

      for (let i = 0, l = instanceInfo.length; i < l; i++) {

        if (instanceInfo[i].visible && instanceInfo[i].active) {

          const geometryId = instanceInfo[i].geometryIndex;

          // determine whether the batched geometry is within the frustum
          let culled = false;
          if (perObjectFrustumCulled) {

            // get the bounds in world space
            this.getMatrixAt(i, _matrix);
            // this.getBoundingSphereAt(geometryId, _sphere).applyMatrix4(_matrix);

            const sphere = this.getBoundingSphereAt(geometryId, _sphere);
            if (sphere !== null) {
              sphere.applyMatrix4(_matrix);
            }
            culled = !frustum.intersectsSphere(_sphere, camera as ArrayCamera);

          }

          if (!culled) {

            const geometryInfo = geometryInfoList[geometryId];
            multiDrawStarts[multiDrawCount] = geometryInfo.start * bytesPerElement;
            multiDrawCounts[multiDrawCount] = geometryInfo.count;
            indirectArray[multiDrawCount] = i;
            multiDrawCount++;

          }

        }

      }

    }

    if (indirectTexture) {
      indirectTexture.needsUpdate = true;
    }
    this._multiDrawCount = multiDrawCount;
    this._visibilityChanged = false;

  }

  onBeforeShadow(
    renderer: WebGLRenderer,
    object: any,
    camera: Camera,
    shadowCamera: Camera,
    geometry: any,
    depthMaterial: any
    /* , group */
  ) {

    this.onBeforeRender(renderer, /* null */ new Scene(), shadowCamera, geometry, depthMaterial);

  }




  // helpers
  private requireIndirectTexture(): DataTexture {
    if (this._indirectTexture === null) {
      throw new Error("BatchedMesh: indirect texture not initialized.");
    }
    return this._indirectTexture;
  }

  private requireMatricesTexture(): DataTexture {
    if (this._matricesTexture === null) {
      throw new Error("BatchedMesh: matrices texture not initialized.");
    }
    return this._matricesTexture;
  }

  private requireColorsTexture(): DataTexture {
    if (this._colorsTexture === null) {
      throw new Error("BatchedMesh: colors texture not initialized.");
    }
    return this._colorsTexture;
  }

}
