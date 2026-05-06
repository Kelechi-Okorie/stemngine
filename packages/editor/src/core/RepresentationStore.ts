import { GlobalEventDispatcher } from "@stemngine/engine";
import { VisualRepresentation } from "../Interfaces";

export enum RepresentationStoreEventType {
    REPRESENTATION_SET = 'representation:set',
    REPRESENTATION_UPDATE = 'representation:update',
    REPRESENTATION_REMOVE = 'representation:remove'
}

export type RepresentationEvent = {
    type: RepresentationStoreEventType,
    representation: VisualRepresentation
}

/**
 * What can be observed about this entity
 */
export const RepresentationStore = {

    // entityId -> representations
    byEntity: new Map<string, VisualRepresentation[]>(),

    // repId -> representation
    byId: new Map<string, VisualRepresentation>(),

    add(rep: VisualRepresentation) {

        let list = this.byEntity.get(rep.entityId);

        if (!list) {

            list = [];
            this.byEntity.set(rep.entityId, list);

        }

        list.push(rep);

        this.byId.set(rep.id, rep);

        GlobalEventDispatcher.instance.dispatchEvent({
            type: RepresentationStoreEventType.REPRESENTATION_SET,
            representation: rep
        });

    },

    update(rep: VisualRepresentation) {

        const list = this.byEntity.get(rep.entityId);
        if (!list) return;

        // TODO: check if slow
        const index = list.findIndex(r => r.id === rep.id);
        if (index !== -1) {

            list[index] = rep;

        }

        // keep in sync
        this.byId.set(rep.id, rep);

        GlobalEventDispatcher.instance.dispatchEvent({
            type: RepresentationStoreEventType.REPRESENTATION_UPDATE,
            representation: rep
        });

    },

    remove(repId: string, entityId: string) {

        const list = this.byEntity.get(entityId);
        if (!list) return;

        // TODO: check if slow
        const index = list.findIndex(r => r.id === repId)
        if (index !== -1) {

            // TODO: this may be costly, use cheaper methods
            list.splice(index, 1);

        }

        // remove from direct map
        this.byId.delete(repId);

        GlobalEventDispatcher.instance.dispatchEvent({
            type: RepresentationStoreEventType.REPRESENTATION_REMOVE,
            representationId: repId
        });
    },

    getByEntity(entityId: string) {

        return this.byEntity.get(entityId) ?? [];

    },

    getById(repId: string) {

        return this.byId.get(repId);
        
    }

}
