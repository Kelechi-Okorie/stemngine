// 1️⃣ Each system has its own file and buffer

// For example:

// ParticleSystem.ts
export class ParticleSystem {
    public particles: Particle[] = []

    addParticle(p: Particle) {
        // system owns creation
        p.index = this.particles.length
        this.particles.push(p)
    }

    removeParticle(p: Particle) {
        const last = this.particles.length - 1
        const lastParticle = this.particles[last]

        // swap-and-pop
        this.particles[p.index] = lastParticle
        lastParticle.index = p.index
        this.particles.pop()
    }

    step(dt: number) {
        for (const p of this.particles) {
            p.integrate(dt)
        }
    }
}

// Similarly:

// ClothSystem.ts
export class ClothSystem {
    public particles: ClothParticle[] = []
    public cloths: Cloth[] = []

    addCloth(cloth: Cloth) {
        cloth.startIndex = this.particles.length
        cloth.count = cloth.particles.length
        for (const p of cloth.particles) {
            p.index = this.particles.length
            this.particles.push(p)
        }
        this.cloths.push(cloth)
    }

    step(dt: number) {
        // iterate dense buffer
        for (const p of this.particles) {
            p.integrate(dt)
        }

        // then solve constraints
        for (const cloth of this.cloths) {
            cloth.solveConstraints()
        }
    }
}
// FluidSystem.ts
export class FluidSystem {
    public particles: FluidParticle[] = []

    step(dt: number) {
        // SPH density, pressure, forces
        for (const p of this.particles) {
            p.computeDensity()
        }
        for (const p of this.particles) {
            p.integrate(dt)
        }
    }
}
// 2️⃣ World holds all systems
export class World {
    public particleSystem = new ParticleSystem()
    public clothSystem = new ClothSystem()
    public fluidSystem = new FluidSystem()

    step(dt: number) {
        this.particleSystem.step(dt)
        this.clothSystem.step(dt)
        this.fluidSystem.step(dt)

        // optional: cross-system coupling
        // e.g., fluid -> cloth interaction
    }
}