import { describe, it, expect } from "vitest";
import { Layers } from "../../../src/core/Layers";

describe("Layers", () => {
  describe("constructor", () => {
    it("should create an instance of Layers", () => {
      const layers = new Layers();
      expect(layers).toBeInstanceOf(Layers);
    });

    it("should initialize mask to layer 0", () => {
      const layers = new Layers();
      expect(layers.mask).toBe(1 << 0);
    });

    it("should initialize mask to exactly 1", () => {
      const layers = new Layers();
      expect(layers.mask).toBe(1);
    });

    it("should not initialize any other bits", () => {
      const layers = new Layers();
      // mask should be binary 000...0001
      expect(layers.mask & ~1).toBe(0);
    });
  });
  describe("set()", () => {
    it("sets membership to only the specified layer", () => {
      const layers = new Layers();

      layers.set(0);
      expect(layers.mask).toBe(1); // 1 << 0 = 1
    });

    it("correctly sets layer 1", () => {
      const layers = new Layers();

      layers.set(1);
      expect(layers.mask).toBe(1 << 1); // 2
    });

    it("correctly sets a higher layer (e.g., layer 5)", () => {
      const layers = new Layers();

      layers.set(5);
      expect(layers.mask).toBe(1 << 5); // 32
    });

    it("clears previously enabled layers", () => {
      const layers = new Layers();

      layers.enable(0);
      layers.enable(3);
      expect(layers.mask).toBe((1 << 0) | (1 << 3)); // 1 | 8 = 9

      layers.set(2);
      expect(layers.mask).toBe(1 << 2); // Only bit 2 remains (4)
    });

    it("always results in an unsigned 32-bit integer", () => {
      const layers = new Layers();

      layers.set(31); // highest valid layer bit
      expect(layers.mask >>> 0).toBe(layers.mask);
      expect(layers.mask).toBe((1 << 31) >>> 0); // 2147483648
    });
  });

  describe('enable()', () => {
    it("enables a single layer", () => {
      const layers = new Layers();

      layers.enable(2);
      // enable layer 2 === 5 because layer 0 is already enabled by default
      expect(layers.mask).toBe(1 | (1 << 2)); // 1 | 4 = 5
    });

    it("enables multiple layers without removing previous ones", () => {
      const layers = new Layers();

      layers.enable(0);
      layers.enable(3);

      expect(layers.mask).toBe((1 << 0) | (1 << 3)); // 1 | 8 = 9
    });

    it("does not disable previously enabled layers", () => {
      const layers = new Layers();

      layers.enable(1); // 2
      layers.enable(1); // enabling same bit twice should have no effect

      expect(layers.mask).toBe(3); // 3
    });

    it("correctly enables a high layer (e.g., 31)", () => {
      const layers = new Layers();

      layers.enable(31);
      expect(layers.mask).toBe(1 | (1 << 31)); // 2147483648
    });

    it("allows enabling several layers including layer 31", () => {
      const layers = new Layers();

      layers.enable(0);
      layers.enable(31);

      expect(layers.mask).toBe((1 << 0) | (1 << 31));
    });

    it("results in a valid unsigned 32-bit int", () => {
      const layers = new Layers();

      layers.enable(31);
      expect(layers.mask).toBe(1 | (1 << 31) >>> 0); // ensure unsigned
    });
  });

  describe('enableAll()', () => {
    it("should set all 32 bits to 1", () => {
      const layers = new Layers();
      layers.enableAll();

      // 0xffffffff should become -1 in JS (signed 32-bit)
      expect(layers.mask).toBe(-1);
    });

    it("should overwrite any previous mask", () => {
      const layers = new Layers();
      layers.mask = 0b00000000000000000000000000001010; // arbitrary bits

      layers.enableAll();

      expect(layers.mask).toBe(-1);
    });

    it("should be equivalent to setting mask to 0xffffffff", () => {
      const layers = new Layers();
      layers.enableAll();

      expect(layers.mask).toBe(0xffffffff | 0); // |0 ensures 32-bit result
    });

    it("should result in all bits set when interpreted as unsigned", () => {
      const layers = new Layers();
      layers.enableAll();

      // Interpret as unsigned to confirm it's all ones: 0xFFFFFFFF → 4294967295
      expect(layers.mask >>> 0).toBe(0xffffffff);
    });
  });

  describe('toggle()', () => {
    it("should toggle a layer that is initially off", () => {
      const layers = new Layers(); // mask = 1 (layer 0)
      layers.toggle(2);            // toggle layer 2

      // mask should now have layer 0 and layer 2 enabled
      expect(layers.mask).toBe(1 | (1 << 2)); // 1 | 4 = 5
    });

    it("should toggle a layer that is initially on", () => {
      const layers = new Layers();
      layers.toggle(0); // toggle layer 0, which is initially on

      expect(layers.mask).toBe(0); // all layers off
    });

    it("should toggle multiple times", () => {
      const layers = new Layers(); // mask = 1
      layers.toggle(1);            // enable layer 1 → 1 | 2 = 3
      layers.toggle(1);            // disable layer 1 → back to 1

      expect(layers.mask).toBe(1);
    });

    it("should not affect other layers when toggling", () => {
      const layers = new Layers(); // mask = 1
      layers.toggle(1);            // mask = 1 | 2 = 3
      layers.toggle(2);            // mask = 3 | 4 = 7

      expect(layers.mask).toBe(7); // binary: 111, only layers 0,1,2 affected
    });

    it("should correctly toggle the highest layer (31)", () => {
      const layers = new Layers(); // mask = 1
      layers.toggle(31);

      // 1 | (1 << 31) = 1 | -2147483648 = -2147483647 (signed)
      expect(layers.mask).toBe(-2147483647);

      // unsigned check
      expect(layers.mask >>> 0).toBe(2147483649);
    });
  });

  describe('disable()', () => {
    it("should disable a layer that is initially on", () => {
      const layers = new Layers(); // mask = 1 (layer 0)
      layers.disable(0);

      expect(layers.mask).toBe(0); // all layers off
    });

    it("should not change the mask if the layer is already off", () => {
      const layers = new Layers(); // mask = 1
      layers.disable(2);            // layer 2 was off

      expect(layers.mask).toBe(1); // unchanged
    });

    it("should disable one layer without affecting others", () => {
      const layers = new Layers(); // mask = 1
      layers.mask |= (1 << 2);     // enable layer 2 → mask = 1 | 4 = 5

      layers.disable(0);            // disable layer 0
      expect(layers.mask).toBe(4);  // only layer 2 remains

      layers.disable(2);            // disable layer 2
      expect(layers.mask).toBe(0);  // all layers off
    });

    it("should disable the highest layer (31)", () => {
      const layers = new Layers();
      layers.mask |= (1 << 31) >>> 0; // enable layer 31
      layers.disable(31);

      expect(layers.mask).toBe(1);          // only layer 0 remains
      expect((layers.mask >>> 0) & (1 << 31)).toBe(0); // layer 31 bit cleared
    });
  });

  describe('disableAll()', () => {
    it("should set mask to 0 when called on default mask", () => {
      const layers = new Layers(); // mask = 1
      layers.disableAll();
      expect(layers.mask).toBe(0);
    });

    it("should clear all previously enabled layers", () => {
      const layers = new Layers();
      layers.mask = 0b10101010; // arbitrary mask
      layers.disableAll();

      expect(layers.mask).toBe(0);
    });

    it("should leave mask as 0 if already disabled", () => {
      const layers = new Layers();
      layers.mask = 0; // already all off
      layers.disableAll();

      expect(layers.mask).toBe(0);
    });

    it("should result in a valid unsigned 32-bit integer (0)", () => {
      const layers = new Layers();
      layers.disableAll();

      expect(layers.mask >>> 0).toBe(0);
    });
  });

  describe('test()', () => {
    it("should return true if both layers share layer 0 (default)", () => {
      const layersA = new Layers();
      const layersB = new Layers();

      expect(layersA.test(layersB)).toBe(true);
    });

    it("should return false if no layers overlap", () => {
      const layersA = new Layers();
      const layersB = new Layers();

      layersA.mask = 1 << 1; // layer 1
      layersB.mask = 1 << 2; // layer 2

      expect(layersA.test(layersB)).toBe(false);
    });

    it("should return true if at least one layer overlaps", () => {
      const layersA = new Layers();
      const layersB = new Layers();

      layersA.mask = (1 << 1) | (1 << 3); // layers 1 and 3
      layersB.mask = (1 << 3) | (1 << 4); // layers 3 and 4

      expect(layersA.test(layersB)).toBe(true);
    });

    it("should work with high layers (e.g., 31)", () => {
      const layersA = new Layers();
      const layersB = new Layers();

      layersA.mask = 1 << 31;
      layersB.mask = 1 << 31;

      expect(layersA.test(layersB)).toBe(true);
    });

    it("should return false if one layer is low and the other high", () => {
      const layersA = new Layers();
      const layersB = new Layers();

      layersA.mask = 1 << 0;
      layersB.mask = 1 << 31;

      expect(layersA.test(layersB)).toBe(false);
    });
  });

  describe('isEnabled()', () => {
    it("should return true for the default layer 0", () => {
      const layers = new Layers();
      expect(layers.isEnabled(0)).toBe(true);
    });

    it("should return false for layers that are not enabled", () => {
      const layers = new Layers();
      expect(layers.isEnabled(1)).toBe(false);
      expect(layers.isEnabled(2)).toBe(false);
    });

    it("should return true for a layer that was enabled manually", () => {
      const layers = new Layers();
      layers.mask |= 1 << 2; // enable layer 2
      expect(layers.isEnabled(2)).toBe(true);
    });

    it("should return false for a layer that was disabled manually", () => {
      const layers = new Layers();
      layers.disable(0); // disable default layer 0
      expect(layers.isEnabled(0)).toBe(false);
    });

    it("should correctly handle high layers (31)", () => {
      const layers = new Layers();
      layers.mask |= (1 << 31) >>> 0; // enable layer 31

      expect(layers.isEnabled(31)).toBe(true);
      expect(layers.isEnabled(0)).toBe(true); // default layer still enabled
    });

    it("should return false for high layers that are not enabled", () => {
      const layers = new Layers();
      expect(layers.isEnabled(31)).toBe(false);
    });
  });
});
