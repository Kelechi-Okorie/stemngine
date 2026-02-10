import {
  InterpolateLinear,
  InterpolateSmooth,
  InterpolateDiscrete,
  InterpolateBezier,
  InterpolationMode,
  AnyTypedArray,
  TypedArrayConstructor
} from '../constants.js';
import { CubicInterpolant } from '../math/interpolants/CubicInterpolant';
import { LinearInterpolant } from '../math/interpolants/LinearInterpolant';
import { DiscreteInterpolant } from '../math/interpolants/DiscreteInterpolant';
import { BezierInterpolant } from '../math/interpolants/BezierInterpolant';
import * as AnimationUtils from './AnimationUtils';
import { warn, error } from '../utils';
import { BezierSettings } from '../math/interpolants/BezierInterpolant';

interface KeyframeTrackJSON {
  name: string;
  times: number[],
  values: number[],
  interpolation?: InterpolationMode;
  type: string;
}

export type InterpolantFactory = (result: AnyTypedArray) =>
  | DiscreteInterpolant
  | LinearInterpolant
  | CubicInterpolant
  | BezierInterpolant;

/**
 * Represents a timed sequence of keyframes, which are composed of lists of
 * times and related values, and which are used to animate a specific property
 * of an object.
 */
export class KeyframeTrack {

  /**
   * The track's name can refer to morph targets or bones or
   * possibly other values within an animated object. See {@link PropertyBinding#parseTrackName}
   * for the forms of strings that can be parsed for property binding.
   *
   * @type {string}
   */
  public name: string;

  /**
   * The keyframe times.
   *
   * @type {Float32Array}
   */
  public times: Float32Array;

  /**
   * The keyframe values.
   *
   * @type {Float32Array}
   */
  public values: Float32Array;

  /**
   * The value type name.
   *
   * @type {string}
   * @default ''
   */
  public ValueTypeName: string = '';

  /**
   * The time buffer type of this keyframe track.
   *
   * @type {TypedArray|Array}
   * @default Float32Array.constructor
   */
  public TimeBufferType: TypedArrayConstructor<Float32Array> = Float32Array;

  /**
   * The value buffer type of this keyframe track.
   *
   * @type {TypedArray|Array}
   * @default Float32Array.constructor
   */
  public ValueBufferType: ArrayConstructor | TypedArrayConstructor<Float32Array> = Float32Array;

  /**
   * The default interpolation type of this keyframe track.
   *
   * @type {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth|InterpolateBezier)}
   * @default InterpolateLinear
   */
  public DefaultInterpolation: InterpolationMode = InterpolateLinear;

  // to make TS happy
  public settings?: BezierSettings;

  // to make TS happy
  public createInterpolant!: InterpolantFactory;

  /**
   * Constructs a new keyframe track.
   *
   * @param {string} name - The keyframe track's name.
   * @param {Array<number>} times - A list of keyframe times.
   * @param {Array<number|string|boolean>} values - A list of keyframe values.
   * @param {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth|InterpolateBezier)} [interpolation] - The interpolation type.
   */
  constructor(
    name: string,
    times: number[],
    values: number[] | string[] | boolean[],
    interpolation: InterpolationMode = this.DefaultInterpolation
  ) {

    if (name === undefined) throw new Error('KeyframeTrack: track name is undefined');
    if (times === undefined || times.length === 0) throw new Error('KeyframeTrack: no keyframes in track named ' + name);

    this.name = name;

    this.times = AnimationUtils.convertArray(times, this.TimeBufferType);

    this.values = AnimationUtils.convertArray(values, this.ValueBufferType);

    this.setInterpolation(interpolation || this.DefaultInterpolation);

  }

  /**
   * Converts the keyframe track to JSON.
   *
   * @static
   * @param {KeyframeTrack} track - The keyframe track to serialize.
   * @return {Object} The serialized keyframe track as JSON.
   */
  public static toJSON(track: any): any {  // TODO: check type

    const trackType = track.constructor;

    let json = {} as KeyframeTrackJSON;

    // derived classes can define a static toJSON method
    if (trackType.toJSON !== this.toJSON) {

      json = trackType.toJSON(track);

    } else {

      // by default, we assume the data can be serialized as-is
      // json = {

      //   'name': track.name,
      //   'times': AnimationUtils.convertArray(track.times, Array),
      //   'values': AnimationUtils.convertArray(track.values, Array),

      // };

      json.name = track.name;
      json.times = AnimationUtils.convertArray(track.times, Array);
      json.values = AnimationUtils.convertArray(track.values, Array);

      const interpolation = track.getInterpolation();

      if (interpolation !== track.DefaultInterpolation) {

        json.interpolation = interpolation;

      }

    }

    json.type = track.ValueTypeName; // mandatory

    return json;

  }

  /**
   * Factory method for creating a new discrete interpolant.
   *
   * @static
   * @param {TypedArray} [result] - The result buffer.
   * @return {DiscreteInterpolant} The new interpolant.
   */
  public InterpolantFactoryMethodDiscrete(result: AnyTypedArray): DiscreteInterpolant {

    return new DiscreteInterpolant(this.times, this.values, this.getValueSize(), result);

  }

