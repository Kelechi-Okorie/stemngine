

type CacheType = {
    enabled: boolean;
    files: Record<string, any>;

    add(key: string, file: any): void;
    get(key: string): any | undefined;
    remove(key: string): void;
    clear(): void;
};

type FileType = Record<string, any>

/**
 * @class
 * @classdesc A simple caching system, used internally by {@link FileLoader}.
 * To enable caching across all loaders that use {@link FileLoader}, add `THREE.Cache.enabled = true.` once in your app.
 * @hideconstructor
 */
const Cache: CacheType = {

	/**
	 * Whether caching is enabled or not.
	 *
	 * @static
	 * @type {boolean}
	 * @default false
	 */
	enabled: false,

	/**
	 * A dictionary that holds cached files.
	 *
	 * @static
	 * @type {Object<string,Object>}
	 */
	files: {},

	/**
	 * Adds a cache entry with a key to reference the file. If this key already
	 * holds a file, it is overwritten.
	 *
	 * @static
	 * @param {string} key - The key to reference the cached file.
	 * @param {Object} file -  The file to be cached.
	 */
	add ( key: string, file: FileType ): void {

		if ( this.enabled === false ) return;

		// log( 'Cache', 'Adding key:', key );

		this.files[ key ] = file;

	},

	/**
	 * Gets the cached value for the given key.
	 *
	 * @static
	 * @param {string} key - The key to reference the cached file.
	 * @return {Object|undefined} The cached file. If the key does not exist `undefined` is returned.
	 */
	get ( key: string ): FileType | undefined {

		if ( this.enabled === false ) return;

		// log( 'Cache', 'Checking key:', key );

		return this.files[ key ];

	},

	/**
	 * Removes the cached file associated with the given key.
	 *
	 * @static
	 * @param {string} key - The key to reference the cached file.
	 */
	remove ( key: string ): void {

		delete this.files[ key ];

	},

	/**
	 * Remove all values from the cache.
	 *
	 * @static
	 */
	clear (): void {

		this.files = {};

	}

};

export { Cache };
