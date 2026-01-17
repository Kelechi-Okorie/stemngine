import { Scene } from "../../scenes/Scene";

export interface RenderItem {
  id: number | null;
  object: { id: number; renderOrder?: number } | null; // typically Mesh/Object3D;
  geometry: any | null;      // usually BufferGeometry
  material: { id: number; transparent?: boolean; transmission?: number } | null; // minimal
  groupOrder: number;
  renderOrder?: number;
  z: number;
  group: any | null;
}

function painterSortStable(a: RenderItem, b: RenderItem) {

  if (a.groupOrder !== b.groupOrder) {

    return a.groupOrder - b.groupOrder;

  } else if (a.renderOrder !== b.renderOrder) {

    return (a.renderOrder ?? 0) - (b.renderOrder ?? 0);

  } else if (a.material!.id !== b.material!.id) {

    return a.material!.id - b.material!.id;

  } else if (a.z !== b.z) {

    return a.z - b.z;

  } else {

    return a.id! - b.id!;

  }

}

function reversePainterSortStable(a: RenderItem, b: RenderItem) {

  if (a.groupOrder !== b.groupOrder) {

    return a.groupOrder - b.groupOrder;

  } else if (a.renderOrder !== b.renderOrder) {

    return (a.renderOrder ?? 0) - (b.renderOrder ?? 0);

  } else if (a.z !== b.z) {

    return b.z - a.z;

  } else {

    return a.id! - b.id!;

  }

}


export class WebGLRenderList {

  protected renderItems: RenderItem[] = [];
  protected renderItemsIndex = 0;

  public opaque: RenderItem[] = [];
  public transmissive: RenderItem[] = [];
  public transparent: RenderItem[] = [];

  constructor() {}

  public init() {

    this.renderItemsIndex = 0;

    this.opaque.length = 0;
    this.transmissive.length = 0;
    this.transparent.length = 0;

  }

  private getNextRenderItem(
    object: { id: number; renderOrder?: number },
    geometry: any,
    material: { id: number; transparent?: boolean; transmission?: number },
    groupOrder: number,
    z: number,
    group: any  // TODO: type very well
  ) {

    let renderItem = this.renderItems[this.renderItemsIndex];

    if (renderItem === undefined) {

      renderItem = {
        id: object.id,
        object: object,
        geometry: geometry,
        material: material,
        groupOrder: groupOrder,
        renderOrder: object.renderOrder,
        z: z,
        group: group
      };

      this.renderItems[this.renderItemsIndex] = renderItem;

    } else {

      renderItem.id = object.id;
      renderItem.object = object;
      renderItem.geometry = geometry;
      renderItem.material = material;
      renderItem.groupOrder = groupOrder;
      renderItem.renderOrder = object.renderOrder;
      renderItem.z = z;
      renderItem.group = group;

    }

    this.renderItemsIndex++;

    return renderItem;

  }

  public push(
    object: { id: number; renderOrder?: number },
    geometry: any,
    material: { id: number; transparent?: boolean; transmission?: number },
    groupOrder: number,
    z: number,
    group: any  // TODO: type very well

  ) {

    const renderItem = this.getNextRenderItem(object, geometry, material, groupOrder, z, group);

    if ((material.transmission ?? 0) > 0.0) {

      this.transmissive.push(renderItem);

    } else if (material.transparent === true) {

      this.transparent.push(renderItem);

    } else {

      this.opaque.push(renderItem);

    }

  }

  public unshift(
    object: { id: number; renderOrder?: number },
    geometry: any,
    material: { id: number; transparent?: boolean; transmission?: number },
    groupOrder: number,
    z: number,
    group: any  // TODO: type very well

  ) {

    const renderItem = this.getNextRenderItem(object, geometry, material, groupOrder, z, group);

    if ((material.transmission ?? 0) > 0.0) {

      this.transmissive.unshift(renderItem);

    } else if (material.transparent === true) {

      this.transparent.unshift(renderItem);

    } else {

      this.opaque.unshift(renderItem);

    }

  }

  public sort(
    customOpaqueSort?: (a: RenderItem, b: RenderItem) => number,
    customTransparentSort?: (a: RenderItem, b: RenderItem) => number
  ) {

    if (this.opaque.length > 1) this.opaque.sort(customOpaqueSort || painterSortStable);
    if (this.transmissive.length > 1) this.transmissive.sort(customTransparentSort || reversePainterSortStable);
    if (this.transparent.length > 1) this.transparent.sort(customTransparentSort || reversePainterSortStable);

  }

  public finish() {

    // Clear references from inactive renderItems in the list

    for (let i = this.renderItemsIndex, il = this.renderItems.length; i < il; i++) {

      const renderItem = this.renderItems[i];

      if (renderItem.id === null) break;

      renderItem.id = null;
      renderItem.object = null;
      renderItem.geometry = null;
      renderItem.material = null;
      renderItem.group = null;

    }

  }

}

export class WebGLRenderLists {

  protected lists = new WeakMap();

  constructor() {}

  public get(scene: Scene, renderCallDepth: number) {

    const listArray = this.lists.get(scene);
    let list;

    if (listArray === undefined) {

      list = new WebGLRenderList();
      this.lists.set(scene, [list]);

    } else {

      if (renderCallDepth >= listArray.length) {

        list = new WebGLRenderList();
        listArray.push(list);

      } else {

        list = listArray[renderCallDepth];

      }

    }

    return list;

  }

  public dispose() {

    this.lists = new WeakMap();

  }

}
