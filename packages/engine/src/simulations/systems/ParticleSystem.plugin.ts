import { RegisterSystem } from "../core/SystemRegistry";
import { ParticleSystem } from "./ParticleSystem";
import { SystemType, SystemTypeToId } from "../Interfaces";

RegisterSystem({
    id: SystemTypeToId[SystemType.ParticleSystem],
    name: 'Particle System',
    create: () => new ParticleSystem()
});
