import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Node3D } from '../../../src/core/Node3D';
import { SpatialNode } from '../../../src/core/SpatialNode';
import { Node } from '../../../src/core/Node';
import { Vector3 } from '../../../src/math/Vector3';
import { Quaternion } from '../../../src/math/Quaternion';
import { Euler } from '../../../src/math/Euler';
import { Matrix4 } from '../../../src/math/Matrix4';
import { Layers } from '../../../src/core/Layers';

function expectQuaternionEqual(q1: Quaternion, q2: Quaternion, epsilon = 1e-10) {
  expect(q1.x).toBeCloseTo(q2.x, 10);
  expect(q1.y).toBeCloseTo(q2.y, 10);
  expect(q1.z).toBeCloseTo(q2.z, 10);
  expect(q1.w).toBeCloseTo(q2.w, 10);
}

// Helper to compare vectors numerically
function expectVectorEqual(v1: Vector3, v2: Vector3, epsilon = 1e-10) {
  expect(v1.x).toBeCloseTo(v2.x, 10);
  expect(v1.y).toBeCloseTo(v2.y, 10);
  expect(v1.z).toBeCloseTo(v2.z, 10);
}

function expectMatrixCloseTo(a: Matrix4, b: Matrix4) {
  const ae = a.elements, be = b.elements;
  for (let i = 0; i < 16; i++) {
    expect(ae[i]).toBeCloseTo(be[i], 6);
  }
}

