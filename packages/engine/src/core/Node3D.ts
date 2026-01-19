import { Vector3 } from "../math/Vector3";
import { Euler } from "../math/Euler";
import { Quaternion } from "../math/Quaternion";
import { Matrix4 } from "../math/Matrix4";
import { Layers } from "./Layers";
import { AnimationClip } from "../animation/AnimationClip";
import { Material } from "../materials/Material";
import { BufferGeometry } from "./BufferGeometry";
import { WebGLRenderer } from "../renderers/WebGLRenderer";
import { Group } from "../objects/Group";
import { generateUUID } from "../math/MathUtils";

import { Camera } from "../cameras/Camera";
import { Raycaster, RaycasterIntersection } from "./Raycaster";
import { EventDispatcher } from "./EventDispatcher";

let _node3DId = 0;

type UserDataValue = string | number | null | UserDataValue[] | { [key: string]: UserDataValue };

interface Node3DOutputJSON {
  meta: {
    version: number;
    type: string;
    generator: string;
  };
  geometries?: object[];
  materials?: object[];
  textures?: object[];
  images?: object[];
  shapes?: object[];
  skeletons?: object[];
  animations?: object[];
  nodes?: object[]
  // add other properties here if needed
}

interface Node3DJSON {
  uuid: string;
  type: string;
  name: string;
  castShadow: boolean;
  recieveShadow: boolean;
  visible: boolean;
  frustumCulled: boolean;
  renderOrder: number;
  userData: { [key: string]: UserDataValue },
  layers: number;
  matrix: number[];
  up: number[];
  matrixAutoUpdate: boolean;
  count: number;
  instanceMatrix: number[];
  instanceColor: number[];
  perObjectFrustumCulled: boolean;
  sortObjects: boolean;
  drawRanges: boolean;
  reservedRanges: boolean;
  geometryInfo: object;
  instanceInfo: object;
  availableInstanceIds: object;
  availableGeometryIds: object;
  nextIndexStart: number;
  nextVertexStart: number;
  geometryCount: number;
  maxInstanceCount: number;
  maxVertexCount: number;
  maxIndexCount: number;
  geometryInitialized: number;
  matricesTexture: object;
  indirectTexture: object;
  colorTextures: object;
  boundingSphere: object;
  boundingBox: object;
  background: object;
  environment: object;
  geometry: object;
  bindMode: object;
  bindMatrix: object;
  skeleton: object;
  material: object;
  children: object[];
  animations: object[];
}

const _v = /*@__PURE__*/ new Vector3();
const _q = /*@__PURE__*/ new Quaternion();
const _m = /*@__PURE__*/ new Matrix4();
const _target = /*@__PURE__*/ new Vector3();

const _position = /*@__PURE__*/ new Vector3();
const _scale = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();

const _xAxis = /*@__PURE__*/ new Vector3(1, 0, 0);
const _yAxis = /*@__PURE__*/ new Vector3(0, 1, 0);
const _zAxis = /*@__PURE__*/ new Vector3(0, 0, 1);

/**
 * Node3D uses WebGL object
 *
 */
export class Node3D extends EventDispatcher {

  /**
  * this flag can be used for type testing.
  *
  * @type {boolean}
  * @readonly
  * @defaultValue true
  */
  public readonly isNode3D: boolean = true;

  /**
 * The ID of the node.
 *
 * @name Node#id
 * @readonly
*/
  public readonly id: number;

  /**
 * The name of the node
 */
  public name: string = '';


  /**
   * The UUID of the node
   *
   * @readonly
   */
  public readonly uuid: string = generateUUID();


  /**
   * Defines the `up` direction of the 3D Node. which influences the orientation
   * via methods like {@link Node3D.lookAt}.
   *
   * @remarks
   * The default value for all 3D nodes id defined by `Node3D.DEFAULT_UP`
   */
  public up: Vector3 = Node3D.DEFAULT_UP;

  /**
   * Represents the node's local position in 3D space.
   *
   * @name Node3D#position
   * @defaultValue (0, 0, 0)
   */
  public position: Vector3 = new Vector3();

  /**
   * Represents the node's local rotation as Euler angles, in radians.
   *
   * @name Node3D#rotation
   * @defaultValue (0, 0, 0)
   */
  public rotation: Euler = new Euler();

  /**
   * Represents the node's local rotation as a quaternion.
   *
   * @name Node3D#quaternion
   * @defaultValue (0, 0, 0, 1)
   */
  public quaternion: Quaternion = new Quaternion();

  /**
   * Represents the node's local scale in 3D space.
   *
   * @name Node3D#scale
   * @defaultValue (1, 1, 1)
   */
  public scale: Vector3 = new Vector3(1, 1, 1);

  // /**
  //  * An array holding the child objects of this Node instance
  //  */
  // public children: Node3D[] = [];


  /**
   * Represents the node's transformation matrix in local/model space
   *
   * @name Node3D#matrix
 */
  public matrix: Matrix4 = new Matrix4();

