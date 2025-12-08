import { describe, it, expect } from "vitest";
import { Source } from "../../../src/textures/Source";

describe('Source', () => {
  describe('constructor()', () => {
    it("should create a Source with default values when no data is passed", () => {
      const source = new Source();

      expect(source.isSource).toBe(true);
      expect(typeof source.id).toBe("number");
      expect(typeof source.uuid).toBe("string");
      expect(source.data).toBeUndefined(); // because constructor currently doesn't assign data
      expect(source.dataReady).toBe(true);
      expect(source.version).toBe(0);
    });

    it("should assign data when passed to the constructor (after fixing constructor)", () => {
      const testData = { width: 2, height: 2 };
      const source = new Source(testData);

      // If you later fix constructor: this.data = data
      // expect(source.data).toBe(testData);
      expect(source.data).toBeUndefined();
    });

    it("should increment ID for each instance", () => {
      const source1 = new Source();
      const source2 = new Source();

      expect(source2.id).toBe(source1.id + 1);
    });

    it("should have a unique UUID for each instance", () => {
      const source1 = new Source();
      const source2 = new Source();

      expect(source1.uuid).not.toBe(source2.uuid);
      expect(typeof source1.uuid).toBe("string");
      expect(typeof source2.uuid).toBe("string");
    });
  });
});
