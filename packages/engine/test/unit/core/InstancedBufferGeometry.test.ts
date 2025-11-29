import { describe, it, expect } from 'vitest';
import { InstancedBufferGeometry } from '../../../src/core/InstancedBufferGeometry';

describe('InstancedBufferGeometry', () => {
  describe('constructor()', () => {
    it("should create an instance of InstancedBufferGeometry", () => {
      const geometry = new InstancedBufferGeometry();

      expect(geometry).toBeInstanceOf(InstancedBufferGeometry);
    });

    it("should inherit from BufferGeometry", () => {
      const geometry = new InstancedBufferGeometry();

      // BufferGeometry tests are already covered, just check inheritance
      expect(geometry.isBufferGeometry).toBe(true);
    });

    it("should have isInstancedBufferGeometry flag set to true", () => {
      const geometry = new InstancedBufferGeometry();

      expect(geometry.isInstancedBufferGeometry).toBe(true);
    });

    it("should have type set to 'InstancedBufferGeometry'", () => {
      const geometry = new InstancedBufferGeometry();

      expect(geometry.type).toBe("InstancedBufferGeometry");
    });

    it("should initialize instanceCount to Infinity", () => {
      const geometry = new InstancedBufferGeometry();

      expect(geometry.instanceCount).toBe(Infinity);
    });
  });

  describe('copy()', () => {
    it("should copy instanceCount from the source geometry", () => {
      const source = new InstancedBufferGeometry();
      source.instanceCount = 5;

      const target = new InstancedBufferGeometry();
      target.copy(source);

      expect(target.instanceCount).toBe(5);
    });

    it("should return the target instance itself", () => {
      const source = new InstancedBufferGeometry();
      const target = new InstancedBufferGeometry();

      const result = target.copy(source);

      expect(result).toBe(target);
    });

    it("should copy all BufferGeometry properties via super.copy", () => {
      const source = new InstancedBufferGeometry();
      source.name = "MyGeometry";
      source.instanceCount = 10;

      const target = new InstancedBufferGeometry();
      target.copy(source);

      // Minimal check for inherited BufferGeometry properties
      expect(target.name).toBe("MyGeometry");
    });
  });

  describe('toJSON()', () => {
    it("should include instanceCount in the serialized object", () => {
      const geometry = new InstancedBufferGeometry();
      geometry.instanceCount = 7;

      const json = geometry.toJSON();

      expect(json.instanceCount).toBe(7);
    });

    it("should include the isInstanceBufferGeometry flag", () => {
      const geometry = new InstancedBufferGeometry();

      const json = geometry.toJSON();

      expect(json.isInstanceBufferGeometry).toBe(true);
    });

    it("should include properties from BufferGeometry.toJSON", () => {
      const geometry = new InstancedBufferGeometry();
      geometry.name = "TestGeometry";

      const json = geometry.toJSON();

      // Check that BufferGeometry properties exist in the JSON
      expect(json.type).toBeDefined();
      expect(json.uuid).toBeDefined();
      expect(json.name).toBe("TestGeometry");
    });

    it("should return a new object each time", () => {
      const geometry = new InstancedBufferGeometry();
      const json1 = geometry.toJSON();
      const json2 = geometry.toJSON();

      expect(json1).not.toBe(json2);
    });
  });
});
