import { Matrix4 } from "./math/Matrix4";

/**
 * Returns the minimum element of an array
 */
export function arrayMin(array: ArrayLike<number>): number {

  if (array.length === 0) return Infinity;

  let min = array[0];

  for (let i = 1, l = array.length; i < l; ++i) {

    if (array[i] < min) min = array[i];

  }

  return min;

}

/**
 *  Returns the max element of an array
 * @param array
 * @returns
 */
export function arrayMax(array: ArrayLike<number>): number {

  if (array.length === 0) return - Infinity;

  let max = array[0];

  for (let i = 1, l = array.length; i < l; ++i) {

    if (array[i] > max) max = array[i];

  }

  return max;

}

/**
 * Checks whether an array contains any value >= 65,535
 *
 * @remarks
 * It iterates backward from end to start, assuming large values are
 * usually near the end (small optimization)
 * If any element is >= 65535, the function returns true
 * Otherwise, after scanning all elements, it returns false
 *
 * Why 65,535:
 * 65535 is the maximum value representable by a 16-bit unsigned integer (Uint16Array)
 * If any index in the array exceeds the value, you must use a Uint32Array instead
 * of Uint16Array (common in WebGL index buffers)
 * The comment references "PRIMITIVE_RESTART_FIXED_INDEX" in WebGL - meaning index
 * 65535 is used specially and must be treated as 32-bit
 *
 * In short, this function returns true if the array contains any value that
 * cannot fit into a Uint16 index buffer
 */
export function arrayNeedsUint32(array: ArrayLike<number>): boolean {
  // assumes larger values usually on last

  for (let i = array.length - 1; i >= 0; --i) {

    if (array[i] >= 65535) return true; // account for PRIMITIVE_RESTART_FIXED_INDEX, #24565

  }

  return false;
}

export function createElementNS(name: string) {
  // TODO: check if http://www.w3.org/1999/xhtml should be used, and write test
  return document.createElementNS('http://www.w3.org/1999/xhtml', name);
}

/**
 * Creates and returns a new HTMLElement.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  name: K
): HTMLElementTagNameMap[K] {
  return document.createElement(name);
}

export const TYPED_ARRAYS = {
  Int8Array: Int8Array,
  Uint8Array: Uint8Array,
  Uint8ClampedArray: Uint8ClampedArray,
  Int16Array: Int16Array,
  Uint16Array: Uint16Array,
  Int32Array: Int32Array,
  Uint32Array: Uint32Array,
  Float32Array: Float32Array,
  Float64Array: Float64Array
} as const;

export type TypedArrayName = keyof typeof TYPED_ARRAYS;
type TypedArrayConstructor = (typeof TYPED_ARRAYS)[TypedArrayName];

/**
 * @remarks
 * Looks up the typed array class from the TYPED_ARRAYs map
 * Constructs a new typed array using that class, passing the buffer to it
 * Returns the crated typed array view
 *
 * @param type - A string naming a typed array constructor (e.g., Uint16Array, etc)
 * @param buffer - An ArrayBuffer (or SharedArrayBuffer) to create the typed array from
 * @returns
 */
export function getTypedArray<T extends TypedArrayName>(
  type: T,
  buffer: ArrayBuffer | ArrayLike<number>
): InstanceType<(typeof TYPED_ARRAYS)[T]> {

  return new TYPED_ARRAYS[type](buffer) as InstanceType<(typeof TYPED_ARRAYS)[T]>;
}

/**
 * Creates and returns a new HTMLCanvasElement.
 *
 * @returns A new HTMLCanvasElement
 */
export function createCanvasElement(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.style.display = 'block'; // to avoid scrollbars
  return canvas;
}

const _cache: { [key: string]: any } = {};

/**
 * Custom console function handler for intercepting log, warn, and error
 * calls.
 *
 */
let _setConsoleFunction: ((level: string, message: string, ...params: unknown[]) => void) | null = null

// TODO: give * a name (perhaps se)
/**
 * Logs a warning message with the '*.' prefix
 *
 * If a custom console function is set via setConsoleFunction(), it will be used
 * instead of the native console.warn. The first parameter is treated as the
 * method name and is automatically prefixed with '*.'.
 *
 * @param {...any} params - The message components. The first parameter is
 * used as the method name and prefixed with '*.'
 */
