import { Color, CylinderGeometry, MeshBasicMaterial, Mesh, Vector3, Node3D, Group } from "@stemngine/engine";


export class Gizmos {


}

export function createAxis(color: number | string, direction: Vector3) {



    const geometry = new CylinderGeometry(0.02, 0.02, 1);
    const material = new MeshBasicMaterial({color});
    const mesh = new Mesh(geometry, material);

    mesh.position.copy(direction.clone().multiplyScalar(0.5));
    mesh.lookAt(direction);

    return mesh;
}

export function attachGizmo(object: Node3D, gizmo: Group) {

    gizmo.position.copy(object.position);
    
}