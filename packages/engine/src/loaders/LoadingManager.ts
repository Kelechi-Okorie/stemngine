import { Loader } from "./Loader";

type StartCallback = (url: string, itemsLoaded: number, itemsTotal: number) => void;

type ProgressCallback = (url: string, loaded: number, total: number) => void;

type LoadCallback<T = any> = (data: T) => void;

type ErrorCallback = (url: string | Event) => void;

/**
 * Handles and keeps track of loaded and pending data. A default global
 * instance of this class is created and used by loaders if not supplied
 * manually.
 *
 * In general that should be sufficient, however there are times when it can
 * be useful to have separate loaders - for example if you want to show
 * separate loading bars for objects and textures.
 *
 * ```js
 * const manager = new LoadingManager();
 * manager.onLoad = () => console.log( 'Loading complete!' );
 *
 * const loader1 = new OBJLoader( manager );
 * const loader2 = new ColladaLoader( manager );
 * ```
 */
class LoadingManager {

    /**
     * Executes when an item starts loading.
     *
     * @type {Function|undefined}
     * @default undefined
     */
    public onStart?: StartCallback;

    public onLoad?: LoadCallback;
    public onProgress?: ProgressCallback;
    public onError?: ErrorCallback;

    /**
     * Used for aborting ongoing requests in loaders using this manager.
     *
     * @private
     * @type {AbortController | null}
     */
    private _abortController: AbortController | null = null;

    private isLoading = false;
    private itemsLoaded = 0;
    private itemsTotal = 0;
    private urlModifier?: (url: string) => string;
    private handlers: [RegExp, Loader][] = [];
    // private handlers = new Map<RegExp, Loader>();


    /**
     * Constructs a new loading manager.
     *
     * @param {Function} [onLoad] - Executes when all items have been loaded.
     * @param {Function} [onProgress] - Executes when single items have been loaded.
     * @param {Function} [onError] - Executes when an error occurs.
     */
    constructor(
        onLoad?: LoadCallback,
        onProgress?: ProgressCallback,
        onError?: ErrorCallback
    ) {

        const scope = this;

        // Refer to #5689 for the reason why we don't set .onStart
        // in the constructor

        /**
         * Executes when all items have been loaded.
         *
         * @type {Function|undefined}
         * @default undefined
         */
        this.onLoad = onLoad;

        /**
         * Executes when single items have been loaded.
         *
         * @type {Function|undefined}
         * @default undefined
         */
        this.onProgress = onProgress;

        /**
         * Executes when an error occurs.
         *
         * @type {Function|undefined}
         * @default undefined
         */
        this.onError = onError;

    }

    /**
     * This should be called by any loader using the manager when the loader
     * starts loading an item.
     *
     * @param {string} url - The URL to load.
     */
    public itemStart(url: string) {

        this.itemsTotal++;

        if (this.isLoading === false) {

            if (this.onStart !== undefined) {

                this.onStart(url, this.itemsLoaded, this.itemsTotal);

            }

        }

        this.isLoading = true;

    }

    /**
    * This should be called by any loader using the manager when the loader
    * ended loading an item.
    *
    * @param {string} url - The URL of the loaded item.
    */
    public itemEnd(url: string) {

        this.itemsLoaded++;

        if (this.onProgress !== undefined) {

            this.onProgress(url, this.itemsLoaded, this.itemsTotal);

        }

        if (this.itemsLoaded === this.itemsTotal) {

            this.isLoading = false;

            if (this.onLoad !== undefined) {

                this.onLoad('constant string - should check very well');

            }

        }

    };

    /**
     * This should be called by any loader using the manager when the loader
     * encounters an error when loading an item.
     *
     * @param {string} url - The URL of the item that produces an error.
     */
    public itemError(url: string) {

        if (this.onError !== undefined) {

            this.onError(url);

        }

    };

    /**
     * Given a URL, uses the URL modifier callback (if any) and returns a
     * resolved URL. If no URL modifier is set, returns the original URL.
     *
     * @param {string} url - The URL to load.
     * @return {string} The resolved URL.
     */
    public resolveURL(url: string): string {

        if (this.urlModifier) {

            return this.urlModifier(url);

        }

        return url;

    };

