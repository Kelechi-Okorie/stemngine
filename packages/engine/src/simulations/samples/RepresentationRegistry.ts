class RepresentationRegistry {
    private stores = new Map<string, any[]>()

    register(rep: Representation) {
        if (!this.stores.has(rep.type))
            this.stores.set(rep.type, [])

        this.stores.get(rep.type)!.push(rep)
    }

    getStore<T>(type: string): T[] {
        return this.stores.get(type) ?? []
    }

    remove(rep: Representation) {
        const arr = this.stores.get(rep.type)
        if (!arr) return
        const i = arr.indexOf(rep)
        if (i >= 0) arr.splice(i,1)
    }
}