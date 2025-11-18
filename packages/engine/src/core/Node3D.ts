import type { Vector3 } from "../math/Vector3";
import type { Euler } from "../math/Euler";
import type { Quaternion } from "../math/Quaternion";
import type { Matrix4 } from "../math/Matrix4";
import type { Layers } from "./Layers";
import type { AnimationClip } from "../animation/AnimationClip";
import type { Material } from "../materials/Material";

import { SpatialNode } from "./SpatialNode";
import { Vector3 as Vector3Impl } from "../math/Vector3";
import { Euler as EulerImpl } from "../math/Euler";
import { Quaternion as QuaternionImpl } from "../math/Quaternion";
import { Matrix4 as Matrix4Impl } from "../math/Matrix4";
import { Layers as LayersImpl } from './Layers';
import { Camera } from "../cameras/Camera";

type UserDataValue = string | number | null | UserDataValue[] | { [key: string]: UserDataValue };

/**
 * Node3D uses WebGL object
 *
 */
export class Node3D extends SpatialNode {

  /**
  * this flag can be used for type testing.
  *
  * @type {boolean}
  * @readonly
  * @defaultValue true
  */
  public readonly isNode3D: boolean = true;

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
  public position: Vector3 = new Vector3Impl();

  /**
   * Represents the node's local rotation as Euler angles, in radians.
   *
   * @name Node3D#rotation
   * @defaultValue (0, 0, 0)
   */
  public rotation: Euler = new EulerImpl();

  /**
   * Represents the node's local rotation as a quaternion.
   *
   * @name Node3D#quaternion
   * @defaultValue (0, 0, 0, 1)
   */
  public quaternion: Quaternion = new QuaternionImpl();

  /**
   * Represents the node's local scale in 3D space.
   *
   * @name Node3D#scale
   * @defaultValue (1, 1, 1)
   */
  public scale: Vector3 = new Vector3Impl(1, 1, 1);

  /**
   * Represents the node's transformation matrix in local/model space
   *
   * @name Node3D#matrix
 */
  public matrix: Matrix4 = new Matrix4Impl();

  /**
   * Represents the node's transformation matrix in world space.
   *
   * @remarks
   * If the Node3D has no parent, then it's identical to
   * the local transformation matrix {@link Node3D#matrix}
   *
   * @name Node3D#worldMatrix
   */
  public worldMatrix: Matrix4 = new Matrix4Impl();

  /**
   * Represents the node's normal matrix
   *
   * @name Node3D#normalMatrix
   */
  public normalMatrix: Matrix4 = new Matrix4Impl();

  /**
   * Represents the node's model-view matrix
   *
   * @name Node3D#modelViewMatrix
   */
  public modelViewMatrix: Matrix4 = new Matrix4Impl();

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
  public layers: Layers = new LayersImpl();

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
   */
  public customDepthMaterial: Material | undefined = undefined;

  /**
   * Same as {@link Node3D#customDepthMaterial}, but used with {@link PointLigh}
   *
   * @remarks
   * Only relevant in the context of {@link WebGLRenderer}
   */
  public customDistanceMaterial: Material | undefined = undefined;

  /**
   * An object that can be used to store custom data about the Node3D.
   *
   * @remarks
   * It should not hold references to functions as these will not be cloned
   */
  public userData: { [key: string]: UserDataValue } = {}

  /**
   * Constructs a Node3D instance
   */
  constructor() {
    super();

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
   * A callback that is executed immediately before a Node3D object is rendered
   * to a shadow map
   *
   * @param renderer - The renderer
   * @param Node3D - The Node3D being rendered
   * @param camera - The camera that is used to render the scene
   * @param shadowCamera - The shadow camera
   * @param geometry - The Node3D's geometry
   * @param depthMaterial - The depth material
   * @param group - The geometry group data
   */
  public onBeforeRender(
    renderer: any,
    Node3D: Node3D,
    camera: Camera,
    shadowCamera: Camera,
    geometry: any,
    depthMaterial: any,
    group: any
  ): void {
    // empty
  }





  /**
   * Serializes this node to a JSON object.
   *
   * @param meta - Optional metadata for the serialization process
   * @returns The serialized JSON object
   */
  public toJSON(meta?: object | string): any {
    throw new Error('Method not implemented.');
  }

  /**
   * Returns a new Node with copied values from this instance.
   *
   * @param recursive - If true, child nodes will also be cloned
   * @returns The cloned node
   */
  public clone(recursive?: boolean): this {
    throw new Error('Method not implemented.');
  }

  /**
   * Copies the values of the given Node object to this instance.
   *
   * @param source - The Node to copy from
   * @param recursive - If true, child nodes will also be copied
   * @returns A reference to this instance
   */
  public copy(source: this, recursive?: boolean): this {
    throw new Error('Method not implemented.');
  }




  /**
  * The default up direction for objects, also used as the default
  * position for {@link DirectionalLight} and {@link HemisphereLight}
  *
  * @defaultValue (0, 1, 0)
  */
  public static readonly DEFAULT_UP: Vector3 = /*@__PURE__*/ new Vector3Impl(0, 1, 0);

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
