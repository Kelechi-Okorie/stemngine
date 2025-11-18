import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Node3D } from '../../../src/core/Node3D';
import { SpatialNode } from '../../../src/core/SpatialNode';
import { Node } from '../../../src/core/Node';

describe('Node3D', () => {

  describe('constructor()', () => {
    let mesh: Node3D;

    beforeEach(() => {
      mesh = new Node3D();
    });

    it('should create an instance of Node3D', () => {
      expect(mesh).toBeInstanceOf(Node3D);
    });

    it('should inherit from SpatialNode and Node', () => {
      expect(mesh).toBeInstanceOf(SpatialNode);
      expect(mesh).toBeInstanceOf(Node);
    });

    it('should have a unique id', () => {
      const mesh2 = new Node3D();
      expect(mesh.id).not.toBe(mesh2.id);
      expect(typeof mesh.id).toBe('number');
    });

    it('should have a UUID', () => {
      expect(typeof mesh.uuid).toBe('string');
      expect(mesh.uuid.length).toBeGreaterThan(0);
    });

    it('should have default name as empty string', () => {
      expect(mesh.name).toBe('');
    });

    it('should have parent initialized to null', () => {
      expect(mesh.parent).toBeNull();
    });

    it('should have children initialized as empty array', () => {
      expect(mesh.children).toEqual([]);
    });

    it('should have isNode flag set to true', () => {
      expect(mesh.isNode).toBe(true);
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

  // TODO: Test getObjectById, getObjectByName, getObjectByPropertyValue


});