  /**
   * Factory method for creating a new linear interpolant.
   *
   * @static
   * @param {TypedArray} [result] - The result buffer.
   * @return {LinearInterpolant} The new interpolant.
   */
  public InterpolantFactoryMethodLinear(result: AnyTypedArray): LinearInterpolant {

    return new LinearInterpolant(this.times, this.values, this.getValueSize(), result);

  }

  /**
   * Factory method for creating a new smooth interpolant.
   *
   * @static
   * @param {TypedArray} [result] - The result buffer.
   * @return {CubicInterpolant} The new interpolant.
   */
  public InterpolantFactoryMethodSmooth(result: AnyTypedArray): CubicInterpolant {

    return new CubicInterpolant(this.times, this.values, this.getValueSize(), result);

  }

  /**
   * Factory method for creating a new Bezier interpolant.
   *
   * The Bezier interpolant requires tangent data to be set via the `settings` property
   * on the track before creating the interpolant. The settings should contain:
   * - `inTangents`: Float32Array with [time, value] pairs per keyframe per component
   * - `outTangents`: Float32Array with [time, value] pairs per keyframe per component
   *
   * @static
   * @param {TypedArray} [result] - The result buffer.
   * @return {BezierInterpolant} The new interpolant.
   */
  public InterpolantFactoryMethodBezier(result: AnyTypedArray): BezierInterpolant {

    const interpolant = new BezierInterpolant(this.times, this.values, this.getValueSize(), result);

    // Pass tangent data from track settings to interpolant
    if (this.settings) {

      interpolant.settings = this.settings;

    }

    return interpolant;

  }

  /**
   * Defines the interpolation factor method for this keyframe track.
   *
   * @param {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth|InterpolateBezier)} interpolation - The interpolation type.
   * @return {KeyframeTrack} A reference to this keyframe track.
   */
  public setInterpolation(interpolation: InterpolationMode): this {

    let factoryMethod;

    switch (interpolation) {

      case InterpolateDiscrete:

        factoryMethod = this.InterpolantFactoryMethodDiscrete;

        break;

      case InterpolateLinear:

        factoryMethod = this.InterpolantFactoryMethodLinear;

        break;

      case InterpolateSmooth:

        factoryMethod = this.InterpolantFactoryMethodSmooth;

        break;

      case InterpolateBezier:

        factoryMethod = this.InterpolantFactoryMethodBezier;

        break;

    }

    if (factoryMethod === undefined) {

      const message = 'unsupported interpolation for ' +
        this.ValueTypeName + ' keyframe track named ' + this.name;

      if (this.createInterpolant === undefined) {

        // fall back to default, unless the default itself is messed up
        if (interpolation !== this.DefaultInterpolation) {

          this.setInterpolation(this.DefaultInterpolation);

        } else {

          throw new Error(message); // fatal, in this case

        }

      }

      warn('KeyframeTrack:', message);
      return this;

    }

    this.createInterpolant = factoryMethod;

    return this;

  }

  /**
   * Returns the current interpolation type.
   *
   * @return {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth|InterpolateBezier)} The interpolation type.
   */
  public getInterpolation(): InterpolationMode {

    switch (this.createInterpolant) {

      case this.InterpolantFactoryMethodDiscrete:

        return InterpolateDiscrete;

      case this.InterpolantFactoryMethodLinear:

        return InterpolateLinear;

      case this.InterpolantFactoryMethodSmooth:

        return InterpolateSmooth;

      case this.InterpolantFactoryMethodBezier:

        return InterpolateBezier;

    }

    return this.DefaultInterpolation;

  }

  /**
   * Returns the value size.
   *
   * @return {number} The value size.
   */
  public getValueSize(): number {

    return this.values.length / this.times.length;

  }

  /**
   * Moves all keyframes either forward or backward in time.
   *
   * @param {number} timeOffset - The offset to move the time values.
   * @return {KeyframeTrack} A reference to this keyframe track.
   */
  public shift(timeOffset: number): this {

    if (timeOffset !== 0.0) {

      const times = this.times;

      for (let i = 0, n = times.length; i !== n; ++i) {

        times[i] += timeOffset;

      }

    }

    return this;

  }

  /**
   * Scale all keyframe times by a factor (useful for frame - seconds conversions).
   *
   * @param {number} timeScale - The time scale.
   * @return {KeyframeTrack} A reference to this keyframe track.
   */
  public scale(timeScale: number): this {

    if (timeScale !== 1.0) {

      const times = this.times;

      for (let i = 0, n = times.length; i !== n; ++i) {

        times[i] *= timeScale;

      }

    }

    return this;

  }

