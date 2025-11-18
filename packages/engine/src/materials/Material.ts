import { EventDispatcher } from "../core/EventDispatcher";
import { generateUUID } from "../math/MathUtils";

let _materialId = 0;

/**
 * Abstract class for materials.
 *
 * Materials define the appearance of renderable Node3D.
 *
 * @abstract
 * @augments EventDispatcher
 */
export abstract class Material extends EventDispatcher {
  /**
 * this flag can be used for type testing.
 *
 * @type {boolean}
 * @readonly
 * @defaultValue true
*/
  public readonly isMaterial: boolean = true;

  /**
 * The ID of the material.
 *
 * @name Node#id
 * @readonly
*/
  public readonly id: number;

  /**
   * The UUID of the material
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
  public readonly type: string = 'Material';

  /**
   * Constructs a new Material
   */
  constructor() {
    super();

    this.id = _materialId++;
  }
}
