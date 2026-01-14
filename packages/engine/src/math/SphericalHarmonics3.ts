import { Vector3 } from './Vector3.js';

/**
 * Represents a third-order spherical harmonics (SH). Light probes use this class
 * to encode lighting information.
 *
 * - Primary reference: {@link https://graphics.stanford.edu/papers/envmap/envmap.pdf}
 * - Secondary reference: {@link https://www.ppsloan.org/publications/StupidSH36.pdf}
 */
export class SphericalHarmonics3 {
  /**
   * This flag can be used for type testing.
   *
   * @readonly
   * @default true
   */
  public isSphericalHarmonics3 = true;

  /**
   * An array holding the (9) SH coefficients.
   *
   * @type {Array<Vector3>}
   */
  public coefficients: Vector3[] = [];


  /**
   * Constructs a new spherical harmonics.
   */
  constructor() {

    for (let i = 0; i < 9; i++) {

      this.coefficients.push(new Vector3());

    }

  }

  /**
   * Sets the given SH coefficients to this instance by copying
   * the values.
   *
   * @param {Array<Vector3>} coefficients - The SH coefficients.
   * @return {SphericalHarmonics3} A reference to this spherical harmonics.
   */
  public set(coefficients: Vector3[]): this {

    for (let i = 0; i < 9; i++) {

      this.coefficients[i].copy(coefficients[i]);

    }

    return this;

  }

  /**
   * Sets all SH coefficients to `0`.
   *
   * @return {SphericalHarmonics3} A reference to this spherical harmonics.
   */
  public zero(): this {

    for (let i = 0; i < 9; i++) {

      this.coefficients[i].set(0, 0, 0);

    }

    return this;

  }

  /**
   * Returns the radiance in the direction of the given normal.
   *
   * @param {Vector3} normal - The normal vector (assumed to be unit length)
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The radiance.
   */
  public getAt(normal: Vector3, target: Vector3): Vector3 {

    // normal is assumed to be unit length

    const x = normal.x, y = normal.y, z = normal.z;

    const coeff = this.coefficients;

    // band 0
    target.copy(coeff[0]).multiplyScalar(0.282095);

    // band 1
    target.addScaledVector(coeff[1], 0.488603 * y);
    target.addScaledVector(coeff[2], 0.488603 * z);
    target.addScaledVector(coeff[3], 0.488603 * x);

    // band 2
    target.addScaledVector(coeff[4], 1.092548 * (x * y));
    target.addScaledVector(coeff[5], 1.092548 * (y * z));
    target.addScaledVector(coeff[6], 0.315392 * (3.0 * z * z - 1.0));
    target.addScaledVector(coeff[7], 1.092548 * (x * z));
    target.addScaledVector(coeff[8], 0.546274 * (x * x - y * y));

    return target;

  }

  /**
   * Returns the irradiance (radiance convolved with cosine lobe) in the
   * direction of the given normal.
   *
   * @param {Vector3} normal - The normal vector (assumed to be unit length)
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The irradiance.
   */
  public getIrradianceAt(normal: Vector3, target: Vector3): Vector3 {

    // normal is assumed to be unit length

    const x = normal.x, y = normal.y, z = normal.z;

    const coeff = this.coefficients;

    // band 0
    target.copy(coeff[0]).multiplyScalar(0.886227); // π * 0.282095

    // band 1
    target.addScaledVector(coeff[1], 2.0 * 0.511664 * y); // ( 2 * π / 3 ) * 0.488603
    target.addScaledVector(coeff[2], 2.0 * 0.511664 * z);
    target.addScaledVector(coeff[3], 2.0 * 0.511664 * x);

    // band 2
    target.addScaledVector(coeff[4], 2.0 * 0.429043 * x * y); // ( π / 4 ) * 1.092548
    target.addScaledVector(coeff[5], 2.0 * 0.429043 * y * z);
    target.addScaledVector(coeff[6], 0.743125 * z * z - 0.247708); // ( π / 4 ) * 0.315392 * 3
    target.addScaledVector(coeff[7], 2.0 * 0.429043 * x * z);
    target.addScaledVector(coeff[8], 0.429043 * (x * x - y * y)); // ( π / 4 ) * 0.546274

    return target;

  }

  /**
   * Adds the given SH to this instance.
   *
   * @param {SphericalHarmonics3} sh - The SH to add.
   * @return {SphericalHarmonics3} A reference to this spherical harmonics.
   */
  public add(sh: SphericalHarmonics3): SphericalHarmonics3 {

    for (let i = 0; i < 9; i++) {

      this.coefficients[i].add(sh.coefficients[i]);

    }

    return this;

  }

