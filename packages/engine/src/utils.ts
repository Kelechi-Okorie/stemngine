

/**
 *
 */
export function arrayNeedsUint32(array: ArrayLike<number>): boolean {
  	// assumes larger values usually on last

	for ( let i = array.length - 1; i >= 0; -- i ) {

		if ( array[ i ] >= 65535 ) return true; // account for PRIMITIVE_RESTART_FIXED_INDEX, #24565

	}

	return false;
}

/**
 * Creates and returns a new HTMLCanvasElement.
 *
 * @returns A new HTMLCanvasElement
 */
export function createCanvasElement(): HTMLCanvasElement {
  const canvas = document.createElement( 'canvas' );
  canvas.style.display = 'block'; // to avoid scrollbars
  return canvas;
}

const _cache: { [key: string]: any } = {};

export function warnOnce(message: string): void {
	if ( message in _cache ) return;

	_cache[ message ] = true;

	console.warn( message );
}
