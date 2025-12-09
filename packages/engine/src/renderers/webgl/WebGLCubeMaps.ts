import { CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping } from '../../constants';
import { WebGLCubeRenderTarget } from '../WebGLCubeRenderTarget';
import { WebGLRenderer } from '../WebGLRenderer';
import { Texture } from '../../textures/Texture';
import { EventDispatcher } from '../../core/EventDispatcher';

export function WebGLCubeMaps( renderer: WebGLRenderer ) {

	let cubemaps: WeakMap<Texture, WebGLCubeRenderTarget> = new WeakMap();

	function mapTextureMapping( texture: Texture, mapping: number ): Texture {

		if ( mapping === EquirectangularReflectionMapping ) {

			texture.mapping = CubeReflectionMapping;

		} else if ( mapping === EquirectangularRefractionMapping ) {

			texture.mapping = CubeRefractionMapping;

		}

		return texture;

	}

	function get( texture: Texture ): Texture | null {

		if ( texture && texture.isTexture ) {

			const mapping = texture.mapping;

			if ( mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping ) {

				if ( cubemaps.has( texture ) ) {

					const cubemap = cubemaps.get( texture )!.texture;
					return mapTextureMapping( cubemap, texture.mapping );

				} else {

					const image = texture.image;

					if ( image && image.height > 0 ) {

						const renderTarget = new WebGLCubeRenderTarget( image.height );
						renderTarget.fromEquirectangularTexture( renderer, texture );
						cubemaps.set( texture, renderTarget );

						texture.addEventListener( 'dispose', onTextureDispose );

						return mapTextureMapping( renderTarget.texture, texture.mapping );

					} else {

						// image not yet ready. try the conversion next frame

						return null;

					}

				}

			}

		}

		return texture;

	}

	function onTextureDispose( event: EventDispatcher & {target: any} ): void {

		const texture = event.target;

		texture.removeEventListener( 'dispose', onTextureDispose );

		const cubemap = cubemaps.get( texture );

		if ( cubemap !== undefined ) {

			cubemaps.delete( texture );
			cubemap.dispose();

		}

	}

	function dispose() {

		cubemaps = new WeakMap();

	}

	return {
		get: get,
		dispose: dispose
	};

}