export function warn(...params: any[]) {

  const message = `*. ${params.shift()}`;

  if (_setConsoleFunction) {

    _setConsoleFunction('warn', message, ...params);

  } else {

    console.warn(message, ...params);

  }

}

/**
 * Ensures that a warning message is only logged once, no matter how many times
 * you call it
 *
 * @param message
 * @returns
 */
export function warnOnce(message: string): void {
  /**
   * Check if message exists in _cache
   * returns immediately, if it does
   * If not:
   * -  Add message to _cache
   * -  Call console.warn(message) to show the warning to the developer
   *
   * Logs a warning message only the first time it is used; all subsequent calls
   * with same message do nothing
   *
   * Useful for avoiding repeated console spam
   *
   * Note:
   * _cache persists for the entire runtime
   * If you want to reset it during tests, you must clear it manually
   */
  if (message in _cache) return;

  _cache[message] = true;

  console.warn(message);
}

/**
 * A helper to asynchronously wait for a WebGL sync object (WebGLSync) to be signaled
 *
 * @remarks
 * Polls repeatedly until the sync is ready or fails
 * Non-blocking - Iit does not freeze the main thread
 * Useful for waiting for GPU commands to finish in WebGL2
 *
 * Polls a WebGL sync object at intervals and resolves when the GPU has completed work,
 * or rejects if waiting fails
 *
 * @param gl - A WebGL2 rendering context
 * @param sync - A WebGL sync object (gl.fencSync(...))
 * @param interval - Polling interval in milliseconds
 * @returns A Promise that resulves when the sync object is ready
 */
export function probeAsync(
  gl: WebGL2RenderingContext,
  sync: WebGLSync,
  interval: number
): Promise<void> {

	return new Promise( function ( resolve, reject ) {

		function probe() {

			switch ( gl.clientWaitSync( sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0 ) ) {

				case gl.WAIT_FAILED:
					reject();
					break;

				case gl.TIMEOUT_EXPIRED:
					setTimeout( probe, interval );
					break;

				default:
					resolve();

			}

		}

		setTimeout( probe, interval );

	} );

}

/**
 * Modifies the projection matrix
 *
 * @remarks
 * Converts the projection from OPenGL-style NDC coordinates [-1, 1] to
 * DirectX/Unity-style NDC [0, 1] along the z-axis
 *
 * Shifts the depth range from [-1, 1] to [0, 1] by scaling by 0.5 and offsetting by 0.5
 * without affecting the x and y axes
 *
 * @param projectionMatrix
 */
export function toNormalizedProjectionMatrix( projectionMatrix: Matrix4 ): void {

	const m = projectionMatrix.elements;

	// Convert [-1, 1] to [0, 1] projection matrix
	m[ 2 ] = 0.5 * m[ 2 ] + 0.5 * m[ 3 ];
	m[ 6 ] = 0.5 * m[ 6 ] + 0.5 * m[ 7 ];
	m[ 10 ] = 0.5 * m[ 10 ] + 0.5 * m[ 11 ];
	m[ 14 ] = 0.5 * m[ 14 ] + 0.5 * m[ 15 ];

}

/**
 * Takes a projectionMatrix and modifies it to use reversed depth
 *
 * Why it exists:
 * In graphics, reversed-z projection improves depth buffer precision:
 * far plane mapped to 0, near plane to 1 (or vice versa)
 *
 * This is commonly used in modern rendering engines for better depth precision
 * in large scenes
 *
 * @param projectionMatrix
 */
export function toReversedProjectionMatrix( projectionMatrix: Matrix4 ) {

	const m = projectionMatrix.elements;
	const isPerspectiveMatrix = m[ 11 ] === - 1;

	// Reverse [0, 1] projection matrix
	if ( isPerspectiveMatrix ) {

		m[ 10 ] = - m[ 10 ] - 1;
		m[ 14 ] = - m[ 14 ];

	} else {

		m[ 10 ] = - m[ 10 ];
		m[ 14 ] = - m[ 14 ] + 1;

	}

}