  /**
   * Represents the node's transformation matrix in world space.
   *
   * @remarks
   * If the Node3D has no parent, then it's identical to
   * the local transformation matrix {@link Node3D#matrix}
   *
   * @name Node3D#matrixWorld
   */
  public matrixWorld: Matrix4 = new Matrix4();

  /**
   * Represents the node's normal matrix
   *
   * @name Node3D#normalMatrix
   */
  public normalMatrix: Matrix4 = new Matrix4();

  /**
   * Represents the node's model-view matrix
   *
   * @name Node3D#modelViewMatrix
   */
  public modelViewMatrix: Matrix4 = new Matrix4();

  /**
   * When set to `true`, the engine automatically computes the local matrix from
   * position, rotation, and scale before rendering every frame.
   *
   * @remarks
   * The default values for all 3D objects is defined by `Node3D.DEFAULT_MATRIX_AUTO_UPDATE`
   */
  public matrixAutoUpdate = Node3D.DEFAULT_MATRIX_AUTO_UPDATE;

  /**
   * When set to `true`, the engine automatically computes the world matrix from the current
   * local matrix and the object's transformation hierarchy before rendering every frame.
   *
   * @remarks
   * The default values for all 3D objects is defined by `Node3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE`
   */
  public matrixWorldAutoUpdate = Node3D.DEFAULT_WORLD_MATRIX_AUTO_UPDATE;

  /**
   * When set to `true`, the engine calculates the world matrix in that frame and resets this
   * property to `false`.
   *
   * @defaultValue false
   */
  public matrixWorldNeedsUpdate: boolean = false;

  /**
   * The layer membership of this Node3D.
   *
   * @remarks
   * The Node3D is only visible if it has at least one layer in commonn with the camera in use.
   * This property can also be used to filter out unwanted objects in ray-intersection tests
   * when using a {@link Raycaster}.
   */
  public layers: Layers = new Layers();

  /**
   * When set to `true`, the Node3D gets rendered into shadow maps.
   */
  public castShadow: boolean = false;

  /**
   * When set to `true`, the Node3D is affected by shadows in the scene.
   */
  public recieveShadow: boolean = true;

  /**
   * When set to `true`, the Node3D is honored by view frustum culling.
   */
  public frustumCulled: boolean = true;

  /**
   * This value allows the default rendering order of scene graph Nodes to be
   * overriden although opaque and transparent Nodes remain sorted indepently.
   *
   * @remarks
   * When this property is set for an instance of {@link Group}, all descendant
   * Nodes will be sorted and rendered together. Sorting is from lowest to highes
   */
  public renderOrder: number = 0;

  /**
   * Array holding the animation clips of the Node3D
   */
  public animations: AnimationClip[] = [];

  /**
   * Custom depth material to be used when rendering to the depth map.
   *
   * @remarks
   * Can only be used in context of meshes.
   * When shadow-casting with a {@link DirectionalLight} or {@link SpotLight},
   * if you are modifying vertext positions in the vertex shader you must specify
   * a custom depth material for proper shadows.
   *
   * Only relevant in the context of {@link WebGLRenderer}
   *
   * @default undefined
   */
  public customDepthMaterial?: Material;

  /**
   * Same as {@link Node3D#customDepthMaterial}, but used with {@link PointLigh}
   *
   * @remarks
   * Only relevant in the context of {@link WebGLRenderer}
   *
   * @default undefined
   */
  public customDistanceMaterial?: Material;

  /**
   * An object that can be used to store custom data about the Node3D.
   *
   * @remarks
   * It should not hold references to functions as these will not be cloned
   */
  public userData: { [key: string]: UserDataValue } = {}


  /**
   * A reference to the parent object
   */
  public parent: Node3D | null = null;

  /**
   * An array holding the child objects of this Node instance
   */
  public children: Node3D[] = [];

  /**
   * When set to `true`, this node will be rendered in the scene.
   *
   * @remarks
   * This is a hint for renderers. Some renderers may choose to ignore this
   * property depending on the use-case.
   */
  public visible: boolean = true;

  /**
   * The type property is used for detecting the object type
   * in context of serialization/deserialization
   *
   * @readonly
   */
  public readonly type: string = 'Node3D';








  /**
   * Constructs a Node3D instance
   */
  constructor() {
    super();
    this.id = _node3DId++;


    // private helper functions
    const onRotationChange = () => {
      this.quaternion.setFromEuler(this.rotation, false);
    }

    const onQuaternionChange = () => {
      this.rotation.setFromQuaternion(this.quaternion, undefined, false);
    }

    // setup event listeners
    this.rotation._onChange(onRotationChange);
    this.quaternion._onChange(onQuaternionChange);
  }



