

export class InteractionManager {

    private activeOverlays = new Set<HTMLElement>();

    public registerOverlay(el: HTMLElement) {

        this.activeOverlays.add(el);

    }
     
    public unregisterOverlay(el: HTMLElement) {

        this.activeOverlays.delete(el);

    }

    public isInsideOverlay(e: PointerEvent): boolean {

        const path = e.composedPath();

        for (const overlay of this.activeOverlays) {

            if (path.includes(overlay)) return true;

        }

        return false;

    }

}
