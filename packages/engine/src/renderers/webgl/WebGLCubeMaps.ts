import { CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping } from '../../constants';
import { WebGLCubeRenderTarget } from '../WebGLCubeRenderTarget';
import { WebGLRenderer } from '../WebGLRenderer';
import { Texture } from '../../textures/Texture';
import { EventDispatcher } from '../../core/EventDispatcher';
import { BaseEvent } from '../../core/EventDispatcher';

export class WebGLCubeMaps {
  private renderer: WebGLRenderer;
	// let cubemaps = new WeakMap();
  private cubemaps = new WeakMap<Texture, WebGLCubeRenderTarget>();

  constructor( renderer:  WebGLRenderer ) {
    this.renderer = renderer;
  }

	public mapTextureMapping( texture: Texture, mapping: number ): Texture {

		if ( mapping === EquirectangularReflectionMapping ) {

			texture.mapping = CubeReflectionMapping;

		} else if ( mapping === EquirectangularRefractionMapping ) {

			texture.mapping = CubeRefractionMapping;

		}

		return texture;

	}

	public get( texture: Texture | null ): Texture | null {

		if ( texture && texture.isTexture ) {

			const mapping = texture.mapping;

			if ( mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping ) {

				if ( this.cubemaps.has( texture ) ) {

					const cubemap = this.cubemaps.get( texture )!.texture;
					return this.mapTextureMapping( cubemap, texture.mapping );

				} else {

					const image = texture.image;

					if ( image && image.height > 0 ) {

						const renderTarget = new WebGLCubeRenderTarget( image.height );
						renderTarget.fromEquirectangularTexture( this.renderer, texture );
						this.cubemaps.set( texture, renderTarget );

						texture.addEventListener( 'dispose', this.onTextureDispose );

						return this.mapTextureMapping( renderTarget.texture, texture.mapping );

					} else {

						// image not yet ready. try the conversion next frame

						return null;

					}

				}

			}

		}

		return texture;

	}

	public onTextureDispose( event: BaseEvent<Texture> ) {

		const texture = event.target;

		texture.removeEventListener( 'dispose', this.onTextureDispose );

		const cubemap = this.cubemaps.get( texture );

		if ( cubemap !== undefined ) {

			this.cubemaps.delete( texture );
			cubemap.dispose();

		}

	}

	public dispose() {

		this.cubemaps = new WeakMap();

	}

}