  /**
* Adds the given Node as a child to this node.
*
* @fires Node#added
* @fires Node#childadded
* @param child - The node to add
* @returns A reference to this instance
*/
  public add(child: Node3D): this {
    if (child === this) {
      console.error('Node3D.add: object can\'t be added as a child of itself.', child);
      return this;
    }

    if (!child.isNode3D) {
      console.error('Can only add instances of Node3D');
      return this;
    }

    child.removeFromParent();

    child.parent = this;
    this.children.push(child);

    this.dispatchEvent({ type: 'addedEvent', parent: this });
    this.dispatchEvent({ type: 'childaddedEvent', child });

    return this;
  }

  /**
   * Adds many children at once
   *
   * @param children - List of children to add
   * @returns A reference to this instance
   */
  public addChildren(children: Node3D[]): this {
    const length = children.length;
    for (let i = 0; i < length; i++) {
      this.add(children[i]);
    }

    return this
  }

  /**
   * Removes the given Node as child frim this Node
   *
   * @fires Node#removed
   * @fires Node#childremoved
   * @param Node - The Node to remove
   * @returns A reference to this instance
   */
  public remove(child: Node3D): this {
    const index = this.children.indexOf(child);

    if (index !== -1) {
      const parent = child.parent;
      child.parent = null;
      this.children.splice(index, 1);
      child.dispatchEvent({ type: 'removedEvent', parent });
      this.dispatchEvent({ type: 'childremovedEvent', child });
    }

    return this;
  }

  /**
   * Removes many children at once
   *
   * @param children - List of children to remove
   * @returns A reference to this instance
   */
  public removeChildren(children: Node3D[]): this {
    // iterate over a shallow copy to avoid skipping elements
    const copy = [...children];
    for (const child of copy) {
      this.remove(child);
    }

    return this
  }

  /**
   * Removes this Node from its current parent
   *
   * @fires Node3D#removed
   * @fires Node3D#childremoved
   * @returns A reference to this instance
   */
  public removeFromParent(): this {
    const parent = this.parent;

    if (!parent) return this;

    parent.remove(this);

    return this;
  }

  /**
   * Removes all child objects
   *
   * @fires Node3D#removed
   * @fires Node3D#childremoved
   * @returns A reference to this instance
   */
  public clear(): this {
    return this.removeChildren(this.children);
  }

  /**
   * Searches through the Node3D and its children, starting with this node
   * itself and returns the first node with a matching ID
   *
   * @param id - The id
   * @returns The first node found with this id or undefined if no node has this id
   */
  public getObjectById(id: number): Node3D | undefined {
    return this.getObjectByProperty('id', id);
  }

  /**
   * Searches through the Node3D and its children, starting with this node
   * itself, and returns the first node with the matching name
   *
   * @param name - The name to search with
   *  @returns The first node found with this name or undefined if none was found
   */
  public getObjectByName(name: string): Node3D | undefined {
    return this.getObjectByProperty('name', name);
  }

  /**
   * Search through this node and its children, and returns the first with
   * the matching property name
   *
   * @param name - Name of the property
   * @param value - Value of the property
   * @returns The found node or undefined if none found
   */
  public getObjectByProperty<K extends keyof Node3D>(
    name: K,
    value: Node3D[K]
  ): Node3D | undefined {
    if (this[name] === value) return this;

    for (let i = 0, l = this.children.length; i < l; i++) {

      const child = this.children[i];
      const object = child.getObjectByProperty(name, value);

      if (object !== undefined) {

        return object;
      }
    }

    return undefined;
  }

  /**
   * Searches through the Node3D object and its children, starting with this Node3D
   * and returns all Node3D's with a matching property value.
   *
   * @param name - The name of the property
   * @param value - The value
   * @param result - The method stores the result in this arry
   * @returns The found Node3Ds
   */
  public getObjectsByProperty(
    name: keyof Node3D,
    value: any
    , result: Node3D[] = []
  ): Node3D[] {
    if (this[name] == value) result.push(this);

    const children = this.children;

    for (let i = 0, l = children.length; i < l; i++) {
      children[i].getObjectsByProperty(name, value, result);
    }

    return result;
  }

  /**
   * Executes the callback on this node and all its children
   *
   * @remarks
   * Modifying the scene graph inside the callback can lead to unexpected results
   * and is discouraged.
   *
   * @param callback - The callback to execute
   */
  public traverse(callback: (node: Node3D) => void): void {
    callback(this);

    const children = this.children;
    for (let i = 0, l = children.length; i < l; i++) {
      children[i].traverse(callback);
    }
  }

  /**
   * Similar to {@link Node3D.traverse}, but traverses only the visible children,
   * Descendants of invisible Nodes are not traversed.
   *
   * @remarks
   * Modyfying the scene graph inside the callback can lead to unexpected results
   * and is discouraged.
   *
   * @param callback - The callback to execute
   */
  public traverseVisible(callback: (node: Node3D) => void): void {
    if (!this.visible) return;

    callback(this);

    const children = this.children;
    for (let i = 0, l = children.length; i < l; i++) {
      children[i].traverseVisible(callback);
    }
  }

