export class MolecularStructure implements Representation {
    type = "molecular"

    positions: Float32Array
    velocities: Float32Array
    forces: Float32Array
    mass: Float32Array
}