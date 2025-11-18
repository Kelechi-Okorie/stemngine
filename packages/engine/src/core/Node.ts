import { BaseEvent, EventDispatcher } from "./EventDispatcher";
import { generateUUID } from "../math/MathUtils";

let _nodeId = 0;


/* Node is an abstraction of "something that exists in the world". Everything visual,
 * interactive, or logical (like a particle, a robot arm, a UI widget in 3d, or even,
 * a simulation node) can inherit from it.
 *
 * TODO: To be removed. Some may have moved to other specialized classes
 * @remarks
 * Node defines the following
 * 1. Identity and metadata
 * 2. Hierarchy and relationships
 * 3. Transform system
 * 4. Visibility and rendering hints
 * 5. Events
 * 6. Serialization
 * 7. Physics/Simulation data
 * 8. Interaction flag
 * 9. Rendering data
 * 10. Animation / time-based state
 *
 * @augments EventDispatcher
 */
export abstract class Node extends EventDispatcher {
  /**
   * this flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @defaultValue true
 */
  public readonly isNode: boolean = true;

  /**
   * The ID of the node.
   *
   * @name Node#id
   * @readonly
 */
  public readonly id: number;

  /**
   * The UUID of the node
   *
   * @readonly
   */
  public readonly uuid: string = generateUUID();

  /**
   * The name of the node
   */
  public name: string = '';

  /**
   * The type property is used for detecting the object type
   * in context of serialization/deserialization
   *
   * @readonly
   */
  public readonly type: string = 'Node';

  /**
   * When set to `true`, this node will be rendered in the scene.
   *
   * @remarks
   * This is a hint for renderers. Some renderers may choose to ignore this
   * property depending on the use-case.
   */
  public readonly visible: boolean = true;

  /**
   * Constructs a new node.
   */
  constructor() {
    super();
    this.id = _nodeId++;
  }

  /**
   * Serializes this node to a JSON object.
   *
   * @param meta - Optional metadata for the serialization process
   * @returns The serialized JSON object
   */
  abstract toJSON(meta?: object | string): any;

  /**
   * Returns a new Node with copied values from this instance.
   *
   * @param recursive - If true, child nodes will also be cloned
   * @returns The cloned node
   */
  abstract clone(recursive?: boolean): this;

  /**
   * Copies the values of the given Node object to this instance.
   *
   * @param source - The Node to copy from
   * @param recursive - If true, child nodes will also be copied
   * @returns A reference to this instance
   */
  abstract copy(source: this, recursive?: boolean): this;
}