    /**
     * If provided, the callback will be passed each resource URL before a
     * request is sent. The callback may return the original URL, or a new URL to
     * override loading behavior. This behavior can be used to load assets from
     * .ZIP files, drag-and-drop APIs, and Data URIs.
     *
     * ```js
     * const blobs = {'fish.gltf': blob1, 'diffuse.png': blob2, 'normal.png': blob3};
     *
     * const manager = new THREE.LoadingManager();
     *
     * // Initialize loading manager with URL callback.
     * const objectURLs = [];
     * manager.setURLModifier( ( url ) => {
     *
     * 	url = URL.createObjectURL( blobs[ url ] );
     * 	objectURLs.push( url );
     * 	return url;
     *
     * } );
     *
     * // Load as usual, then revoke the blob URLs.
     * const loader = new GLTFLoader( manager );
     * loader.load( 'fish.gltf', (gltf) => {
     *
     * 	scene.add( gltf.scene );
     * 	objectURLs.forEach( ( url ) => URL.revokeObjectURL( url ) );
     *
     * } );
     * ```
     *
     * @param {function(string):string} transform - URL modifier callback. Called with an URL and must return a resolved URL.
     * @return {LoadingManager} A reference to this loading manager.
     */
    public setURLModifier(transform: (url: string) => string) {

        this.urlModifier = transform;

        return this;

    };

    /**
     * Registers a loader with the given regular expression. Can be used to
     * define what loader should be used in order to load specific files. A
     * typical use case is to overwrite the default loader for textures.
     *
     * ```js
     * // add handler for TGA textures
     * manager.addHandler( /\.tga$/i, new TGALoader() );
     * ```
     *
     * @param {string} regex - A regular expression.
     * @param {Loader} loader - A loader that should handle matched cases.
     * @return {LoadingManager} A reference to this loading manager.
     */
    public addHandler(regex: RegExp, loader: Loader): this {

        // this.handlers.push(regex, loader);

        this.handlers.push([regex, loader]);

        return this;

    };

    /**
     * Removes the loader for the given regular expression.
     *
     * @param {string} regex - A regular expression.
     * @return {LoadingManager} A reference to this loading manager.
     */
    public removeHandler(regex: RegExp): this {

        // const index = this.handlers.indexOf(regex);

        // if (index !== - 1) {

        //     this.handlers.splice(index, 2);

        // }

        for (let i = 0; i < this.handlers.length; i++) {
            if (this.handlers[i][0] === regex) {
                this.handlers.splice(i, 1);
                break;
            }
        }

        return this;

    };

    /**
     * Can be used to retrieve the registered loader for the given file path.
     *
     * @param {string} file - The file path.
     * @return {?Loader} The registered loader. Returns `null` if no loader was found.
     */
    public getHandler(file: string): Loader | null {

        // for (let i = 0, l = this.handlers.length; i < l; i += 2) {

        //     const regex = this.handlers[i];
        //     const loader = this.handlers[i + 1];

        //     if (regex.global) regex.lastIndex = 0; // see #17920

        //     if (regex.test(file)) {

        //         return loader;

        //     }

        // }

        for (let i = 0; i < this.handlers.length; i++) {

            const [regex, loader] = this.handlers[i];

            if (regex.global) regex.lastIndex = 0;  // see #17920

            if (regex.test(file)) {
                return loader;
            }
        }

        return null;

    };

    /**
     * Can be used to abort ongoing loading requests in loaders using this manager.
     * The abort only works if the loaders implement {@link Loader#abort} and `AbortSignal.any()`
     * is supported in the browser.
     *
     * @return {LoadingManager} A reference to this loading manager.
     */
    public abort(): this {


        this.abortController.abort();
        this._abortController = null;

        return this;

    };



    // TODO: Revert this back to a single member variable once this issue has been fixed
    // https://github.com/cloudflare/workerd/issues/3657

    /**
     * Used for aborting ongoing requests in loaders using this manager.
     *
     * @type {AbortController}
     */
    get abortController() {

        if (!this._abortController) {

            this._abortController = new AbortController();

        }

        return this._abortController;

    }

}

/**
 * The global default loading manager.
 *
 * @constant
 * @type {LoadingManager}
 */
const DefaultLoadingManager = /*@__PURE__*/ new LoadingManager();

export { DefaultLoadingManager, LoadingManager, StartCallback, ProgressCallback, LoadCallback, ErrorCallback };
