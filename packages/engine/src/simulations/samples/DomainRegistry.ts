class DomainRegistry {
    // private registry: Map<string, Set<Representation>> = new Map()

    // // Register a representation under a domain name
    // register(domainName: string, rep: Representation) {
    //     if (!this.registry.has(domainName)) {
    //         this.registry.set(domainName, new Set())
    //     }
    //     this.registry.get(domainName)!.add(rep)
    // }

    // // Unregister a representation
    // unregister(domainName: string, rep: Representation) {
    //     this.registry.get(domainName)?.delete(rep)
    // }

    // // Retrieve all representations for a domain
    // get(domainName: string): Set<Representation> {
    //     return this.registry.get(domainName) || new Set()
    // }

    // // Helper: check if domain exists
    // has(domainName: string): boolean {
    //     return this.registry.has(domainName)
    // }
}
