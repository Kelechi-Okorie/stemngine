import { Cache } from './Cache';
import { Loader } from './Loader';
import { createElementNS } from '../utils';
import { LoadingManager, LoadCallback, ProgressCallback, ErrorCallback } from './LoadingManager';

const _loading = new WeakMap();

/**
 * A loader for loading images. The class loads images with the HTML `Image` API.
 *
 * ```js
 * const loader = new ImageLoader();
 * const image = await loader.loadAsync( 'image.png' );
 * ```
 * Please note that `ImageLoader` has dropped support for progress
 * events in `r84`. For an `ImageLoader` that supports progress events, see
 * [this thread](https://github.com/mrdoob/three.js/issues/10439#issuecomment-275785639).
 *
 * @augments Loader
 */
class ImageLoader extends Loader {

    /**
     * Constructs a new image loader.
     *
     * @param {LoadingManager} [manager] - The loading manager.
     */
    constructor(manager: LoadingManager) {

        super(manager);

    }

    /**
     * Starts loading from the given URL and passes the loaded image
     * to the `onLoad()` callback. The method also returns a new `Image` object which can
     * directly be used for texture creation. If you do it this way, the texture
     * may pop up in your scene once the respective loading process is finished.
     *
     * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
     * @param {function(Image)} onLoad - Executed when the loading process has been finished.
     * @param {onProgressCallback} onProgress - Unsupported in this loader.
     * @param {onErrorCallback} onError - Executed when errors occur.
     * @return {Image} The image.
     */
    public load(
        url: string,
        onLoad?: LoadCallback,
        onProgress?: ProgressCallback,
        onError?: ErrorCallback
    ) {

        if (this.path !== undefined) url = this.path + url;

        url = this.manager.resolveURL(url);

        const cached = Cache.get(`image:${url}`);

        if (cached !== undefined) {

            if (cached.complete === true) {

                this.manager.itemStart(url);

                setTimeout( () => {

                    if (onLoad) onLoad(cached);

                    this.manager.itemEnd(url);

                }, 0);

            } else {

                let arr = _loading.get(cached);

                if (arr === undefined) {

                    arr = [];
                    _loading.set(cached, arr);

                }

                arr.push({ onLoad, onError });

            }

            return cached;

        }

        const image = createElementNS('img') as HTMLImageElement;

        const onImageLoad = () => {

            removeEventListeners();

            // if (onLoad) onLoad(this);
            // onLoad?.(this as any)
            onLoad?.(image)

            //

            // const callbacks = _loading.get(this) || [];
            const callbacks = _loading.get(image) || [];

            for (let i = 0; i < callbacks.length; i++) {

                const callback = callbacks[i];
                if (callback.onLoad) callback.onLoad(this);

            }

            // _loading.delete(this);
            _loading.delete(image);

            this.manager.itemEnd(url);

        }

        const onImageError = (event: Event) =>  {

            removeEventListeners();

            if (onError) onError(event);

            Cache.remove(`image:${url}`);

            //

            const callbacks = _loading.get(this) || [];

            for (let i = 0; i < callbacks.length; i++) {

                const callback = callbacks[i];
                if (callback.onError) callback.onError(event);

            }

            _loading.delete(this);


            this.manager.itemError(url);
            this.manager.itemEnd(url);

        }

        function removeEventListeners() {

            image.removeEventListener('load', onImageLoad, false);
            image.removeEventListener('error', onImageError, false);

        }

        image.addEventListener('load', onImageLoad, false);
        image.addEventListener('error', onImageError, false);

        if (url.slice(0, 5) !== 'data:') {

            if (this.crossOrigin !== undefined) image.crossOrigin = this.crossOrigin;

        }

        Cache.add(`image:${url}`, image);
        this.manager.itemStart(url);

        image.src = url;

        return image;

    }

}

export { ImageLoader };
