import type { Vector3 } from '../math/Vector3';
import type { Euler } from '../math/Euler';
import type { Quaternion } from '../math/Quaternion';
import type { Vector2 } from '../math/Vector2';

import { Node } from './Node';
import { BaseEvent } from './EventDispatcher';

export interface NodeEvents extends Record<string, BaseEvent> {
  addedEvent: { type: 'addedEvent'; parent: SpatialNode | null };
  removedEvent: { type: 'removedEvent'; parent: SpatialNode | null };
  childaddedEvent: { type: 'childaddedEvent', child: SpatialNode | null };
  childremovedEvent: { type: 'childremovedEvent', child: SpatialNode | null };
}

/**
 * Spatial Node
 */
export abstract class SpatialNode extends Node {

  /**
  * this flag can be used for type testing.
  *
  * @type {boolean}
  * @readonly
  * @defaultValue true
  */
  public readonly isSpatialNode: boolean = true;

  /**
   * A reference to the parent object
   */
  public parent: SpatialNode | null = null;

  /**
   * An array holding the child objects of this Node instance
   */
  public children: SpatialNode[] = [];

  /**
   * Constructs a new SpatialNode
   */
  constructor() {
    super();
  }

  /**
 * Adds the given Node as a child to this node.
 *
 * @fires Node#added
 * @fires Node#childadded
 * @param child - The node to add
 * @returns A reference to this instance
 */
  public add(child: SpatialNode): this {
    if (child === this) {
      console.error('SpatialNode.add: object can\'t be added as a child of itself.', child);
      return this;
    }

    if (!child.isNode) {
      console.error('Can only add instances of SpatialNode');
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
  public addChildren(children: SpatialNode[]): this {
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
  public remove(child: SpatialNode): this {
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
  public removeChildren(children: SpatialNode[]): this {
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
   * @fires SpatialNode#removed
   * @fires SpatialNode#childremoved
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
   * @fires SpatialNode#removed
   * @fires SpatialNode#childremoved
   * @returns A reference to this instance
   */
  public clear(): this {
    return this.removeChildren(this.children);
  }

  /**
   * Searches through the SpatialNode and its children, starting with this node
   * itself and returns the first node with a matching ID
   *
   * @param id - The id
   * @returns The first node found with this id or undefined if no node has this id
   */
  public getObjectById(id: number): SpatialNode | undefined {
    return this.getObjectByProperty('id', id);
  }

  /**
   * Searches through the SpatialNode and its children, starting with this node
   * itself, and returns the first node with the matching name
   *
   * @param name - The name to search with
   *  @returns The first node found with this name or undefined if none was found
   */
  public getObjectByName(name: string): SpatialNode | undefined {
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
  public getObjectByProperty<K extends keyof SpatialNode>(
    name: K,
    value: SpatialNode[K]
  ): SpatialNode | undefined {
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
   * Executes the callback on this node and all its children
   *
   * @remarks
   * Modifying the scene graph inside the callback can lead to unexpected results
   * and is discouraged.
   *
   * @param callback - The callback to execute
   */
  public traverse(callback: (node: SpatialNode) => void): void {
    callback(this);

    const children = this.children;
    for (let i = 0, l = children.length; i < l; i++) {
      children[i].traverse(callback);
    }
  }

  /**
   * Similar to {@link SpatialNode.traverse}, but traverses only the visible children,
   * Descendants of invisible Nodes are not traversed.
   *
   * @remarks
   * Modyfying the scene graph inside the callback can lead to unexpected results
   * and is discouraged.
   *
   * @param callback - The callback to execute
   */
  public traverseVisible(callback: (node: SpatialNode) => void): void {
    if (!this.visible) return;

    callback(this);

    const children = this.children;
    for (let i = 0, l = children.length; i < l; i++) {
      children[i].traverseVisible(callback);
    }
  }

  /**
   * Similar to {@link SpatialNode.traverse}, but traverses only the ancestors of
   * this Node.
   *
   * @remarks
   * Modyfying the scene graph inside the callback can lead to unexpected results
   * and is discouraged.
   *
   * @param callback - The callback to execute
   */
  public traverseAncestors(callback: (node: SpatialNode) => void): void {
    const parent = this.parent;
    if (parent !== null) {
      callback(parent);
      parent.traverseAncestors(callback);
    }
  }

  abstract onRotationChange(): void;
}