  /**
   * Similar to {@link Node3D.traverse}, but traverses only the ancestors of
   * this Node.
   *
   * @remarks
   * Modyfying the scene graph inside the callback can lead to unexpected results
   * and is discouraged.
   *
   * @param callback - The callback to execute
   */
  public traverseAncestors(callback: (node: Node3D) => void): void {
    const parent = this.parent;
    if (parent !== null) {
      callback(parent);
      parent.traverseAncestors(callback);
    }
  }






  /**
   * A callback that is executed immediately before the Node3D is rendered to a
   * shadow map.
   *
   * @param renderer - The renderer
   * @param object - The Node3D being rendered
   * @param camera - The camera that is used to render the scene
   * @param shadowCamera - The shadow camera
   * @param geometry - The Node3D's geometry
   * @param depthMaterial - The depth material
   * @param group - The geometry group data
   */
  public onBeforeShadow(
    renderer: WebGLRenderer,
    object: Node3D,
    camera: Camera,
    shadowCamera: Camera,
    geometry: BufferGeometry,
    depthMaterial: Material,
    group: Group
  ): void {
    // empty
  }

  /**
   * A callback that is executed immediately after a Node3D is rendered to a shadow map
   *
   * @param renderer - The renderer
   * @param object - The Node3D being rendered
   * @param camera - The camera that is used to render the scene
   * @param shadowCamera - The shadow camera
   * @param geometry - The Node3D's geometry
   * @param depthMaterial - The depth material
   * @param group - The geometry group data
   */
  public onAfterShadow(
    renderer: WebGLRenderer,
    object: Node3D,
    camera: Camera,
    shadowCamera: Camera,
    geometry: BufferGeometry,
    depthMaterial: Material,
    group: Group
  ): void {
    // empty
  }

  /**
   * A callback that is executed immediately before a Node3D object is rendered
   * to a shadow map
   *
   * @param renderer - The renderer
   * @param Node3D - The Node3D being rendered
   * @param camera - The camera that is used to render the scene
   * @param geometry - The Node3D's geometry
   * @param material - The depth material
   * @param group - The geometry group data
   */
  public onBeforeRender(
    renderer: WebGLRenderer,
    Node3D: Node3D,
    camera: Camera,
    geometry: BufferGeometry,
    material: Material,
    group: Group
  ): void {
    // empty
  }

  /**
   * A callback that is executed immediately before a Node3D object is rendered
   * to a shadow map
   *
   * @param renderer - The renderer
   * @param Node3D - The Node3D being rendered
   * @param camera - The camera that is used to render the scene
   * @param geometry - The Node3D's geometry
   * @param material - The depth material
   * @param group - The geometry group data
 */
  public onAfterRender(
    renderer: WebGLRenderer,
    Node3D: Node3D,
    camera: Camera,
    geometry: BufferGeometry,
    material: Material,
    group: Group
  ): void {
    // empty
  }

  /**
   * Applies the given transformation matrix to the Node3D and updates the object's
   * position, rotation and scale.
   *
   * @param matrix - The transformation matrix to apply
   */
  public applyMatrix4(matrix: Matrix4): void {
    if (this.matrixAutoUpdate) this.updateMatrix();

    this.matrix.premultiply(matrix);

    this.matrix.decompose(this.position, this.quaternion, this.scale);
  }

  /**
   * Applies a rotation represented by a given quaternion to this Node3D instance.
   *
   * @param q - The quaternion
   * @returns A reference to this instance
   */
  public applyQuaternion(q: Quaternion): this {
    this.quaternion.premultiply(q);

    return this;
  }

  /**
   * Sets the given rotation representation as an axis/angle couple to the 3D object.
   *
   * @param axis - The (normalized) axis vector.
   * @param angle - The angle in radians
   */
  public setRotationFromAxisAngle(axis: Vector3, angle: number): void {
    // assumes axis is  normalized
    this.quaternion.setFromAxisAngle(axis, angle);
  }

  /**
   * Sets the given rotation representated as Euler angles to the Node3D
   *
   * @param euler - The Euler angles
   */
  public setRotationFromEuler(euler: Euler): void {
    this.quaternion.setFromEuler(euler, true);
  }

  /**
   * Sets the given rotation represented as rotation matrix to the Node3D
   *
   * @param m - Although a 4x4 matrix, is expected the upper 3x3 submatrix must
   * be a pure rotation matrix (i.e, unscaled)
   */
  public setRotationFromMatrix(m: Matrix4): void {
    // Assumes the upper 3x3 submatrix of m is a pure rotation (i.e, unscaled)

    this.quaternion.setFromRotationMatrix(m);
  }

  /**
   * Sets the given rotation represented as a Quattion to the Node3D
   *
   * @param q - The Quaternion
   */
  public setRotationFromQuaternion(q: Quaternion): void {
    // assumes q is normalized

    this.quaternion.copy(q);
  }

