import { CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping } from '../../constants';
import { BaseEvent } from '../../core/EventDispatcher';
import { PMREMGenerator } from '../../extras/PMREMGenerator';
import { Texture } from '../../textures/Texture';
import { WebGLRenderer } from '../WebGLRenderer';

export class WebGLCubeUVMaps {
  private renderer: WebGLRenderer

	private cubeUVmaps = new WeakMap();

	private pmremGenerator: PMREMGenerator | null = null;

  constructor( renderer: WebGLRenderer ) {
    this.renderer = renderer;
  }

	public get( texture: Texture ) {

		if ( texture && texture.isTexture ) {

			const mapping = texture.mapping;

			const isEquirectMap = ( mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping );
			const isCubeMap = ( mapping === CubeReflectionMapping || mapping === CubeRefractionMapping );

			// equirect/cube map to cubeUV conversion

			if ( isEquirectMap || isCubeMap ) {

				let renderTarget = this.cubeUVmaps.get( texture );

				const currentPMREMVersion = renderTarget !== undefined ? renderTarget.texture.pmremVersion : 0;

				if ( texture.isRenderTargetTexture && texture.pmremVersion !== currentPMREMVersion ) {

					if ( this.pmremGenerator === null ) this.pmremGenerator = new PMREMGenerator( this.renderer );

					renderTarget = isEquirectMap ? this.pmremGenerator.fromEquirectangular( texture, renderTarget ) : this.pmremGenerator.fromCubemap( texture, renderTarget );
					renderTarget.texture.pmremVersion = texture.pmremVersion;

					this.cubeUVmaps.set( texture, renderTarget );

					return renderTarget.texture;

				} else {

					if ( renderTarget !== undefined ) {

						return renderTarget.texture;

					} else {

						const image = texture.image;

						if ( ( isEquirectMap && image && image.height > 0 ) || ( isCubeMap && image && this.isCubeTextureComplete( image ) ) ) {

							if ( this.pmremGenerator === null ) this.pmremGenerator = new PMREMGenerator( this.renderer );

							renderTarget = isEquirectMap ? this.pmremGenerator.fromEquirectangular( texture ) : this.pmremGenerator.fromCubemap( texture );
							renderTarget.texture.pmremVersion = texture.pmremVersion;

							this.cubeUVmaps.set( texture, renderTarget );

							texture.addEventListener( 'dispose', this.onTextureDispose );

							return renderTarget.texture;

						} else {

							// image not yet ready. try the conversion next frame

							return null;

						}

					}

				}

			}

		}

		return texture;

	}

	public isCubeTextureComplete( image: ArrayLike<any> ) {

		let count = 0;
		const length = 6;

		for ( let i = 0; i < length; i ++ ) {

			if ( image[ i ] !== undefined ) count ++;

		}

		return count === length;


	}

	public onTextureDispose( event: BaseEvent<Texture> ) {

		const texture = event.target;

		texture.removeEventListener( 'dispose', this.onTextureDispose );

		const cubemapUV = this.cubeUVmaps.get( texture );

		if ( cubemapUV !== undefined ) {

			this.cubeUVmaps.delete( texture );
			cubemapUV.dispose();

		}

	}

	public dispose() {

		this.cubeUVmaps = new WeakMap();

		if ( this.pmremGenerator !== null ) {

			this.pmremGenerator.dispose();
			this.pmremGenerator = null;

		}

	}

}
