import { describe, it, expect } from 'vitest';
import { Euler } from '../../../src/math/Euler.js';

describe('Euler', () => {
  describe('constructor()', () => {
    it('should have DEFAULT_ORDER as "XYZ"', () => {
      const e = new Euler();
      expect(e.DEFAULT_ORDER).toBe('XYZ');
    });

    it('should have isEuler as true', () => {
      const e = new Euler();
      expect(e.isEuler).toBe(true);
    });

    it('should initialize _x, _y, _z with default values 0', () => {
      const e = new Euler();
      // access private fields via getters if you have them, otherwise TypeScript won't allow
      expect((e as any)._x).toBe(0);
      expect((e as any)._y).toBe(0);
      expect((e as any)._z).toBe(0);
    });

    it('should initialize _order with DEFAULT_ORDER', () => {
      const e = new Euler();
      expect(e.order).toBe(e.DEFAULT_ORDER);
    });

    it('should allow custom values for constructor', () => {
      const e = new Euler(Math.PI, Math.PI / 2, 1.23, 'ZYX');
      expect((e as any)._x).toBeCloseTo(Math.PI);
      expect((e as any)._y).toBeCloseTo(Math.PI / 2);
      expect((e as any)._z).toBeCloseTo(1.23);
      expect((e as any)._order).toBe('ZYX');
    });
  });
});