  /**
   * Rotates the Node3D along an axis in local space
   *
   * @param axis - The (normalized) axis vector.
   * @param angle - The angle in radians.
   * @returns A reference to this instance
   */
  public rotateOnAxis(axis: Vector3, angle: number): this {
    // Rotate the object by the given angle on axis in object space
    // axis is assumed to be normalized

    _q.setFromAxisAngle(axis, angle);

    this.quaternion.premultiply(_q);

    return this;
  }

  /**
   * Rotates the Node3D along an axis in the world space.
   *
   * @param axis - The (normalized) axis vector.
   * @param angle - The angle in radians
   * @returns A reference to this instance
   */
  public rotateOnWorldAxis(axis: Vector3, angle: number): this {
    // Rotate the object by the given angle on the given
    // axis in world space
    // axis is assumed to be normalized
    // method assumes no rotated parent

    _q.setFromAxisAngle(axis, angle);

    this.quaternion.premultiply(_q);

    return this;
  }

  /**
   * Rotates the Node3D object around its X axis in local space.
   *
   * @param angle - The angle in radians
   * @returns A reference to this instance
   */
  public rotateX(angle: number): this {
    return this.rotateOnAxis(_xAxis, angle);
  }

  /**
   * Rotates the Node3D object around its Y axis in local space.
   *
   * @param angle - The angle in radians.
   * @returns A reference to this instance
   */
  public rotateY(angle: number): this {
    return this.rotateOnAxis(_yAxis, angle);
  }

  /**
   * Rotates the Node3D object around its Z axis in local space.
   *
   * @param angle - The angle in radians
   * @returns A reference to this instance
   */
  public rotateZ(angle: number): this {
    return this.rotateOnAxis(_zAxis, angle);
  }

  /**
   * Translates the Node3D object by a distance along the given axis in local space.
   *
   * @param axis - The (normalized) axis vector
   * @param distance - The distance to translate along the axis
   * @returns A reference to this instance
   */
  public translateOnAxis(axis: Vector3, distance: number): this {
    _v.copy(axis).applyQuaternion(this.quaternion);

    this.position.add(_v.multiplyScalar(distance));

    return this;
  }

  /**
   * Translate the Node3D object by a distance along its X axis in local space.
   *
   * @param distance - The distance in world units
   * @returns A reference to this instance
   */
  public translateX(distance: number): this {
    return this.translateOnAxis(_xAxis, distance);
  }

  /**
   * Translate the Node3D object by a given distance along its Y axis in local space
   *
   * @param distance - The distance in world units
   * @returns A reference to this instance
   */
  public translateY(distance: number): this {
    return this.translateOnAxis(_yAxis, distance);
  }

  /**
   * Translate the Node3D object by a given distance along its Z axis in local space.
   *
   * @param distance - the distance in world units.
   * @returns A reference to this instance
   */
  public translateZ(distance: number): this {
    return this.translateOnAxis(_zAxis, distance);
  }

  /**
   * Converts the given vector from this Node3D object's local space
   * to world space.
   *
   * @remarks
   * Takes a vector in local coordinate and gives the world-space coordinates
   * after accounting for the ndoe's translation, rotation, and scale, and its
   * parents' transforms
   *
   * @param vector - The vector to convert
   * @returns The converted vector
   */
  public localToWorld(vector: Vector3): Vector3 {
    this.updateWorldMatrix(true, false);

    return vector.applyMatrix4(this.matrixWorld);
  }

  /**
   * Converts the given vector from this 3D object's world space to local space
   *
   * @remarks
   * Takes a vector in the world coordinate and tells you where that point would
   * be in the node's local coordinate system, account for translation
   * rotation, scale, and parent transforms
   *
   * This is essentially the inverse of {@link localToWorld}
   *
   * @param vector - The vector to convert
   * @returns The converted vector
   */
  public worldToLocal(vector: Vector3): Vector3 {
    /**
     * Ensure that this node and it's parent chain have up-to-date world transform
     * Descedants are not updated, only ancestors + this node
     */
    this.updateWorldMatrix(true, false);

    /**
     * The inverted matrix converts coordinates from world space
     * to the node's local space
     */
    return vector.applyMatrix4(_m.copy(this.matrixWorld).invert());
  }