  /**
   * Removes keyframes before and after animation without changing any values within the defined time range.
   *
   * Note: The method does not shift around keys to the start of the track time, because for interpolated
   * keys this will change their values
   *
   * @param {number} startTime - The start time.
   * @param {number} endTime - The end time.
   * @return {KeyframeTrack} A reference to this keyframe track.
   */
  public trim(startTime: number, endTime: number): this {

    const times = this.times,
      nKeys = times.length;

    let from = 0,
      to = nKeys - 1;

    while (from !== nKeys && times[from] < startTime) {

      ++from;

    }

    while (to !== - 1 && times[to] > endTime) {

      --to;

    }

    ++to; // inclusive -> exclusive bound

    if (from !== 0 || to !== nKeys) {

      // empty tracks are forbidden, so keep at least one keyframe
      if (from >= to) {

        to = Math.max(to, 1);
        from = to - 1;

      }

      const stride = this.getValueSize();
      this.times = times.slice(from, to);
      this.values = this.values.slice(from * stride, to * stride);

    }

    return this;

  }

  /**
   * Performs minimal validation on the keyframe track. Returns `true` if the values
   * are valid.
   *
   * @return {boolean} Whether the keyframes are valid or not.
   */
  public validate(): boolean {

    let valid = true;

    const valueSize = this.getValueSize();
    if (valueSize - Math.floor(valueSize) !== 0) {

      error('KeyframeTrack: Invalid value size in track.', this);
      valid = false;

    }

    const times = this.times,
      values = this.values,

      nKeys = times.length;

    if (nKeys === 0) {

      error('KeyframeTrack: Track is empty.', this);
      valid = false;

    }

    let prevTime = null;

    for (let i = 0; i !== nKeys; i++) {

      const currTime = times[i];

      if (typeof currTime === 'number' && isNaN(currTime)) {

        error('KeyframeTrack: Time is not a valid number.', this, i, currTime);
        valid = false;
        break;

      }

      if (prevTime !== null && prevTime > currTime) {

        error('KeyframeTrack: Out of order keys.', this, i, currTime, prevTime);
        valid = false;
        break;

      }

      prevTime = currTime;

    }

    if (values !== undefined) {

      if (AnimationUtils.isTypedArray(values)) {

        for (let i = 0, n = values.length; i !== n; ++i) {

          const value = values[i];

          if (isNaN(value)) {

            error('KeyframeTrack: Value is not a valid number.', this, i, value);
            valid = false;
            break;

          }

        }

      }

    }

    return valid;

  }

  /**
   * Optimizes this keyframe track by removing equivalent sequential keys (which are
   * common in morph target sequences).
   *
   * @return {KeyframeTrack} A reference to this keyframe track.
   */
  public optimize(): this {

    // (0,0,0,0,1,1,1,0,0,0,0,0,0,0) --> (0,0,1,1,0,0)

    // times or values may be shared with other tracks, so overwriting is unsafe
    const times = this.times.slice(),
      values = this.values.slice(),
      stride = this.getValueSize(),

      smoothInterpolation = this.getInterpolation() === InterpolateSmooth,

      lastIndex = times.length - 1;

    let writeIndex = 1;

    for (let i = 1; i < lastIndex; ++i) {

      let keep = false;

      const time = times[i];
      const timeNext = times[i + 1];

      // remove adjacent keyframes scheduled at the same time

      if (time !== timeNext && (i !== 1 || time !== times[0])) {

        if (!smoothInterpolation) {

          // remove unnecessary keyframes same as their neighbors

          const offset = i * stride,
            offsetP = offset - stride,
            offsetN = offset + stride;

          for (let j = 0; j !== stride; ++j) {

            const value = values[offset + j];

            if (value !== values[offsetP + j] ||
              value !== values[offsetN + j]) {

              keep = true;
              break;

            }

          }

        } else {

          keep = true;

        }

      }

      // in-place compaction

      if (keep) {

        if (i !== writeIndex) {

          times[writeIndex] = times[i];

          const readOffset = i * stride,
            writeOffset = writeIndex * stride;

          for (let j = 0; j !== stride; ++j) {

            values[writeOffset + j] = values[readOffset + j];

          }

        }

        ++writeIndex;

      }

    }

    // flush last keyframe (compaction looks ahead)

    if (lastIndex > 0) {

      times[writeIndex] = times[lastIndex];

      for (let readOffset = lastIndex * stride, writeOffset = writeIndex * stride, j = 0; j !== stride; ++j) {

        values[writeOffset + j] = values[readOffset + j];

      }

      ++writeIndex;

    }

    if (writeIndex !== times.length) {

      this.times = times.slice(0, writeIndex);
      this.values = values.slice(0, writeIndex * stride);

    } else {

      this.times = times;
      this.values = values;

    }

    return this;

  }

  /**
   * Returns a new keyframe track with copied values from this instance.
   *
   * @return {KeyframeTrack} A clone of this instance.
   */
  public clone(): KeyframeTrack {

    const times = Array.from(this.times.slice());
    const values = Array.from(this.values.slice());

    // const TypedKeyframeTrack = this.constructor;

    const TypedKeyframeTrack = this.constructor as new (
      name: string,
      times: number[],
      values: number[] | string[] | boolean[],
      interpolation?: InterpolationMode
    ) => KeyframeTrack;

    const track = new TypedKeyframeTrack(this.name, times, values);

    // const track2 = new KeyframeTrack(this.name, times, values, this.DefaultInterpolation);

    // Interpolant argument to constructor is not saved, so copy the factory method directly.
    track.createInterpolant = this.createInterpolant;

    return track;

  }

}
