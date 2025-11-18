/**
 * A layers object assigns a Node to one or more of 32 available layers, numbered 0 to 31.
 *
 * @remarks
 * Internally, the layers are stored as a bit mask, and by default all Nodes are members
 * of layer `0`.
 *
 * This can be used to control visibility - A Node must share a layer with a camera to be
 * visible when the camera's view is rendered.
 *
 * All classes that inherit from {@link Node3D} have a {@link Node3D#layers} property
 * which is an instance of this class.
 */
export class Layers {
  /** A bit mask storing which of the 32 layers this Layers instance is a member of. */
  public mask: number;

  /**
   * Constructs a new Layers instance, with membership initially set to layer 0.
   */
  constructor() {
    /**
     * A bit mask storing which of the 32 layers this Layers instance is a member of.
     */
    this.mask = 1 << 0;
  }

  /**
   * Sets membership to the given layer, and remove membership from all other layers.
   *
   * @param layer - The layer to set (0-31)
   */
  public set(layer: number): void {
    /**
     * 1 << layer - Shifts the number 1 left by `layer` positions, effectively setting the bit.
     * This produces a bitmask where only the bit corresponding to the layer is set,
     * and all other bits are set to 0.
     *
     * | 0 - In javaScript forces the value to a 32-bit integer.
     * often used to ensure numbers are treated as integers rather than floating-point values.
     *
     * >>> 0 - This is the unsigned right shift
     * It converts the signed 32-bit integer into an unsigned 32-bit integer.
     * Thereby ensuring that the mask is always a non-negative value.
     *
     * this.mask = ... replaces the current mask with the new bitmask,
     * All previous layers are cleared, and only the specified layer remains active
     *
     * In plain English, clear all previous layer memberships, and enable only the layer
     * specified by layer parameter.
     */
    this.mask = (1 << layer | 0) >>> 0;
  }

  /**
   * Adds membership to the given layer.
   *
   * @param layer - The layer to enable (0-31)
   */
  public enable(layer: number): void {
    this.mask |= (1 << layer | 0) >>> 0;
    // this.mask |= (1 << layer | 0) >>> 0;
  }

  /**
   * Adds membership to all layers
   */
  public enableAll(): void {
    this.mask = 0xffffffff | 0;
  }

  /**
   * Toggles the membership of the given layer.
   *
   * @param layer - The layer to toggle (0-31)
   */
  public toggle(layer: number): void {
    this.mask ^= 1 << layer | 0;
  }

  /**
   * Remvoes membership of the given layer.
   *
   * @param layer - The layer to disable (0-31)
   */
  public disable(layer: number): void {
    this.mask &= ~(1 << layer | 0);
  }

  /**
   * Removes the membership of all layers.
   */
  public disableAll(): void {
    this.mask = 0;
  }

  /**
   * Returns `true` if this and the given Layers instance have at least one
   * layer in common.
   *
   * @param layers - The Layers instance to check against
   * @returns `true` if there is at least one common layer, `false` otherwise
   */
  public test(layers: Layers): boolean {
    return (this.mask & layers.mask) !== 0;
  }

  /**
   * Returns `true` if the given layer is enabled in this Layers instance.
   *
   * @param layer - The layer to check (0-31)
   * @returns `true` if the layer is enabled, `false` otherwise
   */
  public isEnabled(layer: number): boolean {
    return (this.mask & (1 << layer | 0)) !== 0;
  }
}