  /**
   * Rotates the object to face a point in the world space.
   *
   * @remarks
   * This method does not support Nodes having non-uniformly-scaled parent(s).
   *
   * lookAt() makes the Node3D orient itself fo that its Z-axis points toward
   * a world-space target (unless it's a camera/light) which uses the opposite convention
   *
   * @param x - The x coordinate in world space. Alternatively, a vector
   * representing a position in world space
   * @param y - The y coordinate in world space
   * @param z - The z coordinate in world space
   */
  public lookAt(x: Vector3 | number, y?: number, z?: number): void {
    // This method does not support objects having non-uniformly-scaled parent(s)

    /**
     * Normalize input -> world-space target
     *
     * You can pass either:
     * A vector3 target
     * or a sclalar coordinates
     * Both become _target in world space
     */
    if (x instanceof Vector3) {
      _target.copy(x);
    } else {
      if (y === undefined || z === undefined) {
        throw new Error("lookAt(x,y,z): y and z must be provided when x is a number");
      }
      _target.set(x, y, z);
    }

    const parent = this.parent;

    /**
     * Compute this Node3D's world position
     *
     * this.updateWorldMatrix(true, false) ensures
     * -  the node's local matrix is up to date
     * -  the node's worldl matrix is recomputed (forced)
     * -  parent transforms propagate properly
     *
     * _position extracts the world-space position of the object
     */
    this.updateWorldMatrix(true, false);

    _position.setFromMatrixPosition(this.matrixWorld);

    /**
     * Build a world-space lookAt matrix
     *
     * For cameras/light:
     * -  Convention: camera look toward -Z
     * -  so the "eye" = object position
     * -  and "target" = lookAt target
     *
     * For normal Node3D:
     * -  Convention: Node3D face +Z
     * -  so the matrix is reversed
     */
    const isCamera = (this as { isCamera?: boolean }).isCamera;
    const isLight = (this as { isLight?: boolean }).isLight;

    // if ((this as any).isCamera || (this.any).isLight){}
    if (isCamera || isLight) {
      _m.lookAt(_position, _target, this.up);
    } else {
      _m.lookAt(_target, _position, this.up);
    }

    /**
     * Convert that lookAt matrix into a quaternion
     *
     * This sets the Node3D's rotation so that its forward axis matches
     * the look direction
     */
    this.quaternion.setFromRotationMatrix(_m);

    /**
     * Compensate for parent rotation
     *
     * If this node sits under a rotated parent:
     * -  the lookAt orientation is computed in world space
     * -  but the object's quaterniion is in local space
     * -  so we transform
     * -  localRotation = inverse(parentRotation) * desiredWorldRotation
     * -  This ensures the child actually faces the world-space target correctly, even with rotated parents
     */
    if (parent) {
      _m.extractRotation((parent as Node3D).matrixWorld);
      _q.setFromRotationMatrix(_m);
      this.quaternion.premultiply(_q.invert())
    }
  }

  /**
   * Adds the given Node3D object as a child of this Node3D object while maintainin the
   * object's world transform.
   *
   * @remarks
   * This method does not support scene graph with non-uniformly-scaled nodes(s)
   *
   * @fires Node#added
   * @fires Node#childadded
   * @param node - The Node3D object to attach
   * @returns A reference to this instance
   */
  public attach(node: Node3D): Node3D {
    // adds Node3D as a child of this, while maintaining this node's world transform
    // This method does not support scene graphs having non-uniformly-scaled-node(s)

    this.updateWorldMatrix(true, false);

    _m.copy(this.matrixWorld).invert();

    if (node.parent !== null) {
      (node.parent as Node3D).updateWorldMatrix(true, false);

      _m.multiply((node.parent as Node3D).matrixWorld)
    }

    node.applyMatrix4(_m);

    node.removeFromParent();
    node.parent = this;
    this.children.push(node);

    node.updateWorldMatrix(false, true);

    node.dispatchEvent({ type: 'addedEvent', parent: this });
    node.dispatchEvent({ type: 'childaddedEvent', child: node });

    return this;
  }

  /**
   * Returns a vector representing the position of the Node3D object in world space
   *
   * @param target - The target vector the result is stored to
   * @returns The Node3D object's position in world space
   */
  public getWorldPosition(target: Vector3): Vector3 {
    this.updateWorldMatrix(true, false);

    return target.setFromMatrixPosition(this.matrixWorld);
  }

  /**
 * Returns a Quaternion representing the rotation of the Node3D object in world space
 *
 * @param target - The target Quaternion the result is stored to.
 * @returns The Node3D object's rotation in world space
 */
  public getWorldQuaternion(target: Quaternion): Quaternion {
    this.updateWorldMatrix(true, false);

    this.matrixWorld.decompose(_position, target, _scale);

    return target;
  }

  /**
   * Returns a vector representing the scale of the Node3D object in world space
   *
   * @param target - The target vector the result is stored to
   * @returns The Node3D object's scale in world space
   */
  public getWorldScale(target: Vector3): Vector3 {
    this.updateWorldMatrix(true, false);

    this.matrixWorld.decompose(_position, _quaternion, target);

    return target;
  }

  /**
   * Returns a vector representing the ("look") direction of the Node3D object in world space
   *
   * @param target - The target vector the result will be stored to
   * @returns The Node3D object's direction in world space
   */
  public getWorldDirection(target: Vector3): Vector3 {
    this.updateWorldMatrix(true, false);

    const e = this.matrixWorld.elements;

    return target.set(e[8], e[9], e[10]).normalize();
  }

