import { DefaultLoadingManager, LoadingManager, ProgressCallback, LoadCallback, ErrorCallback } from './LoadingManager';

/**
 * Abstract base class for loaders.
 *
 * @abstract
 */
class Loader {

    /**
     * The loading manager.
     *
     * @type {LoadingManager}
     * @default DefaultLoadingManager
     */
    public manager: LoadingManager;

    /**
     * The crossOrigin string to implement CORS for loading the url from a
     * different domain that allows CORS.
     *
     */
    public crossOrigin = 'anonymous';

    /**
     * Whether the XMLHttpRequest uses credentials.
     *
     */
    public withCredentials = false;

    /**
     * The base path from which the asset will be loaded.
     *
     */
    public path = '';

    /**
     * The base path from which additional resources like textures will be loaded.
     *
     */
    public resourcePath = '';

    /**
     * The [request header](https://developer.mozilla.org/en-US/docs/Glossary/Request_header)
     * used in HTTP request.
     *
     * @type {Object<string, any>}
     */
    public requestHeader: Record<string, string> = {};

    /**
     * The default material name that is used by loaders
     * when creating materials for loaded 3D objects.
     *
     * Note: Not all loaders might honor this setting.
     *
     */
    public static readonly DEFAULT_MATERIAL_NAME = '__DEFAULT';


    /**
     * Constructs a new loader.
     *
     * @param {LoadingManager} [manager] - The loading manager.
     */
    constructor(manager?: LoadingManager) {

        this.manager = manager ?? DefaultLoadingManager;


        // if (typeof __THREE_DEVTOOLS__ !== 'undefined') {

        //     __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: this }));

        // }

    }

    /**
     * This method needs to be implemented by all concrete loaders. It holds the
     * logic for loading assets from the backend.
     *
     * @abstract
     * @param {string} url - The path/URL of the file to be loaded.
     * @param {Function} onLoad - Executed when the loading process has been finished.
     * @param {onProgressCallback} [onProgress] - Executed while the loading is in progress.
     * @param {onErrorCallback} [onError] - Executed when errors occur.
     */
    public load(
        url: string, 
        onLoad: LoadCallback, 
        onProgress: ProgressCallback, 
        onError: ErrorCallback
    ): any {
        throw new Error("Must implement load()");
    }

    /**
     * A async version of {@link Loader#load}.
     *
     * @param {string} url - The path/URL of the file to be loaded.
     * @param {onProgressCallback} [onProgress] - Executed while the loading is in progress.
     * @return {Promise} A Promise that resolves when the asset has been loaded.
     */
    public loadAsync<T = any>(url: string, onProgress: ProgressCallback): Promise<T> {

        return new Promise((resolve, reject) => {

            this.load(url, (data: T) => resolve(data), onProgress, reject);

        });

    }

    /**
     * This method needs to be implemented by all concrete loaders. It holds the
     * logic for parsing the asset into three.js entities.
     *
     * @abstract
     * @param {any} data - The data to parse.
     */
    public parse(data: any) {
        throw new Error("Must implement parse()");
    }

    /**
     * Sets the `crossOrigin` String to implement CORS for loading the URL
     * from a different domain that allows CORS.
     *
     * @param {string} crossOrigin - The `crossOrigin` value.
     * @return {Loader} A reference to this instance.
     */
    public setCrossOrigin(crossOrigin: string): this {

        this.crossOrigin = crossOrigin;
        return this;

    }

    /**
     * Whether the XMLHttpRequest uses credentials such as cookies, authorization
     * headers or TLS client certificates, see [XMLHttpRequest.withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials).
     *
     * Note: This setting has no effect if you are loading files locally or from the same domain.
     *
     * @param {boolean} value - The `withCredentials` value.
     * @return {Loader} A reference to this instance.
     */
    public setWithCredentials(value: boolean): this {

        this.withCredentials = value;
        return this;

    }

    /**
     * Sets the base path for the asset.
     *
     * @param {string} path - The base path.
     * @return {Loader} A reference to this instance.
     */
    public setPath(path: string): Loader {

        this.path = path;
        return this;

    }

    /**
     * Sets the base path for dependent resources like textures.
     *
     * @param {string} resourcePath - The resource path.
     * @return {Loader} A reference to this instance.
     */
    public setResourcePath(resourcePath: string): Loader {

        this.resourcePath = resourcePath;
        return this;

    }

    /**
     * Sets the given request header.
     *
     * @param {Object} requestHeader - A [request header](https://developer.mozilla.org/en-US/docs/Glossary/Request_header)
     * for configuring the HTTP request.
     * @return {Loader} A reference to this instance.
     */
    public setRequestHeader(requestHeader: { [key: string]: any }): this {

        this.requestHeader = requestHeader;
        return this;

    }

    /**
     * This method can be implemented in loaders for aborting ongoing requests.
     *
     * @abstract
     * @return {Loader} A reference to this instance.
     */
    public abort(): this {

        return this;

    }

}

/**
 * Callback for onProgress in loaders.
 *
 * @callback onProgressCallback
 * @param {ProgressEvent} event - An instance of `ProgressEvent` that represents the current loading status.
 */

/**
 * Callback for onError in loaders.
 *
 * @callback onErrorCallback
 * @param {Error} error - The error which occurred during the loading process.
 */

export { Loader };
