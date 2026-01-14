export class WebGLProperties<T extends object = object> {

	private properties = new WeakMap<T, Record<string, any>>();

  constructor() {}

	public has( object: T ): boolean {

		return this.properties.has( object );

	}

	public get( object: T ): Record<string, any> {

		let map = this.properties.get( object );

		if ( map === undefined ) {

			map = {};
			this.properties.set( object, map );

		}

		return map;

	}

	public remove( object: T ): void {

		this.properties.delete( object );

	}

	public update( object: T, key: string, value: any ): void {

		// properties.get( object )[ key ] = value;

    const map = this.get(object);
    map[key] = value;

	}

	public dispose(): void {

		this.properties = new WeakMap();

	}

}