  /**
   * Abstract method to get intersections between a casted ray and this Node3D object
   *
   * @remarks
   * Renderable Node3D objects such as {@link Mesh}, {@link Line} or {@link Points}
   * ement this method in order to use raycasting
   *
   * @abstract
   * @param raycaster - The raycaster
   * @param intersects - An array holding the result of the method
   */
  public raycast(raycaster: Raycaster, intersects: RaycasterIntersection[]) { }



  /**
   * Updates the transformation matrix in local space by computing it from the
   * current position, rotation and scale values.
   *
   * @remarks
   * Uses:
   * matrix = T(position) * R(quaternion) * S(scale)
   */
  public updateMatrix(): void {
    this.matrix.compose(this.position, this.quaternion, this.scale);

    // Ensures consistency when local transforms are modified
    this.matrixWorldNeedsUpdate = true;
  }

  /**
   * Updates the transformation matrix in world space of the 3D objects and its descendants
   *
   * @remarks
   * Does the following:
   * 1. Update local TRS -> matrix if needed
   * 2. Update world matrixWorld if:
   * -  the node is dirty (matrixWorldNeedsUpdate)
   * -  Or Parent forced a recompute (forece = true)
   * 3. Recursively ensure all children update their world matrices, forcing
   *    updates when required
   *
   * This is the standard scene-graph propagation algorithm used in game engines
   * & 3D frameworks
   *
   *
   * To ensure correct results, this method also recomputes the Node3D object's
   * transformation matrix in local space. The computation of the local and world
   * matrix can be controlled with the {@link Node3D#matrixAutoUpdate} and
   * {@link Node3D#matrixWorldAutoUpdate} flags which are both `true` by default
   * Set thest flags to `false` if you need more control over the update matrix process
   *
   * @param force - When set to `true`, a recomputation of the word matrices is forced
   * even when {@link Node3D#matrixWorldAutoUpdate} is set to `false'
   */
  public updateMatrixWorld(force: boolean = false): void {
    /**
     * Update this node's local matrix
     *
     * If this.matrixAutoUpdate = true:
     * the node's local matrix (this.matrix) is recomputed from
     * -  position
     * -  rotation / quaterion
     * -   scale
     * This is the standard TRS -> matrix step
     *
     * If this.matrixAutoUpdate = false:
     * the user is manually managing this.matrix
     */
    if (this.matrixAutoUpdate) this.updateMatrix();

    /**
     * Recompute this node's world matrix (conditionally)
     *
     * This block decides whether world-matrix propagation should happen
     *
     * The world matrix is computed if:
     * this.matrixWorldNeedsUpdate = true, OR
     * force === true (forces a recompute)
     */
    if (this.matrixWorldNeedsUpdate || force) {

      if (this.matrixWorldAutoUpdate === true) {

        /**
         * Case A - root node (no parent)
         *
         * matrixWorld = localMatrix
         */
        if (this.parent === null) {

          this.matrixWorld.copy(this.matrix);

          /**
           * Case B - child node
           *
           * matrixWorld = parentMatrix * matrix
           */
        } else {

          if (this.parent instanceof Node3D) {
            this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
          }

        }

      }

      /**
       * After a world-matrix update, children will always be forced to recompute their
       * world matrices.
       * This is how to ensure consistency even when parent changes
       */
      this.matrixWorldNeedsUpdate = false;

      force = true;
    }

    // make sure descendants are updated if required
    /**
     * Recursively update all descendant nodes
     *
     * Every child sees the update value of force:
     * -  If this node recomputed its world matrix -> children get force = true
     * -  If not -> children get force = false, and will only update if their own
     * world matrix is dirty
     */
    const children = this.children;

    for (let i = 0, l = children.length; i < l; i++) {

      const child = children[i];

      if (child instanceof Node3D) {
        child.updateMatrixWorld(force);
      }
    }
  }

  /**
   * An alternative version of {@link Node3D#updateMatrixWorld} with more control
   * over the update of ancestor and descendant nodes.
   *
   * @param updateParents - whether ancestor nodes should be updated or not
   * @param updateChildren - Whether descendant nodes should be updated or not
   */
  public updateWorldMatrix(updateParents: boolean = false, updateChildren: boolean = false): void {
    const parent = this.parent;

    /**
     * Update parent chain if requested, by walking up the parent chain
     * updating the world matrices of all ancestors
     * But ancestors do not update thier children because updateChildren = false
     */
    if (updateParents === true && parent !== null) {

      if (parent instanceof Node3D) {
        parent.updateWorldMatrix(true, false);
      }

    }

    /**
     * Update this node's local matrix if automatic local matrix update
     * are enabled, recompute matrix = TRS(position, rotation, scale)
     */
    if (this.matrixAutoUpdate) this.updateMatrix();

    /**
     * Update this node's matrix world
     * If root node -> world matrix = local matrix
     * If child node -> world matrix = parentWorld * localMatrix
     * This is standard scene-graph propagation
     */
    if (this.matrixWorldAutoUpdate === true) {

      if (this.parent === null) {

        this.matrixWorld.copy(this.matrix);

      } else {

        if (this.parent instanceof Node3D) {
          this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
        }
      }
    }

    // make sure descendants are updated
    /**
     * update descendant nodes if requested
     *
     * If children is true:
     * Recursively update all children
     * Child updates do not update parents (updateParents = false)
     * But they do update their own children (updateChildren = true)
     */
    if (updateChildren === true) {

      const children = this.children;

      for (let i = 0, l = children.length; i < l; i++) {

        const child = children[i];

        if (child instanceof Node3D) {
          child.updateWorldMatrix(false, true);
        }

      }

    }
  }



