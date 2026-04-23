
/**
 * Why bidirectional map is essential
 * because you need both queries
 * 
 * - select object -> find its reps
 * - update rep -> find its object
 */
export class MappingIndex {
    // objectToReps = new Map<string, Set<number>>()
    // repToObject = new Map<number, string>()

    // link(objectId: string, rep: Representation) {
    //     if (!this.objectToReps.has(objectId))
    //         this.objectToReps.set(objectId, new Set())

    //     this.objectToReps.get(objectId)!.add(rep.id)
    //     this.repToObject.set(rep.id, objectId)
    //     rep.objectId = objectId
    // }

    // unlink(rep: Representation) {
    //     const obj = this.repToObject.get(rep.id)
    //     if (!obj) return

    //     this.objectToReps.get(obj)?.delete(rep.id)
    //     this.repToObject.delete(rep.id)
    //     rep.objectId = undefined
    // }

    // getRepresentations(objectId: string) {
    //     return this.objectToReps.get(objectId) ?? new Set()
    // }
}
