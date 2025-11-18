import { Quaternion } from "../math/Quaternion";
import { AnyTypedArray, TypedArrayConstructor } from "../constants";

/**
 * Converts an array to a specific type of TypedArray.
 *
 * @param array - The array to convert
 * @param type - The type constructor of a TypedArray that defines the new type
 * @returns A new typed array of the given type, or the original array if already
 * the same type
 */
export function convertArray<T extends AnyTypedArray>(
  array: number[] | T,
  type?: TypedArrayConstructor<T>
): T | number[] {
  if (!array) return array;

  if (type) {
    // Always return a typed array if a constructor is provided
    return array.constructor === type ? array as T : new type(array as number[]);
  }
  
  // // If null/undefined or already the target type, return as-is
  // if (!array || array.constructor == type) return array;

  // // If constructor has BYTES_PER_ELEMENT, assume TypedArray
  // if (typeof type.BYTES_PER_ELEMENT === 'number') {
  //   return new type(array as number[]); // create typed array
  // }

  // Fallback: convert to plain Array
  return Array.prototype.slice.call(array); // create Array
}