  // TODO: ement ToJSON function
  /**
   * Serializes this node to a JSON object.
   *
   * @see {@link ObjectLoader#parse}
   *
   * @param meta - Optional metadata for the serialization process
   * @returns The serialized JSON object
   */
  public toJSON(meta?: object | string): any {
    // this function will be emented later
    // return JSON.stringify({});


    // meta is a string when called from JSON.stringify
    const isRootNode = (meta === undefined || typeof meta === 'string');

    const output: Partial<Node3DOutputJSON> = {};

    /**
     * meta is a has used to collect geometries, materials
     * not providing it ies that this is the root Node
     * being serialized
     */
    if (isRootNode) {
      // initialize meta obj
      meta = {
        geometries: {},
        materials: {},
        textures: {},
        images: {},
        shapes: {},
        skeletons: {},
        animations: {},
        nodes: {}
      };

      output.meta = {
        version: 1.0,
        type: 'Node3D',
        generator: 'Node3D.toJSON'
      };
    }

    // standard Node3D serialization
    const node: Partial<Node3DJSON> = {}

    node.uuid = this.uuid;
    node.type = this.type;

    if (this.name !== '') node.name = this.name;
    if (this.castShadow === true) node.castShadow = true;
    if (this.recieveShadow === true) node.recieveShadow = true;
    if (this.visible === false) node.visible = false;
    if (this.frustumCulled === false) node.frustumCulled = false;
    if (this.renderOrder !== 0) node.renderOrder = this.renderOrder;
    if (Object.keys(this.userData).length > 0) node.userData = this.userData;

    node.layers = this.layers.mask;

    // return JSON.stringify({});
    return { ...output, node };
  }

  /**
   * Returns a new Node with copied values from this instance.
   *
   * @param recursive - If true, child nodes will also be cloned
   * @returns The cloned node
   */
  public clone(this: this, recursive: boolean = true): this {
    // const Ctor = this.constructor as { new(): this };

    // return new Ctor().copy(this, recursive);

    return new Node3D().copy(this, recursive) as this;
  }

  /**
   * Copies the values of the given Node object to this instance.
   *
   * @param source - The Node to copy from
   * @param recursive - If true, child nodes will also be copied
   * @returns A reference to this instance
   */
  public copy(source: Node3D, recursive?: boolean): this {
    this.name = source.name;

    this.up.copy(source.up);

    this.position.copy(source.position);
    this.rotation.order = source.rotation.order;
    this.quaternion.copy(source.quaternion);
    this.scale.copy(source.scale);

    this.matrix.copy(source.matrix);
    this.matrixWorld.copy(source.matrixWorld);

    this.matrixAutoUpdate = source.matrixAutoUpdate;

    this.matrixWorldAutoUpdate = source.matrixWorldAutoUpdate;
    this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

    this.layers.mask = source.layers.mask;
    this.visible = source.visible;

    this.castShadow = source.castShadow;
    this.recieveShadow = source.recieveShadow;

    this.frustumCulled = source.frustumCulled;
    this.renderOrder = source.renderOrder;

    this.animations = source.animations.slice();

    this.userData = JSON.parse(JSON.stringify(source.userData));

    if (recursive === true) {
      for (let i = 0, l = source.children.length; i < l; i++) {
        const child = source.children[i];
        this.add(child.clone());
      }
    }

    return this;
  }




  /**
  * The default up direction for objects, also used as the default
  * position for {@link DirectionalLight} and {@link HemisphereLight}
  *
  * @defaultValue (0, 1, 0)
  */
  public static readonly DEFAULT_UP: Vector3 = /*@__PURE__*/ new Vector3(0, 1, 0);

  /**
   * The default setting for {@link Node3D.matrixAutoUpdate}
   * for newly created 3D Nodes
   *
   * @defaultValue true
   */
  public static readonly DEFAULT_MATRIX_AUTO_UPDATE: boolean = true;

  /**
   * The default setting for {@link Node3D#matrixWorldAutoUpdate}
   *
   * @defaultValue true
   */
  public static readonly DEFAULT_WORLD_MATRIX_AUTO_UPDATE: boolean = true;
}
