import { Node3D } from "../core/Node3D";

/**
 * This is almost identical to SpatialNode, but
 * it is used as a base class for grouping objects.
 */
export class Group3D extends Node3D {

  /**
  * this flag can be used for type testing.
  *
  * @type {boolean}
  * @readonly
  * @defaultValue true
  */
  public readonly isGroup: boolean = true;

  /**
 * The type property is used for detecting the object type
 * in context of serialization/deserialization
 *
 * @readonly
 */
  public readonly type: string = 'Node';

  /**
   * Constructs a new Group.
   */
  constructor() {
    super();
    this.type = 'Group';
  }

}