  /**
   * A convenience method for performing {@link SphericalHarmonics3#add} and
   * {@link SphericalHarmonics3#scale} at once.
   *
   * @param {SphericalHarmonics3} sh - The SH to add.
   * @param {number} s - The scale factor.
   * @return {SphericalHarmonics3} A reference to this spherical harmonics.
   */
  public addScaledSH(sh: SphericalHarmonics3, s: number): SphericalHarmonics3 {

    for (let i = 0; i < 9; i++) {

      this.coefficients[i].addScaledVector(sh.coefficients[i], s);

    }

    return this;

  }

  /**
   * Scales this SH by the given scale factor.
   *
   * @param {number} s - The scale factor.
   * @return {SphericalHarmonics3} A reference to this spherical harmonics.
   */
  public scale(s: number): this {

    for (let i = 0; i < 9; i++) {

      this.coefficients[i].multiplyScalar(s);

    }

    return this;

  }

  /**
   * Linear interpolates between the given SH and this instance by the given
   * alpha factor.
   *
   * @param {SphericalHarmonics3} sh - The SH to interpolate with.
   * @param {number} alpha - The alpha factor.
   * @return {SphericalHarmonics3} A reference to this spherical harmonics.
   */
  public lerp(sh: SphericalHarmonics3, alpha: number): SphericalHarmonics3 {

    for (let i = 0; i < 9; i++) {

      this.coefficients[i].lerp(sh.coefficients[i], alpha);

    }

    return this;

  }

  /**
   * Returns `true` if this spherical harmonics is equal with the given one.
   *
   * @param {SphericalHarmonics3} sh - The spherical harmonics to test for equality.
   * @return {boolean} Whether this spherical harmonics is equal with the given one.
   */
  public equals(sh: SphericalHarmonics3): boolean {

    for (let i = 0; i < 9; i++) {

      if (!this.coefficients[i].equals(sh.coefficients[i])) {

        return false;

      }

    }

    return true;

  }

  /**
   * Copies the values of the given spherical harmonics to this instance.
   *
   * @param {SphericalHarmonics3} sh - The spherical harmonics to copy.
   * @return {SphericalHarmonics3} A reference to this spherical harmonics.
   */
  public copy(sh: SphericalHarmonics3): this {

    return this.set(sh.coefficients);

  }

  /**
   * Returns a new spherical harmonics with copied values from this instance.
   *
   * @return {SphericalHarmonics3} A clone of this instance.
   */
  public clone(): SphericalHarmonics3 {

    return new SphericalHarmonics3().copy(this);

  }

  /**
   * Sets the SH coefficients of this instance from the given array.
   *
   * @param {Array<number>} array - An array holding the SH coefficients.
   * @param {number} [offset=0] - The array offset where to start copying.
   * @return {SphericalHarmonics3} A clone of this instance.
   */
  public fromArray(array: number[], offset: number = 0): this {

    const coefficients = this.coefficients;

    for (let i = 0; i < 9; i++) {

      coefficients[i].fromArray(array, offset + (i * 3));

    }

    return this;

  }

  /**
   * Returns an array with the SH coefficients, or copies them into the provided
   * array. The coefficients are represented as numbers.
   *
   * @param {Array<number>} [array=[]] - The target array.
   * @param {number} [offset=0] - The array offset where to start copying.
   * @return {Array<number>} An array with flat SH coefficients.
   */
  public toArray(array: number[] = [], offset: number = 0): number[] {

    const coefficients = this.coefficients;

    for (let i = 0; i < 9; i++) {

      coefficients[i].toArray(array, offset + (i * 3));

    }

    return array;

  }

  /**
   * Computes the SH basis for the given normal vector.
   *
   * @param {Vector3} normal - The normal.
   * @param {Array<number>} shBasis - The target array holding the SH basis.
   */
  public static getBasisAt(normal: Vector3, shBasis: number[]): void {

    // normal is assumed to be unit length

    const x = normal.x, y = normal.y, z = normal.z;

    // band 0
    shBasis[0] = 0.282095;

    // band 1
    shBasis[1] = 0.488603 * y;
    shBasis[2] = 0.488603 * z;
    shBasis[3] = 0.488603 * x;

    // band 2
    shBasis[4] = 1.092548 * x * y;
    shBasis[5] = 1.092548 * y * z;
    shBasis[6] = 0.315392 * (3 * z * z - 1);
    shBasis[7] = 1.092548 * x * z;
    shBasis[8] = 0.546274 * (x * x - y * y);

  }

}
