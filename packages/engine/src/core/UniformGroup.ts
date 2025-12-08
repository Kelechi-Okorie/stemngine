import { EventDispatcher } from './EventDispatcher.js';
import { BufferUsage, StaticDrawUsage } from '../constants.js';
import { Uniform } from './Uniform.js'

let _id = 0;

/**
 * A class for managing multiple uniforms in a single group. The renderer will process
 * such a definition as a single UBO.
 *
 * Since this class can only be used in context of {@link ShaderMaterial}, it is only supported
 * in {@link WebGLRenderer}.
 *
 * @augments EventDispatcher
 */
export class UniformsGroup extends EventDispatcher {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public isUniformsGroup: boolean = true;

  public id = _id++;

  /**
   * The name of the uniforms group.
   *
   * @type {string}
   */
  public name: string = '';

  /**
   * The buffer usage.
   *
   * @type {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)}
   * @default StaticDrawUsage
   */
  public usage: BufferUsage = StaticDrawUsage;

  /**
   * An array holding the uniforms.
   *
   * @type {Array<Uniform>}
   */
  public uniforms: Uniform[] = [];

  /**
   * Constructs a new uniforms group.
   */
  constructor() {

    super();

  }

  /**
   * Adds the given uniform to this uniforms group.
   *
   * @param {Uniform} uniform - The uniform to add.
   * @return {UniformsGroup} A reference to this uniforms group.
   */
  public add(uniform: Uniform): this {

    this.uniforms.push(uniform);

    return this;

  }

  /**
   * Removes the given uniform from this uniforms group.
   *
   * @param {Uniform} uniform - The uniform to remove.
   * @return {UniformsGroup} A reference to this uniforms group.
   */
  public remove(uniform: Uniform): this {

    const index = this.uniforms.indexOf(uniform);

    if (index !== - 1) this.uniforms.splice(index, 1);

    return this;

  }

  /**
   * Sets the name of this uniforms group.
   *
   * @param {string} name - The name to set.
   * @return {UniformsGroup} A reference to this uniforms group.
   */
  public setName(name: string): UniformsGroup {

    this.name = name;

    return this;

  }

  /**
   * Sets the usage of this uniforms group.
   *
   * @param {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)} value - The usage to set.
   * @return {UniformsGroup} A reference to this uniforms group.
   */
  public setUsage(value: BufferUsage): this {

    this.usage = value;

    return this;

  }

  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever this instance is no longer used in your app.
   *
   * @fires Texture#dispose
   */
  public dispose() {

    this.dispatchEvent({ type: 'dispose' });

  }

  /**
   * Copies the values of the given uniforms group to this instance.
   *
   * @param {UniformsGroup} source - The uniforms group to copy.
   * @return {UniformsGroup} A reference to this uniforms group.
   */
  public copy(source: UniformsGroup): this {

    this.name = source.name;
    this.usage = source.usage;

    const uniformsSource = source.uniforms;

    this.uniforms.length = 0;

    for (let i = 0, l = uniformsSource.length; i < l; i++) {

      // const uniforms: Uniform[] = Array.isArray(uniformsSource[i])
      //   ? (uniformsSource[i] as Uniform[])
      //   : [uniformsSource[i]];

      const src = uniformsSource[i];
      let uniforms: Uniform[];

      if (Array.isArray(src)) {
        uniforms = src;
      } else {
        uniforms = [src]
      }

      for (let j = 0; j < uniforms.length; j++) {

        this.uniforms.push(uniforms[j].clone());

      }

    }

    return this;

  }

  /**
   * Returns a new uniforms group with copied values from this instance.
   *
   * @return {UniformsGroup} A clone of this instance.
   */
  public clone(): UniformsGroup {

    return new UniformsGroup().copy(this);

  }

}