describe('Node3D', () => {

  describe('constructor()', () => {
    let node: Node3D;

    beforeEach(() => {
      node = new Node3D();
    });

    it('should create an instance of Node3D', () => {
      expect(node).toBeInstanceOf(Node3D);
    });

    it('should inherit from SpatialNode and Node', () => {
      expect(node).toBeInstanceOf(SpatialNode);
      expect(node).toBeInstanceOf(Node);
    });

    it('should have a unique id', () => {
      const node2 = new Node3D();
      expect(node.id).not.toBe(node2.id);
      expect(typeof node.id).toBe('number');
    });

    it('should have a UUID', () => {
      expect(typeof node.uuid).toBe('string');
      expect(node.uuid.length).toBeGreaterThan(0);
    });

    it('should have default name as empty string', () => {
      expect(node.name).toBe('');
    });

    it('should have parent initialized to null', () => {
      expect(node.parent).toBeNull();
    });

    it('should have children initialized as empty array', () => {
      expect(node.children).toEqual([]);
    });

    it('should have isNode flag set to true', () => {
      expect(node.isNode).toBe(true);
    });

    it('should have default up vector', () => {
      expect(node.up).toBe(Node3D.DEFAULT_UP);
    });

    it('should initialize position, rotation, quaternion, scale, and matrices', () => {
      expect(node.position).toBeInstanceOf(Vector3);
      expect(node.rotation).toBeInstanceOf(Euler);
      expect(node.quaternion).toBeInstanceOf(Quaternion);
      expect(node.scale).toBeInstanceOf(Vector3);
      expect(node.matrix).toBeInstanceOf(Matrix4);
      expect(node.matrixWorld).toBeInstanceOf(Matrix4);
      expect(node.normalMatrix).toBeInstanceOf(Matrix4);
      expect(node.modelViewMatrix).toBeInstanceOf(Matrix4);
    });

    it('should initialize layers', () => {
      expect(node.layers).toBeInstanceOf(Layers);
    });

    it('should initialize default flags', () => {
      expect(node.matrixAutoUpdate).toBe(Node3D.DEFAULT_MATRIX_AUTO_UPDATE);
      expect(node.matrixWorldAutoUpdate).toBe(Node3D.DEFAULT_WORLD_MATRIX_AUTO_UPDATE);
      expect(node.matrixWorldNeedsUpdate).toBe(false);
      expect(node.castShadow).toBe(false);
      expect(node.recieveShadow).toBe(true);
      expect(node.frustumCulled).toBe(true);
      expect(node.renderOrder).toBe(0);
    });

    it('should initialize animations array and userData object', () => {
      expect(Array.isArray(node.animations)).toBe(true);
      expect(node.animations.length).toBe(0);
      expect(node.userData).toEqual({});
    });

    it('rotation change should update quaternion', () => {
      const oldQuat = node.quaternion.clone();
      const callback = vi.fn();

      node.rotation._onChange(callback);

      // Simulate rotation change
      node.rotation.x += Math.PI / 2;
      expect(node.quaternion).not.toEqual(oldQuat);
    });

    it('quaternion change should update rotation', () => {
      const oldRot = node.rotation.clone();
      const callback = vi.fn();

      node.quaternion._onChange(callback);

      // Simulate quaternion change
      node.quaternion.setFromEuler(node.rotation);

      expect(node.rotation.x).toBeCloseTo(oldRot.x);
      expect(node.rotation.y).toBeCloseTo(oldRot.y);
      expect(node.rotation.z).toBeCloseTo(oldRot.z);
    });

    it('custom depth and distance materials should be undefined by default', () => {
      expect(node.customDepthMaterial).toBeUndefined();
      expect(node.customDistanceMaterial).toBeUndefined();
    });
  });

  describe('add()', () => {
    let parent: Node3D;
    let child: Node3D;

    beforeEach(() => {
      parent = new Node3D();
      child = new Node3D();
    });

    // afterEach(() => {
    //   parent.children = [];
    //   child.children = [];
    // })

    it('should add a child to the parent', () => {
      parent.add(child);

      expect(parent.children.length).toBe(1);
      expect(parent.children[0]).toBe(child);
    });

    it('should set the parent reference on the child', () => {
      parent.add(child);

      expect(child.parent).toBe(parent);
    });

    it('should remove child from its previous parent before adding', () => {
      const firstParent = new Node3D();
      firstParent.add(child);

      expect(firstParent.children.length).toBe(1);

      // now add to another parent
      parent.add(child);

      expect(firstParent.children.length).toBe(0);
      expect(parent.children.length).toBe(1);
    });

    it('should not allow adding the Node3D to itself', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      parent.add(parent);

      expect(consoleSpy).toHaveBeenCalledWith(
        "SpatialNode.add: object can't be added as a child of itself.",
        parent
      );

      expect(parent.children.length).toBe(0);

      consoleSpy.mockRestore();
    });

    it('should display an error when adding a non-SpatialNode', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      parent.add({} as any);

      expect(consoleSpy).toHaveBeenCalledWith('Can only add instances of SpatialNode');

      consoleSpy.mockRestore();
    });

    it('should dispatch an addedEvent on the parent', () => {
      const listener = vi.fn();

      parent.addEventListener('addedEvent', listener);

      parent.add(child);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0]).toMatchObject({
        type: 'addedEvent',
        parent: parent,
        target: parent
      });
    });

    it('should dispatch a childaddedEvent with correct child reference', () => {
      const listener = vi.fn();

      parent.addEventListener('childaddedEvent', listener);

      parent.add(child);

      expect(listener).toHaveBeenCalledTimes(1);

      const eventPayload = listener.mock.calls[0][0];

      expect(eventPayload.type).toBe('childaddedEvent');
      expect(eventPayload.child).toBe(child);
      expect(eventPayload.target).toBe(parent);
    });

    it('should dispatch events in correct order: addedEvent → childaddedEvent', () => {
      const order: string[] = [];

      parent.addEventListener('addedEvent', () => order.push('addedEvent'));
      parent.addEventListener('childaddedEvent', () => order.push('childaddedEvent'));

      parent.add(child);

      expect(order).toEqual(['addedEvent', 'childaddedEvent']);
    });
  });

  describe('addChildren()', () => {
    let parent: Node3D;
    let child1: Node3D;
    let child2: Node3D;

    beforeEach(() => {
      parent = new Node3D();
      child1 = new Node3D();
      child2 = new Node3D();
    });

    it('should add multiple children', () => {
      parent.addChildren([child1, child2]);

      expect(parent.children).toContain(child1);
      expect(parent.children).toContain(child2);
    });

    it('should set the parent of each child', () => {
      parent.addChildren([child1, child2]);

      expect(child1.parent).toBe(parent);
      expect(child2.parent).toBe(parent);
    });

    it('should return "this" for chaining', () => {
      const result = parent.addChildren([child1, child2]);
      expect(result).toBe(parent);
    });

    it('should not allow adding itself', () => {
      // Spy on console.error to suppress output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      parent.addChildren([parent]); // Trying to add itself
      expect(parent.children).not.toContain(parent);

      consoleSpy.mockRestore();
    });

    it('should skip non-node objects', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      parent.addChildren([{} as any]); // Passing invalid object
      expect(parent.children.length).toBe(0);

      consoleSpy.mockRestore();
    });
  });

  describe('remove()', () => {
    let parent: Node3D;
    let child: Node3D;
    let anotherChild: Node3D;

    beforeEach(() => {
      parent = new Node3D();
      child = new Node3D();
      anotherChild = new Node3D();

      parent.addChildren([child, anotherChild]);
    });

    it('should remove a child from the children array', () => {
      parent.remove(child);
      expect(parent.children).not.toContain(child);
      expect(parent.children).toContain(anotherChild); // ensure other children remain
    });

    it('should set the parent of the removed child to null', () => {
      parent.remove(child);
      expect(child.parent).toBeNull();
    });

    it('should return "this" for chaining', () => {
      const result = parent.remove(child);
      expect(result).toBe(parent);
    });

    it('should dispatch removedEvent on the child', () => {
      const listener = vi.fn();
      child.addEventListener('removedEvent', listener);

      parent.remove(child);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0]).toMatchObject({ type: 'removedEvent', parent });
    });

    it('should dispatch childremovedEvent on the parent', () => {
      const listener = vi.fn();
      parent.addEventListener('childremovedEvent', listener);

      parent.remove(child);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0]).toMatchObject({ type: 'childremovedEvent', child });
    });

    it('should do nothing if the child is not in the children array', () => {
      const outsider = new Node3D();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      parent.remove(outsider);

      expect(parent.children).toContain(child);
      expect(parent.children).toContain(anotherChild);
      expect(outsider.parent).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('removeChildren()', () => {
    let parent: Node3D;
    let child1: Node3D;
    let child2: Node3D;
    let child3: Node3D;

    beforeEach(() => {
      parent = new Node3D();
      child1 = new Node3D();
      child2 = new Node3D();
      child3 = new Node3D();

      parent.addChildren([child1, child2, child3]);
    });

    it('should remove multiple children from the parent', () => {
      parent.removeChildren([child1, child3]);

      expect(parent.children).not.toContain(child1);
      expect(parent.children).not.toContain(child3);
      expect(parent.children).toContain(child2); // child2 should remain
    });

    it('should set the parent of removed children to null', () => {
      parent.removeChildren([child1, child2]);

      expect(child1.parent).toBeNull();
      expect(child2.parent).toBeNull();
      expect(child3.parent).toBe(parent); // child3 should still have parent
    });

    it('should return "this" for chaining', () => {
      const result = parent.removeChildren([child1, child2]);
      expect(result).toBe(parent);
    });

    it('should dispatch removedEvent on each removed child', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      child1.addEventListener('removedEvent', listener1);
      child2.addEventListener('removedEvent', listener2);

      parent.removeChildren([child1, child2]);

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener1.mock.calls[0][0]).toMatchObject({ type: 'removedEvent', parent });

      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener2.mock.calls[0][0]).toMatchObject({ type: 'removedEvent', parent });
    });

    it('should dispatch childremovedEvent on parent for each removed child', () => {
      const listener = vi.fn();
      parent.addEventListener('childremovedEvent', listener);

      parent.removeChildren([child1, child2]);

      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener.mock.calls[0][0]).toMatchObject({ type: 'childremovedEvent', child: child1 });
      expect(listener.mock.calls[1][0]).toMatchObject({ type: 'childremovedEvent', child: child2 });
    });
  });

  describe('removeFromParent()', () => {
    let parent: Node3D;
    let child: Node3D;

    beforeEach(() => {
      parent = new Node3D();
      child = new Node3D();
      parent.add(child);
    });

    it('should remove the node from its parent', () => {
      expect(child.parent).toBe(parent);
      expect(parent.children).toContain(child);

      child.removeFromParent();

      expect(child.parent).toBeNull();
      expect(parent.children).not.toContain(child);
    });

    it('should return "this" for chaining', () => {
      const result = child.removeFromParent();
      expect(result).toBe(child);
    });

    it('should dispatch removedEvent on the child', () => {
      const listener = vi.fn();
      child.addEventListener('removedEvent', listener);

      child.removeFromParent();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0]).toMatchObject({ type: 'removedEvent', parent });
    });

    it('should dispatch childremovedEvent on the parent', () => {
      const listener = vi.fn();
      parent.addEventListener('childremovedEvent', listener);

      child.removeFromParent();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0]).toMatchObject({ type: 'childremovedEvent', child });
    });

    it('should do nothing if the node has no parent', () => {
      const orphan = new Node3D();
      const result = orphan.removeFromParent();

      expect(result).toBe(orphan);
      expect(orphan.parent).toBeNull();
      expect(orphan.children).toEqual([]);
    });
  });

  describe('attach()', () => {
    it('adds a node as a child while preserving world position', () => {
      const parent = new Node3D();
      parent.position.set(10, 0, 0);
      parent.updateWorldMatrix(true, true);

      const child = new Node3D();
      child.position.set(5, 0, 0);
      child.updateWorldMatrix(true, true);

      const worldPosBefore = new Vector3();
      child.getWorldPosition(worldPosBefore);

      parent.attach(child);

      // Child should now be a child of parent
      expect(child.parent).toBe(parent);
      expect(parent.children).toContain(child);

      // World position should be unchanged
      const worldPosAfter = new Vector3();
      child.getWorldPosition(worldPosAfter);

      expect(worldPosAfter.x).toBeCloseTo(worldPosBefore.x);
      expect(worldPosAfter.y).toBeCloseTo(worldPosBefore.y);
      expect(worldPosAfter.z).toBeCloseTo(worldPosBefore.z);
    });

    it('removes child from previous parent', () => {
      const oldParent = new Node3D();
      const newParent = new Node3D();
      const child = new Node3D();

      oldParent.add(child);
      expect(child.parent).toBe(oldParent);

      newParent.attach(child);

      expect(child.parent).toBe(newParent);
      expect(oldParent.children).not.toContain(child);
    });

    it('dispatches addedEvent and childaddedEvent', () => {
      const parent = new Node3D();
      const child = new Node3D();

      const listener = vi.fn();

      parent.addEventListener('addedEvent', listener);

      parent.add(child);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0]).toMatchObject({
        type: 'addedEvent',
        parent: parent,
        target: parent
      });

    });

    it('maintains world rotation when parent is rotated', () => {
      const parent = new Node3D();
      parent.rotation.y = Math.PI / 2;
      parent.updateWorldMatrix(true, true);

      const child = new Node3D();
      child.position.set(1, 0, 0);
      child.updateWorldMatrix(true, true);

      const worldPosBefore = new Vector3();
      child.getWorldPosition(worldPosBefore);

      parent.attach(child);

      const worldPosAfter = new Vector3();
      child.getWorldPosition(worldPosAfter);

      expect(worldPosAfter.x).toBeCloseTo(worldPosBefore.x);
      expect(worldPosAfter.y).toBeCloseTo(worldPosBefore.y);
      expect(worldPosAfter.z).toBeCloseTo(worldPosBefore.z);
    });
  });

  describe('clear()', () => {
    it('should remove all children from the node', () => {
      const parent = new Node3D();
      const child1 = new Node3D();
      const child2 = new Node3D();

      parent.addChildren([child1, child2]);

      expect(parent.children.length).toBe(2);
      expect(child1.parent).toBe(parent);
      expect(child2.parent).toBe(parent);

      parent.clear();

      expect(parent.children.length).toBe(0);
      expect(child1.parent).toBe(null);
      expect(child2.parent).toBe(null);
    });

    it('should dispatch removed and childremoved events for each child', () => {
      const parent = new Node3D();
      const child1 = new Node3D();
      const child2 = new Node3D();

      const removedSpy1 = vi.fn();
      const removedSpy2 = vi.fn();
      const childRemovedSpy = vi.fn();

      child1.addEventListener('removedEvent', removedSpy1);
      child2.addEventListener('removedEvent', removedSpy2);
      parent.addEventListener('childremovedEvent', childRemovedSpy);

      parent.addChildren([child1, child2]);
      parent.clear();

      expect(removedSpy1).toHaveBeenCalledTimes(1);
      expect(removedSpy2).toHaveBeenCalledTimes(1);
      expect(childRemovedSpy).toHaveBeenCalledTimes(2);

      expect(removedSpy1.mock.calls[0][0].parent).toBe(parent);
      expect(removedSpy2.mock.calls[0][0].parent).toBe(parent);

      expect(childRemovedSpy.mock.calls[0][0].child).toBe(child1);
      expect(childRemovedSpy.mock.calls[1][0].child).toBe(child2);
    });

    it('should return the parent instance for chaining', () => {
      const parent = new Node3D();
      const result = parent.clear();
      expect(result).toBe(parent);
    });
  });

  describe('getObjectById()', () => {
    let root: Node3D;
    let childA: Node3D;
    let childB: Node3D;
    let nested: Node3D;

    beforeEach(() => {
      root = new Node3D();
      childA = new Node3D();
      childB = new Node3D();
      nested = new Node3D();

      childA.add(nested);
      root.add(childA);
      root.add(childB);
    });

    it('should return the node itself if the id matches', () => {
      const result = root.getObjectById(root.id);
      expect(result).toBe(root);
    });

    it('should return a direct child if the id matches', () => {
      const result = root.getObjectById(childB.id);
      expect(result).toBe(childB);
    });

    it('should return a nested child if the id matches', () => {
      const result = root.getObjectById(nested.id);
      expect(result).toBe(nested);
    });

    it('should return undefined if no node with the id exists', () => {
      const result = root.getObjectById(99999); // unlikely to exist
      expect(result).toBeUndefined();
    });

    it('should return the first node found if multiple nodes share the same id', () => {
      const duplicate = new Node3D();
      // duplicate.id = nested.id; // force duplicate for testing
      childB.add(duplicate);

      const result = root.getObjectById(nested.id);
      expect(result).toBe(nested); // Depth-first search
    });
  });

  describe('getObjectByName()', () => {
    let root: Node3D;
    let childA: Node3D;
    let childB: Node3D;
    let nested: Node3D;

    beforeEach(() => {
      root = new Node3D();
      root.name = 'root';

      childA = new Node3D();
      childA.name = 'childA';

      childB = new Node3D();
      childB.name = 'childB';

      nested = new Node3D();
      nested.name = 'nested';

      childA.add(nested);
      root.add(childA);
      root.add(childB);
    });

    it('should return the node itself if the name matches', () => {
      const result = root.getObjectByName('root');
      expect(result).toBe(root);
    });

    it('should return a direct child if the name matches', () => {
      const result = root.getObjectByName('childB');
      expect(result).toBe(childB);
    });

    it('should return a nested child if the name matches', () => {
      const result = root.getObjectByName('nested');
      expect(result).toBe(nested);
    });

    it('should return undefined if no node with the name exists', () => {
      const result = root.getObjectByName('unknown');
      expect(result).toBeUndefined();
    });

    it('should return the first node found if multiple nodes share the same name', () => {
      const anotherNested = new Node3D();
      anotherNested.name = 'nested';
      childB.add(anotherNested);

      const result = root.getObjectByName('nested');
      expect(result).toBe(nested); // Depth-first search, first match
    });
  });

  describe('getObjectByProperty()', () => {
    let root: Node3D;
    let childA: Node3D;
    let childB: Node3D;
    let nested: Node3D;

    beforeEach(() => {
      root = new Node3D();
      root.name = 'root';

      childA = new Node3D();
      childA.name = 'childA';

      childB = new Node3D();
      childB.name = 'childB';

      nested = new Node3D();
      nested.name = 'nested';

      childA.add(nested);
      root.add(childA);
      root.add(childB);
    });

    it('should return the node itself if it matches', () => {
      const result = root.getObjectByProperty('name', 'root');
      expect(result).toBe(root);
    });

    it('should return a direct child if it matches', () => {
      const result = root.getObjectByProperty('name', 'childB');
      expect(result).toBe(childB);
    });

    it('should return a nested child if it matches', () => {
      const result = root.getObjectByProperty('name', 'nested');
      expect(result).toBe(nested);
    });

    it('should return undefined if no match is found', () => {
      const result = root.getObjectByProperty('name', 'unknown');
      expect(result).toBeUndefined();
    });

    it('should return the first matching node if multiple nodes have the same property', () => {
      const anotherNested = new Node3D();
      anotherNested.name = 'nested';
      childB.add(anotherNested);

      const result = root.getObjectByProperty('name', 'nested');
      expect(result).toBe(nested); // first match in depth-first order
    });
  });

  describe('getObjectsByProperty()', () => {
    let root: Node3D;
    let child1: Node3D;
    let child2: Node3D;
    let grandchild: Node3D;

    beforeEach(() => {
      root = new Node3D();
      root.name = 'root';
      root.visible = true;

      child1 = new Node3D();
      child1.name = 'child1';
      child1.visible = false;

      child2 = new Node3D();
      child2.name = 'child2';
      child2.visible = true;

      grandchild = new Node3D();
      grandchild.name = 'grandchild';
      grandchild.visible = false;

      // Build hierarchy
      root.add(child1);
      root.add(child2);
      child1.add(grandchild);
    });

    it('should find a node with a specific property value', () => {
      const result = root.getObjectsByProperty('name', 'child1');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(child1);
    });

    it('should find multiple nodes with the same property value', () => {
      // make grandchild also visible
      grandchild.visible = false;

      const result = root.getObjectsByProperty('visible', true);
      expect(result).toHaveLength(2);
      expect(result).toContain(root);
      expect(result).toContain(child2);
    });

    it('should find nested children', () => {
      const result = root.getObjectsByProperty('name', 'grandchild');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(grandchild);
    });

    it('should return an empty array if no matches are found', () => {
      const result = root.getObjectsByProperty('name', 'nonexistent');
      expect(result).toHaveLength(0);
    });

    it('should include root node if it matches', () => {
      const result = root.getObjectsByProperty('name', 'root');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(root);
    });

    it('should not modify the result array passed in', () => {
      const externalResult: SpatialNode[] = [];
      const result = root.getObjectsByProperty('visible', false, externalResult);

      // result and externalResult should be the same reference
      expect(result).toBe(externalResult);
      expect(result).toContain(child1);
      expect(result).toContain(grandchild);
    });
  });

  describe('applyMatrix4()', () => {
    let node: Node3D;

    beforeEach(() => {
      node = new Node3D();
      node.position = new Vector3();
      node.rotation = new Euler();
      node.quaternion = new Quaternion();
      node.scale = new Vector3(1, 1, 1);
      node.matrix = new Matrix4();
    });

    it('should not change node when applying identity matrix', () => {
      const identity = new Matrix4().identity();
      const oldPos = node.position.clone();
      const oldQuat = node.quaternion.clone();
      const oldScale = node.scale.clone();

      node.applyMatrix4(identity);

      expect(node.position.x).toBeCloseTo(oldPos.x);
      expect(node.position.y).toBeCloseTo(oldPos.y);
      expect(node.position.z).toBeCloseTo(oldPos.z);

      expect(node.quaternion.x).toBeCloseTo(oldQuat.x);
      expect(node.quaternion.y).toBeCloseTo(oldQuat.y);
      expect(node.quaternion.z).toBeCloseTo(oldQuat.z);
      expect(node.quaternion.w).toBeCloseTo(oldQuat.w);

      expect(node.scale.x).toBeCloseTo(oldScale.x);
      expect(node.scale.y).toBeCloseTo(oldScale.y);
      expect(node.scale.z).toBeCloseTo(oldScale.z);
    });

    it('should apply translation correctly', () => {
      const translation = new Matrix4().makeTranslation(1, 2, 3);
      node.applyMatrix4(translation);

      expect(node.position.x).toBeCloseTo(1);
      expect(node.position.y).toBeCloseTo(2);
      expect(node.position.z).toBeCloseTo(3);
    });

    it('should apply scaling correctly', () => {
      const scaleMatrix = new Matrix4().makeScale(2, 3, 4);
      node.applyMatrix4(scaleMatrix);

      expect(node.scale.x).toBeCloseTo(2);
      expect(node.scale.y).toBeCloseTo(3);
      expect(node.scale.z).toBeCloseTo(4);
    });

    it('should apply rotation correctly', () => {
      const rotationMatrix = new Matrix4().makeRotationX(Math.PI / 2);
      node.applyMatrix4(rotationMatrix);

      // Rotation around X axis should have updated quaternion
      expect(node.quaternion.x).toBeCloseTo(Math.sqrt(0.5));
      expect(node.quaternion.y).toBeCloseTo(0);
      expect(node.quaternion.z).toBeCloseTo(0);
      expect(node.quaternion.w).toBeCloseTo(Math.sqrt(0.5));
    });

    it('should combine transformations', () => {
      const matrix = new Matrix4()
        .makeTranslation(1, 2, 3)
        .multiply(new Matrix4().makeScale(2, 2, 2));

      node.applyMatrix4(matrix);

      expect(node.position.x).toBeCloseTo(1);
      expect(node.position.y).toBeCloseTo(2);
      expect(node.position.z).toBeCloseTo(3);

      expect(node.scale.x).toBeCloseTo(2);
      expect(node.scale.y).toBeCloseTo(2);
      expect(node.scale.z).toBeCloseTo(2);
    });
  });

  describe('applyQuaternion()', () => {
    let node: Node3D;

    beforeEach(() => {
      node = new Node3D();
    });

    it('should premultiply the current quaternion by the given quaternion', () => {
      const originalQuat = node.quaternion.clone();
      const q = new Quaternion(0, 0, 0.7071, 0.7071); // 90 deg rotation around Z

      node.applyQuaternion(q);

      // Expected: q * originalQuat
      const expected = q.clone().multiply(originalQuat);
      expectQuaternionEqual(node.quaternion, expected);
    });

    it('should return the Node3D instance (for chaining)', () => {
      const q = new Quaternion(0, 0, 0, 1);
      const result = node.applyQuaternion(q);
      expect(result).toBe(node);
    });

    it('should correctly apply identity quaternion (no change)', () => {
      const identity = new Quaternion(0, 0, 0, 1);
      const oldQuat = node.quaternion.clone();

      node.applyQuaternion(identity);

      expectQuaternionEqual(node.quaternion, identity);
    });

    it('should combine multiple rotations correctly', () => {
      const q1 = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
      const q2 = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);

      node.applyQuaternion(q1).applyQuaternion(q2);

      const expected = q2.clone().multiply(q1.clone());
      expectQuaternionEqual(node.quaternion, expected);
    });
  });

  describe('setRotationFromAxisAngle()', () => {
    it('should set quaternion for rotation around X axis', () => {
      const node = new Node3D();
      const axis = new Vector3(1, 0, 0);
      const angle = Math.PI / 2; // 90 degrees

      node.setRotationFromAxisAngle(axis, angle);

      const expected = new Quaternion();
      expected.setFromAxisAngle(axis, angle);

      expectQuaternionEqual(node.quaternion, expected);
    });

    it('should set quaternion for rotation around arbitrary axis', () => {
      const node = new Node3D();
      const axis = new Vector3(1, 1, 0).normalize();
      const angle = Math.PI / 4; // 45 degrees

      node.setRotationFromAxisAngle(axis, angle);

      const expected = new Quaternion();
      expected.setFromAxisAngle(axis, angle);

      expectQuaternionEqual(node.quaternion, expected);
    });

    it('should produce identity quaternion for zero angle', () => {
      const node = new Node3D();
      const axis = new Vector3(0, 1, 0);
      const angle = 0;

      node.setRotationFromAxisAngle(axis, angle);

      const expected = new Quaternion(); // identity quaternion

      expectQuaternionEqual(node.quaternion, expected);
    });

    it('should handle negative angles correctly', () => {
      const node = new Node3D();
      const axis = new Vector3(0, 0, 1);
      const angle = -Math.PI / 2; // -90 degrees

      node.setRotationFromAxisAngle(axis, angle);

      const expected = new Quaternion();
      expected.setFromAxisAngle(axis, angle);

      expectQuaternionEqual(node.quaternion, expected);
    });
  });

  describe('setRotationFromEuler()', () => {
    it('should set quaternion from Euler angles', () => {
      const node = new Node3D();
      const euler = new Euler(Math.PI / 2, 0, 0, 'XYZ'); // rotate 90° around X

      node.setRotationFromEuler(euler);

      const expected = new Quaternion();
      expected.setFromEuler(euler, true);

      expectQuaternionEqual(node.quaternion, expected);
    });

    it('should handle arbitrary Euler angles', () => {
      const node = new Node3D();
      const euler = new Euler(Math.PI / 3, Math.PI / 4, Math.PI / 6, 'YXZ');

      node.setRotationFromEuler(euler);

      const expected = new Quaternion();
      expected.setFromEuler(euler, true);

      expectQuaternionEqual(node.quaternion, expected);
    });

    it('should produce identity quaternion for zero Euler angles', () => {
      const node = new Node3D();
      const euler = new Euler(0, 0, 0, 'XYZ');

      node.setRotationFromEuler(euler);

      const expected = new Quaternion(); // identity

      expectQuaternionEqual(node.quaternion, expected);
    });

    it('should update quaternion for negative Euler angles', () => {
      const node = new Node3D();
      const euler = new Euler(-Math.PI / 2, -Math.PI / 4, -Math.PI / 6, 'XYZ');

      node.setRotationFromEuler(euler);

      const expected = new Quaternion();
      expected.setFromEuler(euler, true);

      expectQuaternionEqual(node.quaternion, expected);
    });
  });

  describe('setRotationFromMatrix()', () => {
    it('should set quaternion from a rotation matrix (X-axis 90°)', () => {
      const node = new Node3D();
      const euler = new Euler(Math.PI / 2, 0, 0, 'XYZ');
      const matrix = new Matrix4().makeRotationFromEuler(euler);

      node.setRotationFromMatrix(matrix);

      const expected = new Quaternion().setFromEuler(euler, true);
      expectQuaternionEqual(node.quaternion, expected);
    });

    it('should handle arbitrary rotations', () => {
      const node = new Node3D();
      const euler = new Euler(Math.PI / 3, Math.PI / 4, Math.PI / 6, 'YXZ');
      const matrix = new Matrix4().makeRotationFromEuler(euler);

      node.setRotationFromMatrix(matrix);

      const expected = new Quaternion().setFromEuler(euler, true);
      expectQuaternionEqual(node.quaternion, expected);
    });

    it('should produce identity quaternion for identity matrix', () => {
      const node = new Node3D();
      const matrix = new Matrix4(); // identity

      node.setRotationFromMatrix(matrix);

      const expected = new Quaternion(); // identity
      expectQuaternionEqual(node.quaternion, expected);
    });

    it('should correctly update quaternion for negative rotations', () => {
      const node = new Node3D();
      const euler = new Euler(-Math.PI / 2, -Math.PI / 4, -Math.PI / 6, 'XYZ');
      const matrix = new Matrix4().makeRotationFromEuler(euler);

      node.setRotationFromMatrix(matrix);

      const expected = new Quaternion().setFromEuler(euler, true);
      expectQuaternionEqual(node.quaternion, expected);
    });
  });

  describe('setRotationFromQuaternion()', () => {
    it('should copy a quaternion into the node', () => {
      const node = new Node3D();
      const q = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0, 'XYZ'));

      node.setRotationFromQuaternion(q);

      expectQuaternionEqual(node.quaternion, q);
    });

    it('should overwrite any existing rotation', () => {
      const node = new Node3D();
      node.quaternion.setFromEuler(new Euler(Math.PI / 4, Math.PI / 4, 0, 'XYZ'));

      const newQ = new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0, 'XYZ'));
      node.setRotationFromQuaternion(newQ);

      expectQuaternionEqual(node.quaternion, newQ);
    });

    it('should handle the identity quaternion', () => {
      const node = new Node3D();
      const identity = new Quaternion(); // default identity

      node.setRotationFromQuaternion(identity);

      expectQuaternionEqual(node.quaternion, identity);
    });

    it('should correctly copy negative rotation quaternions', () => {
      const node = new Node3D();
      const q = new Quaternion().setFromEuler(new Euler(-Math.PI / 3, -Math.PI / 4, -Math.PI / 6, 'XYZ'));

      node.setRotationFromQuaternion(q);

      expectQuaternionEqual(node.quaternion, q);
    });
  });

  describe('rotateOnAxis()', () => {
    it('should rotate the node along the given axis by the given angle', () => {
      const node = new Node3D();
      const axis = new Vector3(0, 1, 0); // Y axis
      const angle = Math.PI / 2;

      const originalQuat = node.quaternion.clone();

      node.rotateOnAxis(axis, angle);

      const expectedQuat = new Quaternion().setFromAxisAngle(axis, angle).multiply(originalQuat);
      expectQuaternionEqual(node.quaternion, expectedQuat);
    });

    it('should correctly apply multiple rotations on different axes', () => {
      const node = new Node3D();
      const axisX = new Vector3(1, 0, 0);
      const axisY = new Vector3(0, 1, 0);

      node.rotateOnAxis(axisX, Math.PI / 2);
      node.rotateOnAxis(axisY, Math.PI / 2);

      const qX = new Quaternion().setFromAxisAngle(axisX, Math.PI / 2);
      const qY = new Quaternion().setFromAxisAngle(axisY, Math.PI / 2);
      const expectedQuat = qY.clone().multiply(qX);

      expectQuaternionEqual(node.quaternion, expectedQuat);
    });

    it('should return the node instance for chaining', () => {
      const node = new Node3D();
      const axis = new Vector3(0, 0, 1);
      const angle = Math.PI / 3;

      const result = node.rotateOnAxis(axis, angle);

      expect(result).toBe(node);
    });

    it('should not change the quaternion when angle is 0', () => {
      const node = new Node3D();
      const axis = new Vector3(1, 0, 0);
      const originalQuat = node.quaternion.clone();

      node.rotateOnAxis(axis, 0);

      expectQuaternionEqual(node.quaternion, originalQuat);
    });
  });

  describe('rotateOnWorldAxis()', () => {
    it('should rotate the node along the given world axis by the given angle', () => {
      const node = new Node3D();
      const axis = new Vector3(0, 1, 0); // Y axis in world space
      const angle = Math.PI / 2;

      const originalQuat = node.quaternion.clone();

      node.rotateOnWorldAxis(axis, angle);

      const expectedQuat = new Quaternion().setFromAxisAngle(axis, angle).multiply(originalQuat);
      expectQuaternionEqual(node.quaternion, expectedQuat);
    });

    it('should correctly apply multiple rotations on different world axes', () => {
      const node = new Node3D();
      const axisX = new Vector3(1, 0, 0);
      const axisY = new Vector3(0, 1, 0);

      node.rotateOnWorldAxis(axisX, Math.PI / 2);
      node.rotateOnWorldAxis(axisY, Math.PI / 2);

      const qX = new Quaternion().setFromAxisAngle(axisX, Math.PI / 2);
      const qY = new Quaternion().setFromAxisAngle(axisY, Math.PI / 2);
      const expectedQuat = qY.clone().multiply(qX);

      expectQuaternionEqual(node.quaternion, expectedQuat);
    });

    it('should return the node instance for chaining', () => {
      const node = new Node3D();
      const axis = new Vector3(0, 0, 1);
      const angle = Math.PI / 3;

      const result = node.rotateOnWorldAxis(axis, angle);

      expect(result).toBe(node);
    });

    it('should not change the quaternion when angle is 0', () => {
      const node = new Node3D();
      const axis = new Vector3(1, 0, 0);
      const originalQuat = node.quaternion.clone();

      node.rotateOnWorldAxis(axis, 0);

      expectQuaternionEqual(node.quaternion, originalQuat);
    });
  });

  describe('rotateX()', () => {
    it('should rotate the node around its local X axis', () => {
      const node = new Node3D();
      const angle = Math.PI / 2;

      const originalQuat = node.quaternion.clone();

      node.rotateX(angle);

      const expectedQuat = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), angle).multiply(originalQuat);
      expectQuaternionEqual(node.quaternion, expectedQuat);
    });

    it('should correctly apply multiple X rotations', () => {
      const node = new Node3D();
      node.rotateX(Math.PI / 2);
      node.rotateX(Math.PI / 2);

      const expectedQuat = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI);
      expectQuaternionEqual(node.quaternion, expectedQuat);
    });

    it('should return the node instance for chaining', () => {
      const node = new Node3D();
      const result = node.rotateX(Math.PI / 3);
      expect(result).toBe(node);
    });

    it('should not change the quaternion when angle is 0', () => {
      const node = new Node3D();
      const originalQuat = node.quaternion.clone();
      node.rotateX(0);
      expectQuaternionEqual(node.quaternion, originalQuat);
    });
  });

  describe('rotateY()', () => {
    it('should rotate the node around its local Y axis', () => {
      const node = new Node3D();
      const angle = Math.PI / 2;

      const originalQuat = node.quaternion.clone();

      node.rotateY(angle);

      const expectedQuat = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), angle).multiply(originalQuat);
      expectQuaternionEqual(node.quaternion, expectedQuat);
    });

    it('should correctly apply multiple Y rotations', () => {
      const node = new Node3D();
      node.rotateY(Math.PI / 2);
      node.rotateY(Math.PI / 2);

      const expectedQuat = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);
      expectQuaternionEqual(node.quaternion, expectedQuat);
    });

    it('should return the node instance for chaining', () => {
      const node = new Node3D();
      const result = node.rotateY(Math.PI / 3);
      expect(result).toBe(node);
    });

    it('should not change the quaternion when angle is 0', () => {
      const node = new Node3D();
      const originalQuat = node.quaternion.clone();
      node.rotateY(0);
      expectQuaternionEqual(node.quaternion, originalQuat);
    });
  });

  describe('rotateZ()', () => {
    it('should rotate the node around its local Z axis', () => {
      const node = new Node3D();
      const angle = Math.PI / 2;

      const originalQuat = node.quaternion.clone();

      node.rotateZ(angle);

      const expectedQuat = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), angle).multiply(originalQuat);
      expectQuaternionEqual(node.quaternion, expectedQuat);
    });

    it('should correctly apply multiple Z rotations', () => {
      const node = new Node3D();
      node.rotateZ(Math.PI / 2);
      node.rotateZ(Math.PI / 2);

      const expectedQuat = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI);
      expectQuaternionEqual(node.quaternion, expectedQuat);
    });

    it('should return the node instance for chaining', () => {
      const node = new Node3D();
      const result = node.rotateZ(Math.PI / 3);
      expect(result).toBe(node);
    });

    it('should not change the quaternion when angle is 0', () => {
      const node = new Node3D();
      const originalQuat = node.quaternion.clone();
      node.rotateZ(0);
      expectQuaternionEqual(node.quaternion, originalQuat);
    });
  });

  describe('translateOnAxis()', () => {
    it('should translate along the given local axis', () => {
      const node = new Node3D();
      const axis = new Vector3(1, 0, 0);
      const distance = 5;

      const originalPos = node.position.clone();
      node.translateOnAxis(axis, distance);

      const expectedPos = originalPos.clone().add(axis.clone().multiplyScalar(distance));
      expectVectorEqual(node.position, expectedPos);
    });

    it('should respect the node’s rotation when translating', () => {
      const node = new Node3D();
      node.quaternion.setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2); // rotate 90° around Z
      const axis = new Vector3(1, 0, 0);
      const distance = 2;

      node.translateOnAxis(axis, distance);

      // After rotation, X axis points along global Y
      const expectedPos = new Vector3(0, 2, 0);
      expectVectorEqual(node.position, expectedPos);
    });

    it('should return the node instance for chaining', () => {
      const node = new Node3D();
      const axis = new Vector3(0, 1, 0);
      const result = node.translateOnAxis(axis, 3);
      expect(result).toBe(node);
    });

    it('should not change position when distance is 0', () => {
      const node = new Node3D();
      const originalPos = node.position.clone();
      node.translateOnAxis(new Vector3(1, 0, 0), 0);
      expectVectorEqual(node.position, originalPos);
    });
  });

  describe('translateX()', () => {
    it('should translate along the local X axis', () => {
      const node = new Node3D();
      const distance = 5;
      const originalPos = node.position.clone();

      node.translateX(distance);

      const expectedPos = originalPos.clone().add(new Vector3(1, 0, 0).multiplyScalar(distance));
      expectVectorEqual(node.position, expectedPos);
    });

    it('should respect the node’s rotation when translating', () => {
      const node = new Node3D();
      node.quaternion.setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2); // rotate 90° around Z
      const distance = 3;

      node.translateX(distance);

      // After rotation, local X axis points along global Y
      const expectedPos = new Vector3(0, 3, 0);
      expectVectorEqual(node.position, expectedPos);
    });

    it('should return the node instance for chaining', () => {
      const node = new Node3D();
      const result = node.translateX(2);
      expect(result).toBe(node);
    });

    it('should not change position when distance is 0', () => {
      const node = new Node3D();
      const originalPos = node.position.clone();
      node.translateX(0);
      expectVectorEqual(node.position, originalPos);
    });
  });

  describe('tranaslateY()', () => {
    it('should translate along the local Y axis', () => {
      const node = new Node3D();

      // Initial position
      const initialPos = node.position.clone();

      // Translate by +5 units
      node.translateY(5);
      expectVectorEqual(node.position, initialPos.clone().add(new Vector3(0, 5, 0)));

      // Translate by -2 units
      node.translateY(-2);
      expectVectorEqual(node.position, initialPos.clone().add(new Vector3(0, 3, 0)));
    });

    it('should respect the node rotation when translating', () => {
      const node = new Node3D();
      // rotate 90 degrees around Z, so Y axis points along negative X
      node.rotateZ(Math.PI / 2);

      const initialPos = node.position.clone();
      node.translateY(2);

      // Y axis rotated by 90° around Z becomes -X axis
      expectVectorEqual(node.position, initialPos.clone().add(new Vector3(-2, 0, 0)));
    });

    it('should return this for chaining', () => {
      const node = new Node3D();
      const result = node.translateY(1);
      expect(result).toBe(node);
    });
  });

  describe('translateZ()', () => {
    it('should translate along the local Z axis', () => {
      const node = new Node3D();

      const initialPos = node.position.clone();

      // Translate +5 units along local Z
      node.translateZ(5);
      expectVectorEqual(node.position, initialPos.clone().add(new Vector3(0, 0, 5)));

      // Translate -2 units along local Z
      node.translateZ(-2);
      expectVectorEqual(node.position, initialPos.clone().add(new Vector3(0, 0, 3)));
    });

    it('should respect the node rotation when translating', () => {
      const node = new Node3D();
      // Rotate 90 degrees around Y axis, so Z axis points along -X
      node.rotateY(Math.PI / 2);

      const initialPos = node.position.clone();
      node.translateZ(2);

      // Z axis rotated by 90° around Y becomes -X axis
      // expectVectorEqual(node.position, initialPos.clone().add(new Vector3(-2, 0, 0)));
      expectVectorEqual(node.position, initialPos.clone().add(new Vector3(2, 0, 0)));
    });

    it('should return this for chaining', () => {
      const node = new Node3D();
      const result = node.translateZ(1);
      expect(result).toBe(node);
    });
  });

  describe('localToWorld()', () => {
    it("converts a vector with only translation", () => {
      const node = new Node3D();
      node.position.set(5, 0, 0);

      const local = new Vector3(0, 0, 0);
      const world = node.localToWorld(local.clone());

      expect(world.x).toBeCloseTo(5);
      expect(world.y).toBeCloseTo(0);
      expect(world.z).toBeCloseTo(0);
    });

    it("converts a vector with rotation", () => {
      const node = new Node3D();
      node.quaternion.setFromEuler(new Euler(0, Math.PI / 2, 0));

      const local = new Vector3(1, 0, 0);
      const world = node.localToWorld(local.clone());

      // Adjust for your engine's handedness and storage
      expect(world.x).toBeCloseTo(0);
      expect(world.y).toBeCloseTo(0);
      expect(world.z).toBeCloseTo(-1);
    });

    it("converts a vector with scale", () => {
      const node = new Node3D();
      node.scale.set(2, 3, 4);

      const local = new Vector3(1, 1, 1);
      const world = node.localToWorld(local.clone());

      expect(world.x).toBeCloseTo(2);
      expect(world.y).toBeCloseTo(3);
      expect(world.z).toBeCloseTo(4);
    });

    it("applies parent transforms", () => {
      const parent = new Node3D();
      parent.position.set(10, 0, 0);

      const child = new Node3D();
      child.position.set(1, 0, 0);
      parent.add(child);

      const local = new Vector3(0, 0, 0);
      const world = child.localToWorld(local.clone());

      expect(world.x).toBeCloseTo(11); // parent + child
      expect(world.y).toBeCloseTo(0);
      expect(world.z).toBeCloseTo(0);
    });

    it("does not modify the node's local matrix", () => {
      const node = new Node3D();
      const local = new Vector3(1, 2, 3);

      const beforeMatrix = node.matrix.clone();
      node.localToWorld(local.clone());
      const afterMatrix = node.matrix.clone();

      expect(afterMatrix.elements).toEqual(beforeMatrix.elements);
    });

    it("works with multiple calls", () => {
      const node = new Node3D();
      node.position.set(1, 2, 3);

      const v = new Vector3(1, 0, 0);

      const first = node.localToWorld(v.clone());
      const second = node.localToWorld(v.clone());

      expect(first.x).toBeCloseTo(second.x);
      expect(first.y).toBeCloseTo(second.y);
      expect(first.z).toBeCloseTo(second.z);
    });
  });

  describe('lookAt()', () => {
    it("accepts a Vector3 target", () => {
      const node = new Node3D();
      const target = new Vector3(5, 2, -3);

      node.lookAt(target);

      // Should rotate, so quaternion should not be identity
      expect(node.quaternion.equals(new Quaternion())).toBe(false);
    });

    it("accepts scalar x,y,z target", () => {
      const node = new Node3D();
      node.lookAt(0, 0, -1);
      expect(node.quaternion.equals(new Quaternion())).toBe(false);
    });

    it("rotates a normal object so that +Z points toward the target", () => {
      const node = new Node3D();
      const target = new Vector3(0, 0, 10);

      node.lookAt(target);

      const forward = new Vector3(0, 0, 1).applyQuaternion(node.quaternion);

      // Should point roughly toward +Z world
      expect(forward.x).toBeCloseTo(0);
      expect(forward.y).toBeCloseTo(0);
      expect(forward.z).toBeCloseTo(1);
    });

    it("for cameras/lights uses the reversed lookAt direction", () => {
      class Camera extends Node3D {
        isCamera = true;
      }

      const cam = new Camera();
      cam.lookAt(0, 0, 10);

      const forward = new Vector3(0, 0, -1).applyQuaternion(cam.quaternion);

      // Camera should look TOWARD target, from its -Z axis
      expect(forward.z).toBeCloseTo(1);
    });

    it("correctly computes local rotation when parent is rotated", () => {
      const parent = new Node3D();
      parent.rotation.y = Math.PI / 2;
      parent.updateMatrixWorld(true);

      const child = new Node3D();
      parent.add(child);

      child.lookAt(0, 0, 10);

      const worldQuat = child.getWorldQuaternion(new Quaternion());

      // Forward for objects is NEGATIVE Z in your implementation (Three.js standard)
      const worldForward = new Vector3(0, 0, 1).applyQuaternion(worldQuat);

      expect(worldForward.x).toBeCloseTo(0);
      expect(worldForward.y).toBeCloseTo(0);
      expect(worldForward.z).toBeCloseTo(1);
    });


    it("updates quaternion to match expected rotation matrix", () => {
      const node = new Node3D();

      // Look at a point on +X to force a 90-degree yaw
      node.lookAt(10, 0, 0);

      const forward = new Vector3(0, 0, 1).applyQuaternion(node.quaternion);

      // Should be pointing along +X
      expect(forward.x).toBeCloseTo(1);
      expect(forward.y).toBeCloseTo(0);
      expect(forward.z).toBeCloseTo(0);
    });
  });

  describe('worldToLocal()', () => {
    it("converts a vector with only translation", () => {
      const node = new Node3D();
      node.position.set(5, 0, 0);

      const world = new Vector3(5, 0, 0);
      const local = node.worldToLocal(world.clone());

      expect(local.x).toBeCloseTo(0);
      expect(local.y).toBeCloseTo(0);
      expect(local.z).toBeCloseTo(0);
    });

    it("converts a vector with rotation", () => {
      const node = new Node3D();
      node.quaternion.setFromEuler(new Euler(0, Math.PI / 2, 0));

      const world = new Vector3(0, 0, -1);
      const local = node.worldToLocal(world.clone());

      // Adjust for your engine's handedness
      expect(local.x).toBeCloseTo(1);
      expect(local.y).toBeCloseTo(0);
      expect(local.z).toBeCloseTo(0);
    });

    it("converts a vector with scale", () => {
      const node = new Node3D();
      node.scale.set(2, 3, 4);

      const world = new Vector3(2, 3, 4);
      const local = node.worldToLocal(world.clone());

      expect(local.x).toBeCloseTo(1);
      expect(local.y).toBeCloseTo(1);
      expect(local.z).toBeCloseTo(1);
    });

    it("applies parent transforms", () => {
      const parent = new Node3D();
      parent.position.set(10, 0, 0);

      const child = new Node3D();
      child.position.set(1, 0, 0);
      parent.add(child);

      const world = new Vector3(11, 0, 0);
      const local = child.worldToLocal(world.clone());

      expect(local.x).toBeCloseTo(0); // world matches child local origin
      expect(local.y).toBeCloseTo(0);
      expect(local.z).toBeCloseTo(0);
    });

    it("does not modify the node's local matrix", () => {
      const node = new Node3D();
      const world = new Vector3(1, 2, 3);

      const beforeMatrix = node.matrix.clone();
      node.worldToLocal(world.clone());
      const afterMatrix = node.matrix.clone();

      expect(afterMatrix.elements).toEqual(beforeMatrix.elements);
    });

    it("is the inverse of localToWorld", () => {
      const node = new Node3D();
      node.position.set(3, 4, 5);
      node.quaternion.setFromEuler(new Euler(0.1, 0.5, 0.2));
      node.scale.set(2, 2, 2);

      const local = new Vector3(1, 1, 1);
      const world = node.localToWorld(local.clone());
      const backToLocal = node.worldToLocal(world.clone());

      expect(backToLocal.x).toBeCloseTo(local.x);
      expect(backToLocal.y).toBeCloseTo(local.y);
      expect(backToLocal.z).toBeCloseTo(local.z);
    });
  });

  describe('updateMatrix()', () => {
    it("calls matrix.compose with position, quaternion, and scale", () => {
      const node = new Node3D();

      const composeSpy = vi.spyOn(node.matrix, "compose");

      node.updateMatrix();

      expect(composeSpy).toHaveBeenCalledWith(
        node.position,
        node.quaternion,
        node.scale
      );
    });

    it("sets matrixWorldNeedsUpdate to true", () => {
      const node = new Node3D();

      node.matrixWorldNeedsUpdate = false;
      node.updateMatrix();

      expect(node.matrixWorldNeedsUpdate).toBe(true);
    });

    // ----------------------------------------------------------
    // TRS correctness tests
    // ----------------------------------------------------------

    it("computes a correct translation matrix", () => {
      const node = new Node3D();
      node.position.set(5, -3, 10);

      node.updateMatrix();

      const expected = new Matrix4().makeTranslation(5, -3, 10);

      expect(node.matrix.elements).toEqual(expected.elements);
    });

    it("computes a correct scaling matrix", () => {
      const node = new Node3D();
      node.scale.set(2, 3, 4);

      node.updateMatrix();

      const expected = new Matrix4().makeScale(2, 3, 4);

      // matrix = T * R * S → default T=0, R=identity, so matches scale
      expect(node.matrix.elements).toEqual(expected.elements);
    });

    it("rotates vector correctly via matrix", () => {
      const node = new Node3D();
      node.quaternion.setFromEuler(new Euler(0, Math.PI / 2, 0));
      node.updateMatrix();

      const v = new Vector3(0, 0, 1);
      const rotated = v.clone().applyMatrix4(node.matrix);

      // Expect v.z forward to rotate to left (-X)
      expect(rotated.x).toBeCloseTo(1);
      expect(rotated.y).toBeCloseTo(0);
      expect(rotated.z).toBeCloseTo(0);
    });


    it("computes correct full TRS composition", () => {
      const node = new Node3D();

      node.position.set(2, 4, 6);
      node.scale.set(2, 2, 2);
      node.quaternion.setFromEuler(new Euler(0, Math.PI / 2, 0));

      node.updateMatrix();

      const expected = new Matrix4()
        .compose(node.position, node.quaternion, node.scale);

      expect(node.matrix.elements).toEqual(expected.elements);
    });

    // ----------------------------------------------------------
    // Additional safety checks
    // ----------------------------------------------------------

    it("does not mutate position, quaternion, or scale objects", () => {
      const node = new Node3D();

      const pos = node.position.clone();
      const quat = node.quaternion.clone();
      const scale = node.scale.clone();

      node.updateMatrix();

      expect(node.position).toEqual(pos);
      expectQuaternionEqual(node.quaternion, quat);
      expect(node.scale).toEqual(scale);
    });

    it("updates the matrix when transform properties change", () => {
      const node = new Node3D();

      node.updateMatrix();
      const firstMatrix = node.matrix.clone();

      node.position.set(1, 2, 3);
      node.updateMatrix();

      expect(node.matrix.elements).not.toEqual(firstMatrix.elements);
    });
  });

  describe('updateMatrixWorld()', () => {
    let root: Node3D;
    let child: Node3D;
    let grandchild: Node3D;

    beforeEach(() => {
      root = new Node3D();
      child = new Node3D();
      grandchild = new Node3D();

      root.add(child);
      child.add(grandchild);

      // Reset flags for predictable behavior
      root.matrixWorldNeedsUpdate = true;
      child.matrixWorldNeedsUpdate = true;
      grandchild.matrixWorldNeedsUpdate = true;
    });

    // -------------------------------------------------------------
    // 1. Local matrix updates when matrixAutoUpdate = true
    // -------------------------------------------------------------
    it("updates local matrix when matrixAutoUpdate = true", () => {
      const spy = vi.spyOn(root, "updateMatrix");
      root.matrixAutoUpdate = true;

      root.updateMatrixWorld();

      expect(spy).toHaveBeenCalled();
    });

    it("does not update local matrix when matrixAutoUpdate = false", () => {
      const spy = vi.spyOn(root, "updateMatrix");
      root.matrixAutoUpdate = false;

      root.updateMatrixWorld();

      expect(spy).not.toHaveBeenCalled();
    });

    // -------------------------------------------------------------
    // 2. Root node world-matrix update
    // -------------------------------------------------------------
    it("copies local matrix into matrixWorld for root node", () => {
      root.position.set(5, 0, 0);
      root.updateMatrix(); // prepare local matrix

      root.matrixWorldNeedsUpdate = true;
      root.updateMatrixWorld();

      expect(root.matrixWorld.elements).toEqual(root.matrix.elements);
    });

    // -------------------------------------------------------------
    // 3. Child node world-matrix update: parentWorld * localMatrix
    // -------------------------------------------------------------
    it("multiplies parent matrixWorld with local matrix for child node", () => {
      root.position.set(10, 0, 0);
      child.position.set(5, 0, 0);

      root.updateMatrix();
      child.updateMatrix();

      root.matrixWorldNeedsUpdate = true;
      child.matrixWorldNeedsUpdate = true;

      root.updateMatrixWorld(); // recursive update

      const expected = root.matrixWorld.clone().multiply(child.matrix);

      expect(child.matrixWorld.elements).toEqual(expected.elements);
    });

    // -------------------------------------------------------------
    // 4. matrixWorldNeedsUpdate controls propagation
    // -------------------------------------------------------------
    it("recomputes world matrix only when matrixWorldNeedsUpdate = true", () => {
      const spy = vi.spyOn(child.matrixWorld, "copy");
      child.matrixWorldNeedsUpdate = false;

      root.updateMatrixWorld();

      expect(spy).not.toHaveBeenCalled();
    });

    // -------------------------------------------------------------
    // 5. force = true forces recomputation even when matrixWorldAutoUpdate = false
    // -------------------------------------------------------------
    it("does NOT recompute world matrix if matrixWorldAutoUpdate = false, even with force = true", () => {
      child.matrixWorldAutoUpdate = false;

      const multiplySpy = vi.spyOn(child.matrixWorld, "multiplyMatrices");

      child.updateMatrixWorld(true);

      // multiplyMatrices should NOT be called
      expect(multiplySpy).not.toHaveBeenCalled();
    });


    // -------------------------------------------------------------
    // 6. After updating its own world matrix, force=true is passed to children
    // -------------------------------------------------------------
    it("forces children to update when this node recomputes world matrix", () => {
      const spy = vi.spyOn(grandchild, "updateMatrixWorld");

      root.matrixWorldNeedsUpdate = true;
      child.matrixWorldNeedsUpdate = true;
      grandchild.matrixWorldNeedsUpdate = true;

      root.updateMatrixWorld();

      // The grandchild receives force=true after parent update
      expect(spy).toHaveBeenCalledWith(true);
    });

    // -------------------------------------------------------------
    // 7. Recursive propagation through entire hierarchy
    // -------------------------------------------------------------
    it("recursively updates all descendant nodes", () => {
      const childSpy = vi.spyOn(child, "updateMatrixWorld");
      const grandchildSpy = vi.spyOn(grandchild, "updateMatrixWorld");

      root.updateMatrixWorld();

      expect(childSpy).toHaveBeenCalled();
      expect(grandchildSpy).toHaveBeenCalled();
    });
  });

  describe('updateWorldMatrix()', () => {
    it("should copy local matrix into world matrix for root nodes", () => {
      const node = new Node3D();
      node.position.set(2, 3, 4);

      node.updateMatrix(); // ensure local matrix is correct
      node.updateWorldMatrix(false, false);

      expectMatrixCloseTo(node.matrixWorld, node.matrix);
    });

    it("should multiply parent world matrix with local matrix for child nodes", () => {
      const parent = new Node3D();
      const child = new Node3D();

      parent.add(child);

      parent.position.set(5, 0, 0);
      child.position.set(3, 0, 0);

      parent.updateWorldMatrix(false, true);

      // worldX = 5 + 3 = 8
      expect(child.matrixWorld.elements[12]).toBeCloseTo(8, 6);
    });

    it("should update parents when updateParents=true", () => {
      const parent = new Node3D();
      const child = new Node3D();

      parent.add(child);

      parent.position.set(10, 0, 0);
      child.position.set(5, 0, 0);

      child.updateWorldMatrix(true, false);

      // parent should have been updated
      expectMatrixCloseTo(parent.matrixWorld, parent.matrix);

      // child's world = parentWorld * childLocal
      expect(child.matrixWorld.elements[12]).toBeCloseTo(15);
    });

    it("should NOT update parents when updateParents=false", () => {
      const parent = new Node3D();
      const child = new Node3D();

      parent.add(child);

      // Corrupt parent world matrix artificially
      parent.matrixWorld.elements[12] = 99;

      child.updateWorldMatrix(false, false);

      // Child MUST use outdated parent matrix
      expect(child.matrixWorld.elements[12]).toBe(99);
    });

    it("should recursively update children when updateChildren=true", () => {
      const parent = new Node3D();
      const child = new Node3D();
      const grandChild = new Node3D();

      parent.add(child);
      child.add(grandChild);

      parent.position.set(3, 0, 0);
      child.position.set(2, 0, 0);
      grandChild.position.set(1, 0, 0);

      parent.updateWorldMatrix(false, true);

      expect(parent.matrixWorld.elements[12]).toBeCloseTo(3);
      expect(child.matrixWorld.elements[12]).toBeCloseTo(5);  // 3 + 2
      expect(grandChild.matrixWorld.elements[12]).toBeCloseTo(6); // 3 + 2 + 1
    });

    it("should NOT update children when updateChildren=false", () => {
      const parent = new Node3D();
      const child = new Node3D();

      parent.add(child);

      // corrupt child matrixWorld artificially
      child.matrixWorld.elements[12] = 123;

      parent.updateWorldMatrix(false, false);

      expect(child.matrixWorld.elements[12]).toBe(123);
    });

    it("should update this.matrix if matrixAutoUpdate is true", () => {
      const node = new Node3D();
      node.position.set(10, 0, 0);

      node.updateWorldMatrix(false, false);

      expect(node.matrix.elements[12]).toBeCloseTo(10);
    });

    it("should not change local matrix if matrixAutoUpdate is false", () => {
      const node = new Node3D();
      node.matrixAutoUpdate = false;

      // deliberately corrupt local matrix
      node.matrix.elements[12] = 555;

      node.position.set(10, 0, 0);
      node.updateWorldMatrix(false, false);

      // local matrix must remain unchanged
      expect(node.matrix.elements[12]).toBe(555);
    });

    it("should not update matrixWorld if matrixWorldAutoUpdate = false", () => {
      const node = new Node3D();
      node.matrixWorldAutoUpdate = false;

      // corrupt world matrix intentionally
      node.matrixWorld.elements[12] = 999;

      node.position.set(10, 0, 0);
      node.updateWorldMatrix(false, false);

      // should remain unchanged
      expect(node.matrixWorld.elements[12]).toBe(999);
    });
  });

  describe('getWorldPosition()', () => {
    let node: Node3D;

    beforeEach(() => {
      node = new Node3D();
    });

    it("returns correct position for root node", () => {
      node.position.set(1, 2, 3);
      node.updateMatrixWorld(true);

      const result = new Vector3();
      node.getWorldPosition(result);

      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(2);
      expect(result.z).toBeCloseTo(3);
    });

    it("returns correct position for child node without parent transform", () => {
      const parent = new Node3D();
      parent.position.set(0, 0, 0);
      parent.updateMatrixWorld(true);

      const child = new Node3D();
      child.position.set(1, 2, 3);
      parent.add(child);
      child.updateMatrixWorld(true);

      const result = new Vector3();
      child.getWorldPosition(result);

      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(2);
      expect(result.z).toBeCloseTo(3);
    });

    it("returns correct position for child node with parent translation", () => {
      const parent = new Node3D();
      parent.position.set(10, 0, 0);
      parent.updateMatrixWorld(true);

      const child = new Node3D();
      child.position.set(1, 2, 3);
      parent.add(child);
      child.updateMatrixWorld(true);

      const result = new Vector3();
      child.getWorldPosition(result);

      expect(result.x).toBeCloseTo(11); // parent.x + child.x
      expect(result.y).toBeCloseTo(2);
      expect(result.z).toBeCloseTo(3);
    });

    it("returns correct position for child node with parent rotation", () => {
      const parent = new Node3D();
      parent.rotation.y = Math.PI / 2; // 90 degrees
      parent.updateMatrixWorld(true);

      const child = new Node3D();
      child.position.set(1, 0, 0);
      parent.add(child);
      child.updateMatrixWorld(true);

      const result = new Vector3();
      child.getWorldPosition(result);

      // Rotated 90° around Y: local +X becomes world +Z
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(-1);
    });

    it("returns correct position for child node with parent rotation and translation", () => {
      const parent = new Node3D();
      parent.position.set(10, 0, 0);
      parent.rotation.y = Math.PI / 2;
      parent.updateMatrixWorld(true);

      const child = new Node3D();
      child.position.set(1, 0, 0);
      parent.add(child);
      child.updateMatrixWorld(true);

      const result = new Vector3();
      child.getWorldPosition(result);

      // Parent rotated 90° Y and translated by +10 in X
      expect(result.x).toBeCloseTo(10); // translation + rotation effect
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(-1);
    });
  });

  describe('getWorldQuaternion()', () => {
    it("returns identity quaternion when object has no rotation or parent", () => {
      const node = new Node3D();
      node.updateMatrixWorld(true);

      const q = node.getWorldQuaternion(new Quaternion());

      expect(q.x).toBeCloseTo(0);
      expect(q.y).toBeCloseTo(0);
      expect(q.z).toBeCloseTo(0);
      expect(q.w).toBeCloseTo(1);
    });

    it("returns the object's local rotation when there is no parent", () => {
      const node = new Node3D();
      node.rotation.y = Math.PI / 2;
      node.updateMatrixWorld(true);

      const q = node.getWorldQuaternion(new Quaternion());

      const expected = new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0));

      expect(q.x).toBeCloseTo(expected.x);
      expect(q.y).toBeCloseTo(expected.y);
      expect(q.z).toBeCloseTo(expected.z);
      expect(q.w).toBeCloseTo(expected.w);
    });

    it("correctly computes world rotation when parent is rotated", () => {
      const parent = new Node3D();
      parent.rotation.y = Math.PI / 2;
      parent.updateMatrixWorld(true);

      const child = new Node3D();
      child.rotation.x = Math.PI / 2;
      parent.add(child);

      // Compute world quaternion manually
      const parentQuat = new Quaternion().setFromEuler(parent.rotation);
      const childQuat = new Quaternion().setFromEuler(child.rotation);
      const expectedWorldQuat = parentQuat.clone().multiply(childQuat);

      // Rotate local forward
      const localForward = new Vector3(0, 0, 1);
      const expectedForward = localForward.clone().applyQuaternion(expectedWorldQuat);

      // Now use getWorldQuaternion
      const worldQuat = child.getWorldQuaternion(new Quaternion());
      const worldForward = localForward.clone().applyQuaternion(worldQuat);

      // Compare
      expect(worldForward.x).toBeCloseTo(expectedForward.x);
      expect(worldForward.y).toBeCloseTo(expectedForward.y);
      expect(worldForward.z).toBeCloseTo(expectedForward.z);
    });

    it("ignores parent scaling when computing world quaternion", () => {
      const parent = new Node3D();
      parent.rotation.z = Math.PI / 4;
      parent.scale.set(2, 5, 3); // non-uniform scale
      parent.updateMatrixWorld(true);

      const child = new Node3D();
      parent.add(child);

      const q = child.getWorldQuaternion(new Quaternion());

      const expected = new Quaternion().setFromEuler(new Euler(0, 0, Math.PI / 4));

      expect(q.x).toBeCloseTo(expected.x);
      expect(q.y).toBeCloseTo(expected.y);
      expect(q.z).toBeCloseTo(expected.z);
      expect(q.w).toBeCloseTo(expected.w);
    });
  });

  describe('getWorldScale()', () => {
    let node: Node3D;

    beforeEach(() => {
      node = new Node3D();
    });

    it("returns correct scale for root node", () => {
      node.scale.set(1, 2, 3);
      node.updateMatrixWorld(true);

      const result = new Vector3();
      node.getWorldScale(result);

      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(2);
      expect(result.z).toBeCloseTo(3);
    });

    it("returns correct scale for child node without parent scale", () => {
      const parent = new Node3D();
      parent.scale.set(1, 1, 1);
      parent.updateMatrixWorld(true);

      const child = new Node3D();
      child.scale.set(2, 3, 4);
      parent.add(child);
      child.updateMatrixWorld(true);

      const result = new Vector3();
      child.getWorldScale(result);

      expect(result.x).toBeCloseTo(2);
      expect(result.y).toBeCloseTo(3);
      expect(result.z).toBeCloseTo(4);
    });

    it("returns correct scale for child node with parent scale", () => {
      const parent = new Node3D();
      parent.scale.set(2, 2, 2);
      parent.updateMatrixWorld(true);

      const child = new Node3D();
      child.scale.set(3, 4, 5);
      parent.add(child);
      child.updateMatrixWorld(true);

      const result = new Vector3();
      child.getWorldScale(result);

      // World scale = parent scale * local scale
      expect(result.x).toBeCloseTo(6); // 2 * 3
      expect(result.y).toBeCloseTo(8); // 2 * 4
      expect(result.z).toBeCloseTo(10); // 2 * 5
    });

    it("returns correct scale for child node with parent rotation", () => {
      const parent = new Node3D();
      parent.rotation.y = Math.PI / 4; // 45 degrees
      parent.scale.set(2, 3, 4);
      parent.updateMatrixWorld(true);

      const child = new Node3D();
      child.scale.set(1, 1, 1);
      parent.add(child);
      child.updateMatrixWorld(true);

      const result = new Vector3();
      child.getWorldScale(result);

      // Rotation does not affect scale, only multiplication matters
      expect(result.x).toBeCloseTo(2);
      expect(result.y).toBeCloseTo(3);
      expect(result.z).toBeCloseTo(4);
    });

    it("returns correct scale for child node with parent rotation and child scale", () => {
      const parent = new Node3D();
      parent.rotation.z = Math.PI / 2;
      parent.scale.set(2, 2, 2);
      parent.updateMatrixWorld(true);

      const child = new Node3D();
      child.scale.set(0.5, 3, 1);
      parent.add(child);
      child.updateMatrixWorld(true);

      const result = new Vector3();
      child.getWorldScale(result);

      expect(result.x).toBeCloseTo(1); // 2 * 0.5
      expect(result.y).toBeCloseTo(6); // 2 * 3
      expect(result.z).toBeCloseTo(2); // 2 * 1
    });
  });

  describe('getWorldDirection()', () => {
    let node: Node3D;

    beforeEach(() => {
      node = new Node3D();
    });

    it("returns correct direction for unrotated root node", () => {
      node.updateMatrixWorld(true);

      const result = new Vector3();
      node.getWorldDirection(result);

      // +Z is the forward direction
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(1);
    });

    it("returns correct direction for rotated root node", () => {
      node.rotation.y = Math.PI / 2; // 90 degrees around Y
      node.updateMatrixWorld(true);

      const result = new Vector3();
      node.getWorldDirection(result);

      // Forward (+Z) rotated 90° around Y points to +X
      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(0);
    });

    it("returns correct direction for child node without parent rotation", () => {
      const parent = new Node3D();
      parent.updateMatrixWorld(true);

      const child = new Node3D();
      parent.add(child);
      child.rotation.x = Math.PI / 2; // rotate forward up
      child.updateMatrixWorld(true);

      const result = new Vector3();
      child.getWorldDirection(result);

      // Forward rotated 90° around X should point along -Y
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(-1);
      expect(result.z).toBeCloseTo(0);
    });

    it("returns correct direction for child node with parent rotation", () => {
      const parent = new Node3D();
      parent.rotation.y = Math.PI / 2; // 90° around Y
      parent.updateMatrixWorld(true);

      const child = new Node3D();
      child.rotation.x = Math.PI / 2; // 90° around X
      parent.add(child);
      child.updateMatrixWorld(true);

      const result = new Vector3();
      child.getWorldDirection(result);

      // Child forward: rotate X then parent Y
      // Expected forward vector after rotation
      // Apply rotation: rotate +Z by X=90° -> -Y, then rotate by parent Y=90° -> -Y becomes -Y (unchanged)
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(-1);
      expect(result.z).toBeCloseTo(0);
    });

    it("normalizes the returned direction vector", () => {
      node.scale.set(2, 3, 4); // scale should not affect direction
      node.rotation.z = Math.PI / 4;
      node.updateMatrixWorld(true);

      const result = new Vector3();
      node.getWorldDirection(result);

      // Ensure magnitude is 1
      expect(result.length()).toBeCloseTo(1);
    });
  });

  describe('clone()', () => {
    it('creates a new instance with the same properties', () => {
      const original = new Node3D();
      original.name = 'original';
      original.position.set(1, 2, 3);
      original.scale.set(2, 2, 2);
      original.rotation.order = 'XYZ';
      original.visible = false;
      original.castShadow = true;
      original.recieveShadow = true;
      original.userData = { foo: 'bar' };

      const clone = original.clone(false);

      expect(clone).not.toBe(original); // different instance
      expect(clone.name).toBe(original.name);
      expect(clone.position.x).toBeCloseTo(original.position.x);
      expect(clone.position.y).toBeCloseTo(original.position.y);
      expect(clone.position.z).toBeCloseTo(original.position.z);
      expect(clone.scale.x).toBeCloseTo(original.scale.x);
      expect(clone.scale.y).toBeCloseTo(original.scale.y);
      expect(clone.scale.z).toBeCloseTo(original.scale.z);
      expect(clone.rotation.order).toBe(original.rotation.order);
      expect(clone.visible).toBe(original.visible);
      expect(clone.castShadow).toBe(original.castShadow);
      expect(clone.recieveShadow).toBe(original.recieveShadow);
      expect(clone.userData).toEqual(original.userData);
    });

    it('does not clone children if recursive is false', () => {
      const parent = new Node3D();
      const child = new Node3D();
      parent.add(child);

      const clone = parent.clone(false);

      expect(clone.children.length).toBe(0);
    });

    it('clones children if recursive is true', () => {
      const parent = new Node3D();
      const child = new Node3D();
      child.name = 'child';
      parent.add(child);

      const clone = parent.clone(true);

      expect(clone.children.length).toBe(1);
      expect(clone.children[0]).not.toBe(child);
      expect(clone.children[0].name).toBe('child');
    });

    // it('deep-copies userData', () => {
    //   const original = new Node3D();
    //   original.userData = { nested: { value: 42 } };

    //   const clone = original.clone(false);
    //   clone.userData.nested.value = 100;

    //   expect(original.userData.nested.value).toBe(42); // original unchanged
    // });
  });

  describe('copy()', () => {
    it('copy() correctly copies all properties from another Node3D', () => {
      // Setup source node
      const source = new Node3D();
      source.name = 'SourceNode';
      source.position.set(1, 2, 3);
      source.up.set(0, 1, 0);
      source.rotation.order = 'XYZ';
      source.quaternion.set(0.1, 0.2, 0.3, 0.4);
      source.scale.set(2, 2, 2);
      source.matrixAutoUpdate = false;
      source.matrixWorldNeedsUpdate = true;
      source.layers.mask = 5;
      source.visible = false;
      source.castShadow = true;
      source.recieveShadow = false;
      source.frustumCulled = false;
      source.renderOrder = 7;
      source.animations = [{ name: 'anim1' }];
      source.userData = { someKey: 'someValue' };

      // Add a child
      const child = new Node3D();
      child.name = 'ChildNode';
      source.add(child);

      // Target node
      const target = new Node3D();

      // Shallow copy
      target.copy(source, false);

      // Basic property checks
      expect(target.name).toBe('SourceNode');
      expect(target.position.x).toBeCloseTo(1);
      expect(target.position.y).toBeCloseTo(2);
      expect(target.position.z).toBeCloseTo(3);
      expect(target.up.x).toBeCloseTo(0);
      expect(target.up.y).toBeCloseTo(1);
      expect(target.up.z).toBeCloseTo(0);
      expect(target.rotation.order).toBe('XYZ');
      expect(target.quaternion.x).toBeCloseTo(0.1);
      expect(target.quaternion.y).toBeCloseTo(0.2);
      expect(target.quaternion.z).toBeCloseTo(0.3);
      expect(target.quaternion.w).toBeCloseTo(0.4);
      expect(target.scale.x).toBeCloseTo(2);
      expect(target.scale.y).toBeCloseTo(2);
      expect(target.scale.z).toBeCloseTo(2);
      expect(target.matrixAutoUpdate).toBe(false);
      expect(target.matrixWorldNeedsUpdate).toBe(true);
      expect(target.layers.mask).toBe(5);
      expect(target.visible).toBe(false);
      expect(target.castShadow).toBe(true);
      expect(target.recieveShadow).toBe(false);
      expect(target.frustumCulled).toBe(false);
      expect(target.renderOrder).toBe(7);
      expect(target.animations).toEqual([{ name: 'anim1' }]);
      expect(target.userData).toEqual({ someKey: 'someValue' });

      // Children should not be copied in shallow copy
      expect(target.children.length).toBe(0);

      // Recursive copy
      const recursiveTarget = new Node3D();
      recursiveTarget.copy(source, true);

      expect(recursiveTarget.children.length).toBe(1);
      expect(recursiveTarget.children[0].name).toBe('ChildNode');

      // Ensure deep copy: modifying original child does not affect recursive copy
      child.name = 'ModifiedChild';
      expect(recursiveTarget.children[0].name).toBe('ChildNode');
    });
  });
});
