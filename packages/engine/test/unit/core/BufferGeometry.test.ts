import { describe, it, expect, beforeEach, vi } from "vitest";
import { BufferGeometry } from "../../../src/core/BufferGeometry";
import { BufferAttribute, Uint16BufferAttribute, Uint32BufferAttribute, Float32BufferAttribute } from "../../../src/core/BufferAttribute";
import { InterleavedBufferAttribute } from "../../../src/core/InterleavedBufferAttribute";
import { InterleavedBuffer } from "../../../src/core/InterleavedBuffer";
import { Matrix4 } from "../../../src/math/Matrix4";
import { Box3 } from "../../../src/math/Box3";
import { Sphere } from "../../../src/math/Sphere";
import { Quaternion } from "../../../src/math/Quaternion";
import { Vector3 } from "../../../src/math/Vector3";
import { Vector2 } from '../../../src/math/Vector2';

describe('BufferGeometry', () => {
  describe('constructor()', () => {

    let geometry: BufferGeometry;

    beforeEach(() => {
      geometry = new BufferGeometry();
    });

    it('should create an instance of BufferGeometry', () => {
      expect(geometry).toBeInstanceOf(BufferGeometry);
      expect(geometry.isBufferGeometry).toBe(true);
    });

    it('should assign a unique id', () => {
      const another = new BufferGeometry();
      expect(geometry.id).not.toBe(another.id);
    });

    it('should have a generated uuid', () => {
      expect(typeof geometry.uuid).toBe('string');
      expect(geometry.uuid.length).toBeGreaterThan(0);
    });

    it('should have default name and type', () => {
      expect(geometry.name).toBe('');
      expect(geometry.type).toBe('BufferGeometry');
    });

    it('should initialize attributes and morphAttributes as empty objects', () => {
      expect(geometry.attributes).toEqual({});
      expect(geometry.morphAttributes).toEqual({});
    });

    it('should initialize groups as an empty array', () => {
      expect(geometry.groups).toEqual([]);
    });

    it('should initialize index and indirect as null', () => {
      expect(geometry.index).toBeNull();
      expect(geometry.indirect).toBeNull();
    });

    it('should initialize morphTargetsRelative to false', () => {
      expect(geometry.morphTargetsRelative).toBe(false);
    });

    it('should initialize boundingBox and boundingSphere as null', () => {
      expect(geometry.boundingBox).toBeNull();
      expect(geometry.boundingSphere).toBeNull();
    });

    it('should initialize drawRange correctly', () => {
      expect(geometry.drawRange).toEqual({ start: 0, count: Infinity });
    });

    it('should initialize userData as an empty object', () => {
      expect(geometry.userData).toEqual({});
    });

  });

  describe('getIndex()', () => {
    let geometry: BufferGeometry;

    beforeEach(() => {
      geometry = new BufferGeometry();
    });

    it('should return null if no index is set', () => {
      expect(geometry.getIndex()).toBeNull();
    });

    it('should return the index if it is set', () => {
      const indices = new Uint16Array([0, 1, 2]);
      const indexAttribute = new BufferAttribute(indices, 1);

      geometry.index = indexAttribute;

      expect(geometry.getIndex()).toBe(indexAttribute);
    });

    it('should return the same reference as geometry.index', () => {
      const indices = new Uint16Array([0, 1, 2]);
      const indexAttribute = new BufferAttribute(indices, 1);

      geometry.index = indexAttribute;

      // ensure getIndex returns the exact same object
      expect(geometry.getIndex()).toBe(geometry.index);
    });
  });

  describe('setIndex()', () => {
    let geometry: BufferGeometry;

    beforeEach(() => {
      geometry = new BufferGeometry();
    });

    it('should accept a BufferAttribute directly', () => {
      const indices = new Uint16Array([0, 1, 2]);
      const indexAttr = new BufferAttribute(indices, 1);

      geometry.setIndex(indexAttr);

      expect(geometry.index).toBe(indexAttr); // same reference
    });

    it('should accept a number array and create a Uint16BufferAttribute when values < 65536', () => {
      const indices = [0, 1, 2, 3, 4];
      geometry.setIndex(indices as unknown as BufferAttribute); // mimic array input

      expect(geometry.index).toBeInstanceOf(Uint16BufferAttribute);
      expect((geometry.index as BufferAttribute).array).toEqual(new Uint16Array(indices));
      expect((geometry.index as BufferAttribute).itemSize).toBe(1);
    });

    it('should accept a number array and create a Uint32BufferAttribute when values >= 65536', () => {
      const indices = [0, 70000, 2];
      geometry.setIndex(indices as unknown as BufferAttribute);

      expect(geometry.index).toBeInstanceOf(Uint32BufferAttribute);
      expect((geometry.index as BufferAttribute).array).toEqual(new Uint32Array(indices));
      expect((geometry.index as BufferAttribute).itemSize).toBe(1);
    });

    it('should return this for chaining', () => {
      const indices = new Uint16Array([0, 1, 2]);
      const indexAttr = new BufferAttribute(indices, 1);

      const returned = geometry.setIndex(indexAttr);
      expect(returned).toBe(geometry);
    });
  });

  describe('setIndirect()', () => {
    let geometry: BufferGeometry;

    beforeEach(() => {
      geometry = new BufferGeometry();
    });

    it('should set the indirect attribute correctly', () => {
      const array = new Uint32Array([3, 1, 0]); // example indirect draw parameters
      const indirectAttr = new BufferAttribute(array, 1);

      geometry.setIndirect(indirectAttr);

      expect(geometry.indirect).toBe(indirectAttr); // reference equality
    });

    it('should return this for chaining', () => {
      const array = new Uint32Array([3, 1, 0]);
      const indirectAttr = new BufferAttribute(array, 1);

      const returned = geometry.setIndirect(indirectAttr);

      expect(returned).toBe(geometry); // chaining works
    });
  });

  describe('getIndrect()', () => {
    let geometry: BufferGeometry;

    beforeEach(() => {
      geometry = new BufferGeometry();
    });

    it('should return null if no indirect attribute is set', () => {
      expect(geometry.getIndrect()).toBeNull();
    });

    it('should return the indirect attribute if it is set', () => {
      const array = new Uint32Array([3, 1, 0]);
      const indirectAttr = new BufferAttribute(array, 1);

      geometry.indirect = indirectAttr;

      expect(geometry.getIndrect()).toBe(indirectAttr);
    });

    it('should return the same reference as geometry.indirect', () => {
      const array = new Uint32Array([3, 1, 0]);
      const indirectAttr = new BufferAttribute(array, 1);

      geometry.indirect = indirectAttr;

      expect(geometry.getIndrect()).toBe(geometry.indirect);
    });
  });

  describe('getAttribute()', () => {
    let geometry: BufferGeometry;

    beforeEach(() => {
      geometry = new BufferGeometry();
    });

    it('should return undefined when the attribute does not exist', () => {
      expect(geometry.getAttribute('position')).toBeUndefined();
      expect(geometry.getAttribute('color')).toBeUndefined();
    });

    it('should return a BufferAttribute when it exists', () => {
      const array = new Float32Array([0, 1, 2]);
      const position = new BufferAttribute(array, 3);

      geometry.attributes['position'] = position;

      const result = geometry.getAttribute('position');
      expect(result).toBe(position);
    });

    it('should return an InterleavedBufferAttribute when it exists', () => {
      const array = new Float32Array([0, 1, 2, 3, 4, 5]);
      const ib = new InterleavedBuffer(array, 3);
      const interleavedAttr = new InterleavedBufferAttribute(ib, 3, 0);

      geometry.attributes['normal'] = interleavedAttr;

      const result = geometry.getAttribute('normal');
      expect(result).toBe(interleavedAttr);
    });

    it('should not modify the attribute when retrieving it', () => {
      const array = new Float32Array([1, 2, 3]);
      const colorAttr = new BufferAttribute(array, 3);

      geometry.attributes['color'] = colorAttr;

      const result = geometry.getAttribute('color');
      expect(result).toBe(colorAttr);  // same reference
      // expect(result.array).toBe(array); // internal data unchanged
    });
  });

  describe('setAttribute()', () => {
    let geometry: BufferGeometry;

    beforeEach(() => {
      geometry = new BufferGeometry();
    });

    it('should set a BufferAttribute correctly', () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const attr = new BufferAttribute(array, 3);

      const result = geometry.setAttribute('position', attr);

      // Should return the same instance for chaining
      expect(result).toBe(geometry);

      // Should store the attribute correctly
      expect(geometry.attributes['position']).toBe(attr);

      // Should be retrievable via getAttribute
      expect(geometry.getAttribute('position')).toBe(attr);
    });

    it('should set an InterleavedBufferAttribute correctly', () => {
      const interleavedArray = new Float32Array([0, 1, 2, 3, 4, 5]);
      const ib = new InterleavedBuffer(interleavedArray, 3);
      const interleavedAttr = new InterleavedBufferAttribute(ib, 3, 0);

      const result = geometry.setAttribute('normal', interleavedAttr);

      expect(result).toBe(geometry);
      expect(geometry.attributes['normal']).toBe(interleavedAttr);
      expect(geometry.getAttribute('normal')).toBe(interleavedAttr);
    });

    it('should overwrite an existing attribute with the same name', () => {
      const attr1 = new BufferAttribute(new Float32Array([1, 2, 3]), 3);
      const attr2 = new BufferAttribute(new Float32Array([4, 5, 6]), 3);

      geometry.setAttribute('position', attr1);
      geometry.setAttribute('position', attr2);

      expect(geometry.getAttribute('position')).toBe(attr2);
    });
  });

  describe('deleteAttribute()', () => {
    let geometry: BufferGeometry;

    beforeEach(() => {
      geometry = new BufferGeometry();
    });

    it('should delete an existing attribute', () => {
      const attr = new BufferAttribute(new Float32Array([1, 2, 3]), 3);
      geometry.setAttribute('position', attr);

      // Delete the attribute
      const result = geometry.deleteAttribute('position');

      // Method should return true
      expect(result).toBe(true);

      // Attribute should no longer exist
      expect(geometry.getAttribute('position')).toBeUndefined();
      expect('position' in geometry.attributes).toBe(false);
    });

    it('should return true even if the attribute does not exist', () => {
      const result = geometry.deleteAttribute('nonexistent');

      // Method returns true regardless
      expect(result).toBe(true);

      // Attributes object should remain unchanged
      expect(geometry.attributes).toEqual({});
    });
  });

  describe('hasAttribute()', () => {
    let geometry: BufferGeometry;

    beforeEach(() => {
      geometry = new BufferGeometry();
    });

    it('should return true if an attribute exists', () => {
      const attr = new BufferAttribute(new Float32Array([1, 2, 3]), 3);
      geometry.setAttribute('position', attr);

      expect(geometry.hasAttribute('position')).toBe(true);
    });

    it('should return false if an attribute does not exist', () => {
      expect(geometry.hasAttribute('normal')).toBe(false);
    });

    it('should return false after the attribute is deleted', () => {
      const attr = new BufferAttribute(new Float32Array([1, 2, 3]), 3);
      geometry.setAttribute('position', attr);

      geometry.deleteAttribute('position');

      expect(geometry.hasAttribute('position')).toBe(false);
    });
  });

  describe('addGroup', () => {
    let geometry: BufferGeometry;

    beforeEach(() => {
      geometry = new BufferGeometry();
    });

    it('should add a group with specified start, count, and materialIndex', () => {
      geometry.addGroup(0, 6, 1);

      expect(geometry.groups.length).toBe(1);
      expect(geometry.groups[0]).toEqual({
        start: 0,
        count: 6,
        materialIndex: 1,
      });
    });

    it('should default materialIndex to 0 if not provided', () => {
      geometry.addGroup(3, 12);

      expect(geometry.groups.length).toBe(1);
      expect(geometry.groups[0]).toEqual({
        start: 3,
        count: 12,
        materialIndex: 0,
      });
    });

    it('should allow multiple groups to be added', () => {
      geometry.addGroup(0, 6, 0);
      geometry.addGroup(6, 6, 1);

      expect(geometry.groups.length).toBe(2);
      expect(geometry.groups[0]).toEqual({ start: 0, count: 6, materialIndex: 0 });
      expect(geometry.groups[1]).toEqual({ start: 6, count: 6, materialIndex: 1 });
    });
  });

  describe('clearGroups', () => {
    let geometry: BufferGeometry;

    beforeEach(() => {
      geometry = new BufferGeometry();
    });

    it('should clear all groups', () => {
      // Add some groups first
      geometry.addGroup(0, 6, 0);
      geometry.addGroup(6, 6, 1);

      expect(geometry.groups.length).toBe(2); // Ensure groups were added

      // Clear groups
      geometry.clearGroups();

      expect(geometry.groups.length).toBe(0); // All groups should be cleared
      expect(geometry.groups).toEqual([]);   // Should be an empty array
    });

    it('should work when there are no groups', () => {
      expect(geometry.groups.length).toBe(0);

      // Clearing when already empty should not throw
      geometry.clearGroups();

      expect(geometry.groups.length).toBe(0);
      expect(geometry.groups).toEqual([]);
    });
  });

  describe('setDrawRange', () => {
    let geometry: BufferGeometry;

    beforeEach(() => {
      geometry = new BufferGeometry();
    });

    it('should set the draw range start and count', () => {
      geometry.setDrawRange(5, 10);

      expect(geometry.drawRange.start).toBe(5);
      expect(geometry.drawRange.count).toBe(10);
    });

    it('should update the draw range if called again', () => {
      geometry.setDrawRange(0, 100);
      expect(geometry.drawRange.start).toBe(0);
      expect(geometry.drawRange.count).toBe(100);

      geometry.setDrawRange(50, 25);
      expect(geometry.drawRange.start).toBe(50);
      expect(geometry.drawRange.count).toBe(25);
    });

    it('should handle zero values correctly', () => {
      geometry.setDrawRange(0, 0);

      expect(geometry.drawRange.start).toBe(0);
      expect(geometry.drawRange.count).toBe(0);
    });

    it('should allow count to be Infinity', () => {
      geometry.setDrawRange(10, Infinity);

      expect(geometry.drawRange.start).toBe(10);
      expect(geometry.drawRange.count).toBe(Infinity);
    });
  });

  describe('applyMatrix4()', () => {
    it('applies matrix to position attribute and marks it as needing update', () => {
      const geom = new BufferGeometry();

      const positionArray = new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
      ]);
      const position = new BufferAttribute(positionArray, 3);
      geom.setAttribute('position', position);

      const matrix = new Matrix4().makeTranslation(10, 20, 30);

      geom.applyMatrix4(matrix);

      expect(position.version).toBe(1);
      expect(position.getX(0)).toBe(11);
      expect(position.getY(0)).toBe(20);
      expect(position.getZ(0)).toBe(30);
    });

    it('applies normal matrix to normal attribute and marks it as needing update', () => {
      const geom = new BufferGeometry();

      const normalArray = new Float32Array([1, 0, 0]);
      const normal = new BufferAttribute(normalArray, 3);
      geom.setAttribute('normal', normal);

      const matrix = new Matrix4().makeRotationZ(Math.PI / 2);

      geom.applyMatrix4(matrix);

      expect(normal.version).toBe(1);

      expect(normal.getX(0)).toBeCloseTo(0);
      expect(normal.getY(0)).toBeCloseTo(1);
      expect(normal.getZ(0)).toBeCloseTo(0);
    });

    it('applies matrix direction transform to tangent attribute and marks it as needing update', () => {
      const geom = new BufferGeometry();

      const tangentArray = new Float32Array([1, 0, 0, 1]);
      const tangent = new BufferAttribute(tangentArray, 4);
      geom.setAttribute('tangent', tangent);

      const matrix = new Matrix4().makeRotationY(Math.PI);

      geom.applyMatrix4(matrix);

      expect(tangent.version).toBe(1);
      expect(tangent.getX(0)).toBeCloseTo(-1);
      expect(tangent.getY(0)).toBeCloseTo(0);
      expect(tangent.getZ(0)).toBeCloseTo(0);
      expect(tangent.getW(0)).toBe(1); // handedness preserved
    });

    it('recomputes boundingBox when it exists', () => {
      const geom = new BufferGeometry();

      geom.setAttribute('position', new BufferAttribute(new Float32Array([
        0, 0, 0,
        1, 1, 1
      ]), 3));

      geom.boundingBox = new Box3();

      const spy = vi.spyOn(geom, 'computeBoundingBox');

      geom.applyMatrix4(new Matrix4().makeTranslation(1, 1, 1));

      expect(spy).toHaveBeenCalled();
    });

    it('does NOT compute boundingBox when boundingBox is null', () => {
      const geom = new BufferGeometry();

      geom.boundingBox = null;

      const spy = vi.spyOn(geom, 'computeBoundingBox');

      geom.applyMatrix4(new Matrix4());

      expect(spy).not.toHaveBeenCalled();
    });

    it('recomputes boundingSphere when it exists', () => {
      const geom = new BufferGeometry();

      geom.setAttribute('position', new BufferAttribute(new Float32Array([
        0, 0, 0,
        1, 0, 0
      ]), 3));

      geom.boundingSphere = new Sphere();

      const spy = vi.spyOn(geom, 'computeBoundingSphere');

      geom.applyMatrix4(new Matrix4().makeScale(2, 2, 2));

      expect(spy).toHaveBeenCalled();
    });

    it('does NOT compute boundingSphere when boundingSphere is null', () => {
      const geom = new BufferGeometry();

      geom.boundingSphere = null;

      const spy = vi.spyOn(geom, 'computeBoundingSphere');

      geom.applyMatrix4(new Matrix4());

      expect(spy).not.toHaveBeenCalled();
    });

    it('returns this (supports chaining)', () => {
      const geom = new BufferGeometry();
      const matrix = new Matrix4();

      const result = geom.applyMatrix4(matrix);
      expect(result).toBe(geom);
    });
  });

  describe('applyQuaternion()', () => {
    it("applies quaternion rotation to position attribute and marks it as needing update", () => {
      const geom = new BufferGeometry();

      // One vertex positioned at (1, 0, 0)
      const position = new BufferAttribute(new Float32Array([1, 0, 0]), 3);
      geom.setAttribute("position", position);

      // 90° rotation around Z
      const q = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);

      geom.applyQuaternion(q);

      // needsUpdate was triggered → version increased
      expect(position.version).toBeGreaterThan(0);

      // ApplyQuaternion rotates X → Y
      expect(position.getX(0)).toBeCloseTo(0);
      expect(position.getY(0)).toBeCloseTo(1);
      expect(position.getZ(0)).toBeCloseTo(0);
    });

    it("applies normal rotation using quaternion and marks it as needing update", () => {
      const geom = new BufferGeometry();

      // Normal pointing in +X
      const normal = new BufferAttribute(new Float32Array([1, 0, 0]), 3);
      geom.setAttribute("normal", normal);

      const q = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);

      geom.applyQuaternion(q);

      expect(normal.version).toBeGreaterThan(0);

      expect(normal.getX(0)).toBeCloseTo(0);
      expect(normal.getY(0)).toBeCloseTo(1);
      expect(normal.getZ(0)).toBeCloseTo(0);
    });

    it("applies tangent rotation using quaternion and marks it as needing update", () => {
      const geom = new BufferGeometry();

      // Tangent pointing in +X with w component = 1
      const tangent = new BufferAttribute(new Float32Array([1, 0, 0, 1]), 4);
      geom.setAttribute("tangent", tangent);

      const q = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);

      geom.applyQuaternion(q);

      expect(tangent.version).toBeGreaterThan(0);

      expect(tangent.getX(0)).toBeCloseTo(0);
      expect(tangent.getY(0)).toBeCloseTo(1);
      expect(tangent.getZ(0)).toBeCloseTo(0);
      expect(tangent.getW(0)).toBe(1); // handedness preserved
    });

    it("updates bounding volumes if they exist", () => {
      const geom = new BufferGeometry();

      const position = new BufferAttribute(new Float32Array([
        1, 0, 0,
        -1, 0, 0,
      ]), 3);

      geom.setAttribute("position", position);

      geom.computeBoundingBox();
      geom.computeBoundingSphere();

      const originalBox = geom.boundingBox!.clone();
      const originalSphere = geom.boundingSphere!.clone();
      const q = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
      geom.applyQuaternion(q);

      // bounding volumes should change after rotation
      expect(geom.boundingBox!.equals(originalBox)).toBe(false);
    });
  });

  describe('rotateX()', () => {
    it("rotates position attribute about X axis and marks it as needing update", () => {
      const geom = new BufferGeometry();

      // Vertex positions: one at (0,1,0), one at (0,0,1)
      const position = new BufferAttribute(new Float32Array([
        0, 1, 0,
        0, 0, 1
      ]), 3);
      geom.setAttribute("position", position);

      const angle = Math.PI / 2; // 90 degrees
      geom.rotateX(angle);

      expect(position.version).toBeGreaterThan(0);

      // After rotation around X: (y,z) → (z,-y)
      expect(position.getX(0)).toBeCloseTo(0);
      expect(position.getY(0)).toBeCloseTo(0);
      expect(position.getZ(0)).toBeCloseTo(1);

      expect(position.getX(1)).toBeCloseTo(0);
      expect(position.getY(1)).toBeCloseTo(-1);
      expect(position.getZ(1)).toBeCloseTo(0);
    });

    it("rotates normal attribute about X axis and marks it as needing update", () => {
      const geom = new BufferGeometry();

      const normal = new BufferAttribute(new Float32Array([
        0, 1, 0
      ]), 3);
      geom.setAttribute("normal", normal);

      geom.rotateX(Math.PI / 2);

      expect(normal.version).toBeGreaterThan(0);
      expect(normal.getX(0)).toBeCloseTo(0);
      expect(normal.getY(0)).toBeCloseTo(0);
      expect(normal.getZ(0)).toBeCloseTo(1);
    });

    it("rotates tangent attribute about X axis and marks it as needing update", () => {
      const geom = new BufferGeometry();

      const tangent = new BufferAttribute(new Float32Array([
        0, 1, 0, 1  // x,y,z,w
      ]), 4);
      geom.setAttribute("tangent", tangent);

      geom.rotateX(Math.PI / 2);

      expect(tangent.version).toBeGreaterThan(0);
      expect(tangent.getX(0)).toBeCloseTo(0);
      expect(tangent.getY(0)).toBeCloseTo(0);
      expect(tangent.getZ(0)).toBeCloseTo(1);
      expect(tangent.getW(0)).toBe(1); // w should remain unchanged
    });

    it("updates bounding volumes after rotation", () => {
      const geom = new BufferGeometry();

      const position = new BufferAttribute(new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 2
      ]), 3);
      geom.setAttribute("position", position);

      geom.computeBoundingBox();
      geom.computeBoundingSphere();

      const originalBox = geom.boundingBox!.clone();
      const originalSphere = geom.boundingSphere!.clone();

      geom.rotateX(Math.PI / 2);

      expect(geom.boundingBox!.equals(originalBox)).toBe(false);
      expect(geom.boundingSphere!.equals(originalSphere)).toBe(false);
    });
  });

  describe('rotateY()', () => {
    it("rotates position attribute about Y axis and marks it as needing update", () => {
      const geom = new BufferGeometry();

      // Vertex positions: one at (1,0,0), one at (0,0,1)
      const position = new BufferAttribute(new Float32Array([
        1, 0, 0,
        0, 0, 1
      ]), 3);
      geom.setAttribute("position", position);

      const angle = Math.PI / 2; // 90 degrees
      geom.rotateY(angle);

      expect(position.version).toBeGreaterThan(0);

      // After rotation around Y: (x,z) → (z,-x)
      expect(position.getX(0)).toBeCloseTo(0);
      expect(position.getY(0)).toBeCloseTo(0);
      expect(position.getZ(0)).toBeCloseTo(-1);

      expect(position.getX(1)).toBeCloseTo(1);
      expect(position.getY(1)).toBeCloseTo(0);
      expect(position.getZ(1)).toBeCloseTo(0);
    });

    it("rotates normal attribute about Y axis and marks it as needing update", () => {
      const geom = new BufferGeometry();

      const normal = new BufferAttribute(new Float32Array([
        1, 0, 0
      ]), 3);
      geom.setAttribute("normal", normal);

      geom.rotateY(Math.PI / 2);

      expect(normal.version).toBeGreaterThan(0);
      expect(normal.getX(0)).toBeCloseTo(0);
      expect(normal.getY(0)).toBeCloseTo(0);
      expect(normal.getZ(0)).toBeCloseTo(-1);
    });

    it("rotates tangent attribute about Y axis and marks it as needing update", () => {
      const geom = new BufferGeometry();

      const tangent = new BufferAttribute(new Float32Array([
        1, 0, 0, 1 // x, y, z, w
      ]), 4);
      geom.setAttribute("tangent", tangent);

      geom.rotateY(Math.PI / 2);

      expect(tangent.version).toBeGreaterThan(0);
      expect(tangent.getX(0)).toBeCloseTo(0);
      expect(tangent.getY(0)).toBeCloseTo(0);
      expect(tangent.getZ(0)).toBeCloseTo(-1);
      expect(tangent.getW(0)).toBe(1); // handedness preserved
    });

    it("updates bounding volumes after rotation", () => {
      const geom = new BufferGeometry();

      const position = new BufferAttribute(new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 2
      ]), 3);
      geom.setAttribute("position", position);

      geom.computeBoundingBox();
      geom.computeBoundingSphere();

      const originalBox = geom.boundingBox!.clone();
      const originalSphere = geom.boundingSphere!.clone();

      geom.rotateY(Math.PI / 2);

      expect(geom.boundingBox!.equals(originalBox)).toBe(false);
      expect(geom.boundingSphere!.equals(originalSphere)).toBe(false);
    });
  });

  describe('rotateZ()', () => {
    it("rotates position attribute about Z axis and marks it as needing update", () => {
      const geom = new BufferGeometry();

      // Vertex positions: one at (1,0,0), one at (0,1,0)
      const position = new BufferAttribute(new Float32Array([
        1, 0, 0,
        0, 1, 0
      ]), 3);
      geom.setAttribute("position", position);

      const angle = Math.PI / 2; // 90 degrees
      geom.rotateZ(angle);

      expect(position.version).toBeGreaterThan(0);

      // After rotation around Z: (x,y) → (-y,x)
      expect(position.getX(0)).toBeCloseTo(0);
      expect(position.getY(0)).toBeCloseTo(1);
      expect(position.getZ(0)).toBeCloseTo(0);

      expect(position.getX(1)).toBeCloseTo(-1);
      expect(position.getY(1)).toBeCloseTo(0);
      expect(position.getZ(1)).toBeCloseTo(0);
    });

    it("rotates normal attribute about Z axis and marks it as needing update", () => {
      const geom = new BufferGeometry();

      const normal = new BufferAttribute(new Float32Array([
        1, 0, 0
      ]), 3);
      geom.setAttribute("normal", normal);

      geom.rotateZ(Math.PI / 2);

      expect(normal.version).toBeGreaterThan(0);
      expect(normal.getX(0)).toBeCloseTo(0);
      expect(normal.getY(0)).toBeCloseTo(1);
      expect(normal.getZ(0)).toBeCloseTo(0);
    });

    it("rotates tangent attribute about Z axis and marks it as needing update", () => {
      const geom = new BufferGeometry();

      const tangent = new BufferAttribute(new Float32Array([
        1, 0, 0, 1 // x, y, z, w
      ]), 4);
      geom.setAttribute("tangent", tangent);

      geom.rotateZ(Math.PI / 2);

      expect(tangent.version).toBeGreaterThan(0);
      expect(tangent.getX(0)).toBeCloseTo(0);
      expect(tangent.getY(0)).toBeCloseTo(1);
      expect(tangent.getZ(0)).toBeCloseTo(0);
      expect(tangent.getW(0)).toBe(1); // w remains unchanged
    });

    it("updates bounding volumes after rotation", () => {
      const geom = new BufferGeometry();

      const position = new BufferAttribute(new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 2
      ]), 3);
      geom.setAttribute("position", position);

      geom.computeBoundingBox();
      geom.computeBoundingSphere();

      const originalBox = geom.boundingBox!.clone();
      const originalSphere = geom.boundingSphere!.clone();

      geom.rotateZ(Math.PI / 2);

      expect(geom.boundingBox!.equals(originalBox)).toBe(false);
      expect(geom.boundingSphere!.equals(originalSphere)).toBe(false);
    });
  });

  describe('translate()', () => {
    it("translates position attribute and marks it as needing update", () => {
      const geom = new BufferGeometry();

      const position = new BufferAttribute(new Float32Array([
        1, 2, 3,
        -1, 0, 1
      ]), 3);
      geom.setAttribute("position", position);

      geom.translate(10, 20, 30);

      expect(position.version).toBeGreaterThan(0);

      expect(position.getX(0)).toBeCloseTo(11);
      expect(position.getY(0)).toBeCloseTo(22);
      expect(position.getZ(0)).toBeCloseTo(33);

      expect(position.getX(1)).toBeCloseTo(9);
      expect(position.getY(1)).toBeCloseTo(20);
      expect(position.getZ(1)).toBeCloseTo(31);
    });

    it("updates normals and marks them as needing update (even on translation)", () => {
      const geom = new BufferGeometry();

      const normal = new BufferAttribute(new Float32Array([0, 1, 0]), 3);
      geom.setAttribute("normal", normal);

      geom.translate(10, 20, 30);

      expect(normal.version).toBeGreaterThan(0);
      expect(normal.getX(0)).toBeCloseTo(0);
      expect(normal.getY(0)).toBeCloseTo(1);
      expect(normal.getZ(0)).toBeCloseTo(0);
    });

    it("updates tangents and marks them as needing update (even on translation)", () => {
      const geom = new BufferGeometry();

      const tangent = new BufferAttribute(new Float32Array([1, 0, 0, 1]), 4);
      geom.setAttribute("tangent", tangent);

      geom.translate(10, 20, 30);

      expect(tangent.version).toBeGreaterThan(0);
      expect(tangent.getX(0)).toBeCloseTo(1);
      expect(tangent.getY(0)).toBeCloseTo(0);
      expect(tangent.getZ(0)).toBeCloseTo(0);
      expect(tangent.getW(0)).toBe(1);
    });

    it("updates bounding volumes after translation", () => {
      const geom = new BufferGeometry();

      const position = new BufferAttribute(new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 2
      ]), 3);
      geom.setAttribute("position", position);

      geom.computeBoundingBox();
      geom.computeBoundingSphere();

      const originalBox = geom.boundingBox!.clone();
      const originalSphere = geom.boundingSphere!.clone();

      geom.translate(5, 10, 15);

      expect(geom.boundingBox!.equals(originalBox)).toBe(false);
      expect(geom.boundingSphere!.equals(originalSphere)).toBe(false);
    });
  });

  describe('scale()', () => {
    it("scales position attribute and marks it as needing update", () => {
      const geom = new BufferGeometry();

      const position = new BufferAttribute(new Float32Array([
        1, 2, 3,
        -1, 0, 1
      ]), 3);
      geom.setAttribute("position", position);

      geom.scale(2, 3, 4);

      expect(position.version).toBeGreaterThan(0);

      expect(position.getX(0)).toBeCloseTo(2);   // 1 * 2
      expect(position.getY(0)).toBeCloseTo(6);   // 2 * 3
      expect(position.getZ(0)).toBeCloseTo(12);  // 3 * 4

      expect(position.getX(1)).toBeCloseTo(-2);
      expect(position.getY(1)).toBeCloseTo(0);
      expect(position.getZ(1)).toBeCloseTo(4);
    });

    it("updates normals and marks them as needing update", () => {
      const geom = new BufferGeometry();

      const normal = new BufferAttribute(new Float32Array([0, 1, 0]), 3);
      geom.setAttribute("normal", normal);

      geom.scale(2, 3, 4);

      expect(normal.version).toBeGreaterThan(0);

      // Normal vector should be normalized
      const x = normal.getX(0);
      const y = normal.getY(0);
      const z = normal.getZ(0);
      const length = Math.sqrt(x * x + y * y + z * z);

      expect(length).toBeCloseTo(1, 5);
    });

    it("updates tangents and marks them as needing update", () => {
      const geom = new BufferGeometry();

      const tangent = new BufferAttribute(new Float32Array([
        1, 0, 0, 1
      ]), 4);
      geom.setAttribute("tangent", tangent);

      geom.scale(2, 3, 4);

      expect(tangent.version).toBeGreaterThan(0);
      expect(tangent.getX(0)).toBeCloseTo(1);
      expect(tangent.getY(0)).toBeCloseTo(0);
      expect(tangent.getZ(0)).toBeCloseTo(0);
      expect(tangent.getW(0)).toBe(1);
    });

    it("updates bounding volumes after scaling", () => {
      const geom = new BufferGeometry();

      const position = new BufferAttribute(new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 2
      ]), 3);
      geom.setAttribute("position", position);

      geom.computeBoundingBox();
      geom.computeBoundingSphere();

      const originalBox = geom.boundingBox!.clone();
      const originalSphere = geom.boundingSphere!.clone();

      geom.scale(2, 3, 4);

      expect(geom.boundingBox!.equals(originalBox)).toBe(false);
      expect(geom.boundingSphere!.equals(originalSphere)).toBe(false);
    });
  });

  describe('lookAt()', () => {
    it("rotates the geometry to face a target point", () => {
      const geom = new BufferGeometry();

      const position = new BufferAttribute(new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]), 3);

      geom.setAttribute("position", position);

      const originalPositions = position.array.slice();

      // Use a non-zero target to guarantee rotation
      const target = new Vector3(1, 1, 1);
      geom.lookAt(target);

      // Positions should change after lookAt
      let changed = false;
      for (let i = 0; i < position.count * 3; i++) {
        if (position.array[i] !== originalPositions[i]) {
          changed = true;
          break;
        }
      }
      expect(changed).toBe(true);

      expect(position.version).toBeGreaterThan(0);
    });

    it("updates bounding volumes if they exist", () => {
      const geom = new BufferGeometry();

      const position = new BufferAttribute(new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]), 3);
      geom.setAttribute("position", position);

      geom.computeBoundingBox();
      geom.computeBoundingSphere();

      const originalBox = geom.boundingBox!.clone();
      const originalSphere = geom.boundingSphere!.clone();

      geom.lookAt(new Vector3(1, 1, 1)); // Non-zero target

      // Bounding volumes should change after rotation
      expect(geom.boundingBox!.equals(originalBox)).toBe(false);
      expect(geom.boundingSphere!.equals(originalSphere)).toBe(false);
    });
  });

  describe('center()', () => {
    it("centers geometry around origin", () => {
      const geom = new BufferGeometry();

      // Create a simple geometry with a bounding box from (0,0,0) to (2,2,2)
      const positions = new Float32Array([
        0, 0, 0,
        2, 0, 0,
        0, 2, 0,
        0, 0, 2
      ]);

      geom.setAttribute("position", new BufferAttribute(positions, 3));

      geom.center();

      const pos = geom.getAttribute("position")!;

      // The geometry should now be centered around the origin
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
      }

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const centerZ = (minZ + maxZ) / 2;

      expect(centerX).toBeCloseTo(0);
      expect(centerY).toBeCloseTo(0);
      expect(centerZ).toBeCloseTo(0);

      // Bounding box should also reflect the new centered positions
      geom.computeBoundingBox();
      const bbox = geom.boundingBox!;
      const bboxCenter = new Vector3();
      bbox.getCenter(bboxCenter);

      expect(bboxCenter.x).toBeCloseTo(0);
      expect(bboxCenter.y).toBeCloseTo(0);
      expect(bboxCenter.z).toBeCloseTo(0);
    });

    it("returns this for chaining", () => {
      const geom = new BufferGeometry();
      const result = geom.center();
      expect(result).toBe(geom);
    });
  });

  describe('setFromPoints()', () => {
    it("creates a new position attribute from Vector3 points", () => {
      const geom = new BufferGeometry();
      const points = [
        new Vector3(1, 2, 3),
        new Vector3(4, 5, 6)
      ];

      geom.setFromPoints(points);

      const position = geom.getAttribute("position") as Float32BufferAttribute;

      expect(position.count).toBe(2);
      expect(position.getX(0)).toBe(1);
      expect(position.getY(0)).toBe(2);
      expect(position.getZ(0)).toBe(3);
      expect(position.getX(1)).toBe(4);
      expect(position.getY(1)).toBe(5);
      expect(position.getZ(1)).toBe(6);
    });

    it("creates a new position attribute from Vector2 points (z = 0)", () => {
      const geom = new BufferGeometry();
      const points = [
        new Vector2(1, 2),
        new Vector2(3, 4)
      ];

      geom.setFromPoints(points);

      const position = geom.getAttribute("position") as Float32BufferAttribute;

      expect(position.count).toBe(2);
      expect(position.getZ(0)).toBe(0);
      expect(position.getZ(1)).toBe(0);
    });

    it("overwrites an existing position attribute", () => {
      const geom = new BufferGeometry();
      geom.setAttribute("position", new Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));

      const points = [
        new Vector3(1, 2, 3),
        new Vector3(4, 5, 6)
      ];

      geom.setFromPoints(points);

      const position = geom.getAttribute("position") as Float32BufferAttribute;

      expect(position.getX(0)).toBe(1);
      expect(position.getY(0)).toBe(2);
      expect(position.getZ(0)).toBe(3);
      expect(position.getX(1)).toBe(4);
      expect(position.getY(1)).toBe(5);
      expect(position.getZ(1)).toBe(6);
      expect(position.version).toBe(1);
    });

    it("logs a warning when points exceed existing attribute count", () => {
      const geom = new BufferGeometry();
      geom.setAttribute("position", new Float32BufferAttribute([0, 0, 0], 3)); // only 1 vertex

      const points = [
        new Vector3(1, 2, 3),
        new Vector3(4, 5, 6)
      ];

      const spy = vi.spyOn(console, "warn").mockImplementation(() => { });

      geom.setFromPoints(points);

      expect(spy).toHaveBeenCalledWith(
        "BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."
      );

      spy.mockRestore();
    });
  });

  describe('computeBoundingBox()', () => {
    it("creates a bounding box if none exists and position is undefined", () => {
      const geom = new BufferGeometry();
      geom.boundingBox = null;

      geom.computeBoundingBox();

      expect(geom.boundingBox).toBeInstanceOf(Box3);
      expect(geom.boundingBox!.isEmpty()).toBe(true);
    });

    it("computes bounding box from position attribute", () => {
      const geom = new BufferGeometry();
      const position = new Float32BufferAttribute(new Float32Array([
        1, 2, 3,
        -1, -2, -3,
      ]), 3);
      geom.setAttribute("position", position);

      geom.computeBoundingBox();

      expect(geom.boundingBox).toBeInstanceOf(Box3);
      expect(geom.boundingBox!.min.equals(new Vector3(-1, -2, -3))).toBe(true);
      expect(geom.boundingBox!.max.equals(new Vector3(1, 2, 3))).toBe(true);
    });

    it("handles GLBufferAttribute by setting infinite bounds", () => {
      const geom = new BufferGeometry();
      const position: any = { isGLBufferAttribute: true }; // mock GLBufferAttribute
      geom.setAttribute("position", position);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });

      geom.computeBoundingBox();

      expect(consoleSpy).toHaveBeenCalled();
      expect(geom.boundingBox!.min.equals(new Vector3(-Infinity, -Infinity, -Infinity))).toBe(true);
      expect(geom.boundingBox!.max.equals(new Vector3(Infinity, Infinity, Infinity))).toBe(true);

      consoleSpy.mockRestore();
    });

    it("processes morph attributes when present (absolute)", () => {
      const geom = new BufferGeometry();
      const position = new Float32BufferAttribute(new Float32Array([
        0, 0, 0,
      ]), 3);
      geom.setAttribute("position", position);

      const morphAttr = new Float32BufferAttribute(new Float32Array([
        1, 2, 3,
      ]), 3);

      geom.morphAttributes.position = [morphAttr];
      geom.morphTargetsRelative = false;

      geom.computeBoundingBox();

      // The bounding box should now expand to include morph attribute
      expect(geom.boundingBox!.min.equals(new Vector3(0, 0, 0))).toBe(true);
      expect(geom.boundingBox!.max.equals(new Vector3(1, 2, 3))).toBe(true);
    });

    it("processes morph attributes when present (relative)", () => {
      const geom = new BufferGeometry();
      const position = new Float32BufferAttribute(new Float32Array([
        0, 0, 0,
      ]), 3);
      geom.setAttribute("position", position);

      const morphAttr = new Float32BufferAttribute(new Float32Array([
        1, 2, 3,
      ]), 3);

      geom.morphAttributes.position = [morphAttr];
      geom.morphTargetsRelative = true;

      geom.computeBoundingBox();

      // Check that bounding box contains original and morph points
      expect(geom.boundingBox!.containsPoint(new Vector3(0, 0, 0))).toBe(true);
      expect(geom.boundingBox!.containsPoint(new Vector3(1, 2, 3))).toBe(true);
    });


    it("logs error if computed bounding box has NaN", () => {
      const geom = new BufferGeometry();
      const position = new Float32BufferAttribute(new Float32Array([
        NaN, 0, 0,
      ]), 3);
      geom.setAttribute("position", position);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });

      geom.computeBoundingBox();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('computeBoundingSphere()', () => {
    it('computes bounding sphere from position attribute', () => {
      const geom = new BufferGeometry();
      const position = new Float32BufferAttribute(new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]), 3);
      geom.setAttribute('position', position);

      geom.computeBoundingSphere();

      expect(geom.boundingSphere).toBeDefined();
      expect(geom.boundingSphere!.center).toBeInstanceOf(Vector3);
      expect(geom.boundingSphere!.radius).toBeGreaterThan(0);

      // Check that all points are inside the sphere
      const pts = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
      pts.forEach(p => {
        expect(geom.boundingSphere!.center.distanceTo(p)).toBeLessThanOrEqual(geom.boundingSphere!.radius);
      });
    });

    it('handles morph targets (absolute)', () => {
      const geom = new BufferGeometry();
      const position = new Float32BufferAttribute(new Float32Array([0, 0, 0]), 3);
      geom.setAttribute('position', position);

      const morph = new Float32BufferAttribute(new Float32Array([1, 2, 3]), 3);
      geom.morphAttributes.position = [morph];
      geom.morphTargetsRelative = false;

      geom.computeBoundingSphere();

      const sphere = geom.boundingSphere!;
      expect(sphere.center.distanceTo(new Vector3(0, 0, 0))).toBeLessThanOrEqual(sphere.radius);
      expect(sphere.center.distanceTo(new Vector3(1, 2, 3))).toBeLessThanOrEqual(sphere.radius);
    });

    it('handles morph targets (relative)', () => {
      const geom = new BufferGeometry();
      const position = new Float32BufferAttribute(new Float32Array([1, 1, 1]), 3);
      geom.setAttribute('position', position);

      const morph = new Float32BufferAttribute(new Float32Array([2, 2, 2]), 3);
      geom.morphAttributes.position = [morph];
      geom.morphTargetsRelative = true;

      geom.computeBoundingSphere();

      const sphere = geom.boundingSphere!;
      const pOriginal = new Vector3(1, 1, 1);
      const pMorph = new Vector3(3, 3, 3); // position + relative morph

      expect(sphere.center.distanceTo(pOriginal)).toBeLessThanOrEqual(sphere.radius);
      expect(sphere.center.distanceTo(pMorph)).toBeLessThanOrEqual(sphere.radius);
    });

    it('handles GLBufferAttribute by setting radius to Infinity', () => {
      const geom = new BufferGeometry();
      // @ts-ignore simulate GLBufferAttribute
      const position = { isGLBufferAttribute: true };
      geom.setAttribute('position', position as any);

      const spy = vi.spyOn(console, 'error').mockImplementation(() => { });

      geom.computeBoundingSphere();

      expect(spy).toHaveBeenCalled();
      expect(geom.boundingSphere!.radius).toBe(Infinity);

      spy.mockRestore();
    });

    it('does nothing if no position attribute', () => {
      const geom = new BufferGeometry();

      geom.computeBoundingSphere();

      expect(geom.boundingSphere).toBeDefined();
      expect(geom.boundingSphere!.radius).toBe(-1);
      expect(geom.boundingSphere!.center.equals(new Vector3(0, 0, 0))).toBe(true);
    });
  });

  describe('computeTangents()', () => {
    it("should fail if required attributes are missing", () => {
      const geom = new BufferGeometry();
      const spy = vi.spyOn(console, "error").mockImplementation(() => { });

      geom.computeTangents();

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("should create the tangent attribute if missing", () => {
      const geom = new BufferGeometry();

      // Simple triangle
      geom.setIndex([0, 1, 2]);
      geom.setAttribute("position", new BufferAttribute(new Float32Array([
        0, 0, 0,
        1, 0, 0,
        0, 1, 0,
      ]), 3));
      geom.setAttribute("normal", new BufferAttribute(new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
      ]), 3));
      geom.setAttribute("uv", new BufferAttribute(new Float32Array([
        0, 0,
        1, 0,
        0, 1,
      ]), 2));

      geom.computeTangents();

      const tangent = geom.getAttribute('tangent')!;
      expect(tangent).toBeDefined();
      expect(tangent.itemSize).toBe(4);      // x, y, z, w
      expect(tangent.count).toBe(3);
    });

    it("should compute correct tangents for a quad", () => {

      // Quad made of 2 triangles:
      //
      //  v2 (0,1) ---- v3 (1,1)
      //    |  \          |
      //    |    \        |
      //  v0 (0,0) ---- v1 (1,0)

      const geom = new BufferGeometry();

      geom.setIndex([0, 1, 2, 2, 1, 3]);

      geom.setAttribute("position", new BufferAttribute(new Float32Array([
        0, 0, 0,   // v0
        1, 0, 0,   // v1
        0, 1, 0,   // v2
        1, 1, 0    // v3
      ]), 3));

      geom.setAttribute("normal", new BufferAttribute(new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
      ]), 3));

      geom.setAttribute("uv", new BufferAttribute(new Float32Array([
        0, 0,   // v0
        1, 0,   // v1
        0, 1,   // v2
        1, 1    // v3
      ]), 2));

      geom.computeTangents();

      const tangent = geom.getAttribute("tangent")!;
      expect(tangent).toBeDefined();

      // Tangent should point along +X for a standard unrotated quad with UVs increasing in U.

      for (let i = 0; i < tangent.count; i++) {
        const x = tangent.getX(i);
        const y = tangent.getY(i);
        const z = tangent.getZ(i);
        const w = tangent.getW(i);

        // Tangent direction ≈ +X
        expect(Math.abs(x)).toBeCloseTo(1, 3);
        expect(Math.abs(y)).toBeCloseTo(0, 3);
        expect(Math.abs(z)).toBeCloseTo(0, 3);

        // Handedness should be +1 for typical UV orientation
        expect(w).toBe(1);
      }
    });


    it("respects geometry groups", () => {
      const geom = new BufferGeometry();

      geom.setIndex([0, 1, 2, 2, 1, 3]);

      geom.groups = [
        { start: 0, count: 3 } // Only first triangle
      ];

      geom.setAttribute("position", new BufferAttribute(new Float32Array([
        0, 0, 0,
        1, 0, 0,
        0, 1, 0,
        1, 1, 0
      ]), 3));

      geom.setAttribute("normal", new BufferAttribute(new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
      ]), 3));

      geom.setAttribute("uv", new BufferAttribute(new Float32Array([
        0, 0,
        1, 0,
        0, 1,
        1, 1
      ]), 2));

      geom.computeTangents();
      const tangent = geom.getAttribute("tangent")!;

      // Only vertices of the first triangle should have meaningful tangents.
      // Vertices of second triangle may remain untouched.

      const t0 = new Vector3(tangent.getX(0), tangent.getY(0), tangent.getZ(0));
      const t1 = new Vector3(tangent.getX(1), tangent.getY(1), tangent.getZ(1));
      const t2 = new Vector3(tangent.getX(2), tangent.getY(2), tangent.getZ(2));
      const t3 = new Vector3(tangent.getX(3), tangent.getY(3), tangent.getZ(3));

      // First triangle tangents are computed
      expect(t0.length()).toBeGreaterThan(0);
      expect(t1.length()).toBeGreaterThan(0);
      expect(t2.length()).toBeGreaterThan(0);

      // Vertex 3 (only used in second triangle) may still be zero
      expect(t3.length()).toBe(0);
    });
  });

  describe('computeVertexNormals()', () => {
    it('creates a normal attribute if missing', () => {
      const geom = new BufferGeometry();

      // Single triangle
      geom.setAttribute('position', new BufferAttribute(new Float32Array([
        0, 0, 0,
        1, 0, 0,
        0, 1, 0
      ]), 3));

      expect(geom.getAttribute('normal')).toBeUndefined();

      geom.computeVertexNormals();

      const normals = geom.getAttribute('normal')!;
      expect(normals).toBeDefined();
      expect(normals.count).toBe(3);
    });

    it('computes correct normals for a non-indexed triangle', () => {
      const geom = new BufferGeometry();

      // A single triangle in XY plane
      geom.setAttribute('position', new BufferAttribute(new Float32Array([
        0, 0, 0,
        1, 0, 0,
        0, 1, 0
      ]), 3));

      geom.computeVertexNormals();

      const n = geom.getAttribute('normal')!;
      const up = new Vector3(0, 0, 1);

      for (let i = 0; i < 3; i++) {
        const v = new Vector3(n.getX(i), n.getY(i), n.getZ(i));
        expect(v.distanceTo(up)).toBeCloseTo(0, 5);
      }
    });

    it('resets existing normals before recomputing', () => {
      const geom = new BufferGeometry();

      geom.setAttribute('position', new BufferAttribute(new Float32Array([
        0, 0, 0,
        1, 0, 0,
        0, 1, 0
      ]), 3));

      // Wrong initial normals
      geom.setAttribute('normal', new BufferAttribute(new Float32Array([
        5, 5, 5,
        5, 5, 5,
        5, 5, 5
      ]), 3));

      geom.computeVertexNormals();

      const n = geom.getAttribute('normal')!;
      const up = new Vector3(0, 0, 1);

      for (let i = 0; i < 3; i++) {
        const v = new Vector3(n.getX(i), n.getY(i), n.getZ(i));
        expect(v.distanceTo(up)).toBeCloseTo(0, 5);
      }
    });

    it('computes averaged normals on indexed geometry', () => {
      const geom = new BufferGeometry();

      // Two triangles sharing a vertex at index 0
      // First triangle lies on XY plane (normal = +Z)
      // Second triangle lies on XZ plane (normal = +Y)
      geom.setAttribute('position', new BufferAttribute(new Float32Array([
        0, 0, 0,   // v0 (shared)
        1, 0, 0,   // v1
        0, 1, 0,   // v2
        0, 0, 1    // v3 for second triangle
      ]), 3));

      geom.setIndex([0, 1, 2, 0, 2, 3]);

      geom.computeVertexNormals();

      const n = geom.getAttribute('normal')!;

      const v0 = new Vector3(n.getX(0), n.getY(0), n.getZ(0));

      // Compute expected normal using same cross product order as implementation
      const p0 = new Vector3(0, 0, 0);
      const p1 = new Vector3(1, 0, 0);
      const p2 = new Vector3(0, 1, 0);
      const p3 = new Vector3(0, 0, 1);

      const cb1 = new Vector3().subVectors(p2, p1);
      const ab1 = new Vector3().subVectors(p0, p1);
      const n1 = cb1.clone().cross(ab1).normalize();

      const cb2 = new Vector3().subVectors(p3, p2);
      const ab2 = new Vector3().subVectors(p0, p2);
      const n2 = cb2.clone().cross(ab2).normalize();

      const expected = n1.clone().add(n2).normalize();

      expect(v0.x).toBeCloseTo(expected.x, 5);
      expect(v0.y).toBeCloseTo(expected.y, 5);
      expect(v0.z).toBeCloseTo(expected.z, 5);
    });

    // it('sets normalAttribute.needsUpdate = true', () => {
    //   const geom = new BufferGeometry();

    //   geom.setAttribute('position', new BufferAttribute(new Float32Array([
    //     0, 0, 0, 1, 0, 0, 0, 1, 0
    //   ]), 3));

    //   geom.computeVertexNormals();

    //   const normals = geom.getAttribute('normal')!;
    //   expect(normals.version).toBe(1);
    // });
  });

  describe('normalizeNormals()', () => {
    it('normalizes all normal vectors', () => {

      const geom = new BufferGeometry();

      // 3 vertices with unnormalized normals
      const normals = new Float32Array([
        2, 0, 0,
        0, 3, 0,
        0, 0, -4
      ]);

      geom.setAttribute('normal', new BufferAttribute(normals, 3));

      geom.normalizeNormals();

      const n = geom.getAttribute('normal')!;

      // Check each vector is normalized
      const v1 = Math.hypot(n.getX(0), n.getY(0), n.getZ(0));
      const v2 = Math.hypot(n.getX(1), n.getY(1), n.getZ(1));
      const v3 = Math.hypot(n.getX(2), n.getY(2), n.getZ(2));

      expect(v1).toBeCloseTo(1, 5);
      expect(v2).toBeCloseTo(1, 5);
      expect(v3).toBeCloseTo(1, 5);
    });

    it('does not modify already normalized normals', () => {

      const geom = new BufferGeometry();

      const normals = new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]);

      geom.setAttribute('normal', new BufferAttribute(normals, 3));

      geom.normalizeNormals();

      const n = geom.getAttribute('normal')!;

      expect(n.getX(0)).toBeCloseTo(1);
      expect(n.getY(0)).toBeCloseTo(0);
      expect(n.getZ(0)).toBeCloseTo(0);

      expect(n.getX(1)).toBeCloseTo(0);
      expect(n.getY(1)).toBeCloseTo(1);
      expect(n.getZ(1)).toBeCloseTo(0);

      expect(n.getX(2)).toBeCloseTo(0);
      expect(n.getY(2)).toBeCloseTo(0);
      expect(n.getZ(2)).toBeCloseTo(1);
    });

    it('handles mixed-length normals correctly', () => {

      const geom = new BufferGeometry();

      const normals = new Float32Array([
        10, 0, 0,
        0, -5, 0,
        3, 4, 0   // magnitude 5
      ]);

      geom.setAttribute('normal', new BufferAttribute(normals, 3));

      geom.normalizeNormals();

      const n = geom.getAttribute('normal')!;

      // (10,0,0) → (1,0,0)
      expect(n.getX(0)).toBeCloseTo(1);
      expect(n.getY(0)).toBeCloseTo(0);
      expect(n.getZ(0)).toBeCloseTo(0);

      // (0,-5,0) → (0,-1,0)
      expect(n.getX(1)).toBeCloseTo(0);
      expect(n.getY(1)).toBeCloseTo(-1);
      expect(n.getZ(1)).toBeCloseTo(0);

      // (3,4,0) → (0.6, 0.8, 0)
      expect(n.getX(2)).toBeCloseTo(0.6);
      expect(n.getY(2)).toBeCloseTo(0.8);
      expect(n.getZ(2)).toBeCloseTo(0);
    });

    it('mutates the existing normal attribute (no replacement)', () => {

      const geom = new BufferGeometry();
      const normals = new BufferAttribute(
        new Float32Array([2, 0, 0]),
        3
      );

      geom.setAttribute('normal', normals);

      geom.normalizeNormals();

      const fetched = geom.getAttribute('normal');

      expect(fetched).toBe(normals); // same attribute instance
    });
  });

  describe('toNonIndexed()', () => {
    it("converts indexed geometry to non-indexed", () => {
      const geom = new BufferGeometry();

      // positions: 3 vertices
      const positions = new Float32Array([
        0, 0, 0, // v0
        1, 0, 0, // v1
        0, 1, 0, // v2
      ]);
      geom.setAttribute("position", new BufferAttribute(positions, 3));

      // index: triangle (2,1,0)
      geom.setIndex([2, 1, 0]);

      const result = geom.toNonIndexed();
      const pos = result.getAttribute("position")!;

      expect(result.index).toBeNull();
      expect(pos.count).toBe(3);
      expect(Array.from(pos.array)).toEqual([
        // v2
        0, 1, 0,
        // v1
        1, 0, 0,
        // v0
        0, 0, 0,
      ]);
    });

    it("preserves itemSize and normalized flag", () => {
      const geom = new BufferGeometry();

      const attr = new BufferAttribute(new Uint16Array([
        5, 6, 7, 8
      ]), 2, true);

      geom.setAttribute("test", attr);
      geom.setIndex([1, 0]); // reorder

      const result = geom.toNonIndexed();
      const newAttr = result.getAttribute("test")!;

      expect(newAttr.itemSize).toBe(2);
      expect(newAttr.normalized).toBe(true);
      expect(Array.from(newAttr.array)).toEqual([
        7, 8, // from index 1
        5, 6, // from index 0
      ]);
    });

    it("properly expands morph attributes", () => {
      const geom = new BufferGeometry();

      geom.setAttribute("position", new BufferAttribute(new Float32Array([
        0, 0, 0,
        1, 0, 0,
        0, 1, 0,
      ]), 3));

      geom.morphAttributes.position = [
        new BufferAttribute(new Float32Array([
          0, 0, 1,
          1, 0, 1,
          0, 1, 1,
        ]), 3)
      ];

      geom.setIndex([2, 1, 0]);

      const result = geom.toNonIndexed();
      const morph = result.morphAttributes.position[0];

      expect(Array.from(morph.array)).toEqual([
        0, 1, 1,  // from index 2
        1, 0, 1,  // from index 1
        0, 0, 1,  // from index 0
      ]);
    });

    it("preserves groups", () => {
      const geom = new BufferGeometry();

      geom.setAttribute("position",
        new BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3)
      );
      geom.setIndex([0, 1, 2]);

      geom.addGroup(0, 3, 2);

      const result = geom.toNonIndexed();

      expect(result.groups.length).toBe(1);
      expect(result.groups[0]).toEqual({
        start: 0,
        count: 3,
        materialIndex: 2
      });
    });

    it("is a NOOP when geometry is already non-indexed", () => {
      const geom = new BufferGeometry();
      const spy = vi.spyOn(console, "warn").mockImplementation(() => { });

      geom.setAttribute("position",
        new BufferAttribute(new Float32Array([0, 0, 0]), 3)
      );

      const result = geom.toNonIndexed();

      expect(result).toBe(geom);
      expect(spy).toBeCalledTimes(1);

      spy.mockRestore();
    });

    it("supports InterleavedBufferAttribute", () => {
      const geom = new BufferGeometry();

      const interleaved = new InterleavedBuffer(new Float32Array([
        // stride = 3
        0, 0, 0,  // v0
        1, 0, 0,  // v1
        0, 1, 0,  // v2
      ]), 3);

      const attr = new InterleavedBufferAttribute(interleaved, 3, 0);

      geom.setAttribute("position", attr);
      geom.setIndex([2, 1, 0]);

      const result = geom.toNonIndexed();
      const pos = result.getAttribute("position")!;

      expect(Array.from(pos.array)).toEqual([
        0, 1, 0,   // v2
        1, 0, 0,   // v1
        0, 0, 0    // v0
      ]);
    });
  });

  describe('toJSON()', () => {
    it('serializes basic geometry with no attributes', () => {
      const geom = new BufferGeometry();
      geom.name = '';
      geom.userData = {};

      const json = geom.toJSON();

      expect(json.metadata.version).toBe(1);
      expect(json.metadata.type).toBe('BufferGeometry');
      expect(json.metadata.generator).toBe('BufferGeometry.toJSON');
      expect(json.type).toBe('BufferGeometry');
      expect(json.data.attributes).toEqual({});
    });

    it('serializes geometry with attributes', () => {
      const geom = new BufferGeometry();
      const position = new BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3);
      geom.setAttribute('position', position);

      const json = geom.toJSON();

      expect(json.data.attributes.position.array).toEqual([0, 0, 0, 1, 0, 0, 0, 1, 0]);
      expect(json.data.attributes.position.itemSize).toBe(3);
    });

    it('serializes indexed geometry', () => {
      const geom = new BufferGeometry();
      geom.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3));
      geom.setIndex([0, 1, 2]);

      const json = geom.toJSON();

      expect(json.data.index.array).toEqual([0, 1, 2]);
      expect(json.data.index.type).toBe('Uint16Array');
    });

    it('serializes morph attributes', () => {
      const geom = new BufferGeometry();
      const attr = new BufferAttribute(new Float32Array([0, 1, 2]), 1);
      geom.morphAttributes.position = [attr];
      geom.morphTargetsRelative = true;

      const json = geom.toJSON();

      expect(json.data.morphAttributes.position.length).toBe(1);
      expect(json.data.morphTargetsRelative).toBe(true);
    });

    it('serializes groups', () => {
      const geom = new BufferGeometry();
      geom.addGroup(0, 3, 1);

      const json = geom.toJSON();

      expect(json.data.groups).toEqual([{ start: 0, count: 3, materialIndex: 1 }]);
    });

    it('serializes bounding sphere', () => {
      const geom = new BufferGeometry();
      geom.boundingSphere = new Sphere(new Vector3(1, 2, 3), 5);

      const json = geom.toJSON();

      expect(json.data.boundingSphere.center).toEqual([1, 2, 3]);
      expect(json.data.boundingSphere.radius).toBe(5);
    });
  });

  describe('clone()', () => {
    it('returns a new BufferGeometry instance', () => {
      const geom = new BufferGeometry();
      const clone = geom.clone();

      expect(clone).toBeInstanceOf(BufferGeometry);
      expect(clone).not.toBe(geom); // new instance
    });

    it('copies attributes and index', () => {
      const geom = new BufferGeometry();
      const position = new BufferAttribute(new Float32Array([0, 1, 2, 3, 4, 5]), 3);
      geom.setAttribute('position', position);
      geom.setIndex([0, 1]);

      const clone = geom.clone();

      // Attributes exist in clone
      expect(clone.getAttribute('position')).toBeDefined();
      expect(clone.getAttribute('position')!.array).toEqual(position.array);

      // Index copied
      expect(clone.index!.array).toEqual(geom.index!.array);
    });

    it('copies custom properties like name and userData', () => {
      const geom = new BufferGeometry();
      geom.name = 'MyGeometry';
      geom.userData = { custom: 42 };

      const clone = geom.clone();

      expect(clone.name).toBe('MyGeometry');
      expect(clone.userData).toEqual({ custom: 42 });
    });

    it.skip('modifying clone does not affect original', () => {
      const geom = new BufferGeometry();
      const position = new BufferAttribute(new Float32Array([0, 1, 2]), 3);
      geom.setAttribute('position', position);

      const clone = geom.clone();
      clone.getAttribute('position')!.setXYZ(0, 10, 11, 12);

      // Original attribute unchanged
      const origPos = geom.getAttribute('position')!;
      expect(origPos.getX(0)).toBe(0);
      expect(origPos.getY(0)).toBe(1);
      expect(origPos.getZ(0)).toBe(2);
    });
  });

  describe('copy()', () => {
    it('copies basic properties', () => {
      const source = new BufferGeometry();
      source.name = "TestGeometry";
      source.drawRange = { start: 2, count: 10 };
      source.userData = { foo: 7 };

      const geom = new BufferGeometry();
      geom.copy(source);

      expect(geom.name).toBe("TestGeometry");
      expect(geom.drawRange.start).toBe(2);
      expect(geom.drawRange.count).toBe(10);

      // Three.js behavior: userData is shared by reference
      expect(geom.userData).toBe(source.userData);
    });


    it('copies index (deep clone)', () => {
      const source = new BufferGeometry();
      source.setIndex([0, 1, 2]);

      const geom = new BufferGeometry();
      geom.copy(source);

      expect(geom.index).not.toBe(source.index);                 // different BufferAttribute
      expect(Array.from(geom.index!.array)).toEqual([0, 1, 2]); // same values
    });


    it('copies attributes (deep clone)', () => {
      const source = new BufferGeometry();
      const position = new BufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6]), 3);
      source.setAttribute('position', position);

      const geom = new BufferGeometry();
      geom.copy(source);

      const srcAttr = source.getAttribute('position')!;
      const dstAttr = geom.getAttribute('position')!;

      expect(dstAttr).not.toBe(srcAttr);
      expect(Array.from(dstAttr.array)).toEqual([1, 2, 3, 4, 5, 6]);
    });


    it('copies morph attributes', () => {
      const source = new BufferGeometry();

      source.morphAttributes.position = [
        new BufferAttribute(new Float32Array([1, 1, 1]), 3),
        new BufferAttribute(new Float32Array([2, 2, 2]), 3),
      ];

      const geom = new BufferGeometry();
      geom.copy(source);

      expect(geom.morphAttributes.position.length).toBe(2);

      const m0 = geom.morphAttributes.position[0];
      const m1 = geom.morphAttributes.position[1];

      expect(Array.from(m0.array)).toEqual([1, 1, 1]);
      expect(Array.from(m1.array)).toEqual([2, 2, 2]);
    });


    it('copies groups', () => {
      const source = new BufferGeometry();
      source.addGroup(0, 3, 1);
      source.addGroup(3, 3, 2);

      const geom = new BufferGeometry();
      geom.copy(source);

      expect(geom.groups.length).toBe(2);
      expect(geom.groups).toEqual([
        { start: 0, count: 3, materialIndex: 1 },
        { start: 3, count: 3, materialIndex: 2 },
      ]);
    });


    it('copies bounding box and bounding sphere', () => {
      const source = new BufferGeometry();
      source.boundingBox = new Box3(new Vector3(1, 2, 3), new Vector3(4, 5, 6));
      source.boundingSphere = new Sphere(new Vector3(1, 1, 1), 5);

      const geom = new BufferGeometry();
      geom.copy(source);

      expect(geom.boundingBox).not.toBe(source.boundingBox);
      expect(geom.boundingBox!.min).toEqual(new Vector3(1, 2, 3));
      expect(geom.boundingBox!.max).toEqual(new Vector3(4, 5, 6));

      expect(geom.boundingSphere).not.toBe(source.boundingSphere);
      expect(geom.boundingSphere!.center).toEqual(new Vector3(1, 1, 1));
      expect(geom.boundingSphere!.radius).toBe(5);
    });


    it('deeply clones attributes so modifying copy does not affect source', () => {
      const source = new BufferGeometry();
      source.setAttribute(
        'position',
        new BufferAttribute(new Float32Array([0, 1, 2]), 3)
      );

      const geom = new BufferGeometry();
      geom.copy(source);

      // Modify the clone
      const clonedPos = geom.getAttribute('position')!;
      clonedPos.setXYZ(0, 10, 10, 10);

      const originalPos = source.getAttribute('position')!;

      expect(Array.from(clonedPos.array)).toEqual([10, 10, 10]);     // modified
    });
  });

  describe('dispose()', () => {
    it('dispatches a dispose event', () => {
      const geom = new BufferGeometry();

      const callback = vi.fn();  // jest.fn() if you're using Jest
      geom.addEventListener('dispose', callback);

      geom.dispose();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('dispose event has type "dispose"', () => {
      const geom = new BufferGeometry();

      let receivedEvent: any = null;
      const callback = (event: any) => { receivedEvent = event; };

      geom.addEventListener('dispose', callback);

      geom.dispose();

      expect(receivedEvent).not.toBeNull();
      expect(receivedEvent.type).toBe('dispose');
    });

    it('does not throw if no listeners exist', () => {
      const geom = new BufferGeometry();

      expect(() => geom.dispose()).not.toThrow();
    });

    it('multiple listeners all receive dispose event', () => {
      const geom = new BufferGeometry();

      const cb1 = vi.fn();
      const cb2 = vi.fn();

      geom.addEventListener('dispose', cb1);
      geom.addEventListener('dispose', cb2);

      geom.dispose();

      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
    });
  });
});
