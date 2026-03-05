import { DirectionalLight, MeshPhongMaterial, OrthographicCamera, Scene } from "@stemngine/engine";
import { PerspectiveCamera } from "@stemngine/engine";
import { WebGLRenderer } from "@stemngine/engine";
import { BoxGeometry } from "@stemngine/engine";
import { MeshBasicMaterial } from "@stemngine/engine";
import { Mesh } from "@stemngine/engine";
import { OrbitControls, Color } from "@stemngine/engine";
import { Clock, Simulation, World, ParticleSystem } from "@stemngine/engine";
import { Vector3, SimPropertyBinding, SimBindingManager } from "@stemngine/engine";

import { Pane } from "tweakpane";

const clock = new Clock();

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: 0x00ff00 });
const cube = new Mesh(geometry, material);

const cube2 = new Mesh(geometry, material);

const scene = new Scene();

scene.add(cube);
scene.add(cube2);

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.z = 5;
camera.position.x = 2;
camera.lookAt(0, 0, 0);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const world = new World();

const particleSystem = new ParticleSystem();
particleSystem.createParticle({}); // default particle
particleSystem.createParticle({}); // default particle

const sbindingManager = new SimBindingManager();
sbindingManager.createBinding(cube, 'position', particleSystem.particles[0].position);
sbindingManager.createBinding(cube2, 'position', particleSystem.particles[1].position);
// const sbinding = new SimPropertyBinding(cube, 'position', particleSystem.particles[0].position);

world.addSystem(0, particleSystem);


const particle1 = particleSystem.particles[0];
const particle2 = particleSystem.particles[1];
let particle = particle2;


const simulation = new Simulation(world);





let flag = true;

// document.addEventListener('click', (event) => {

//     const particle = particleSystem.particles[0];

//     particle.addForce(new Vector3(0, flag ? 10 : -10, 0));

//     flag = !flag;

//     console.log(particle);

// });

const pane = new Pane();
pane.addButton({title: 'select'}).on('click', () => {
    particle = particle === particle1 ? particle2 : particle1;
});
pane.addButton({ title: 'up' }).on('click', () => {

    addForce(new Vector3(0, 10, 0));

});
pane.addButton({ title: 'down' }).on('click', () => {

    addForce(new Vector3(0, -10, 0));

});
pane.addButton({ title: 'left' }).on('click', () => {

    addForce(new Vector3(-10, 0, 0));

});
pane.addButton({ title: 'right' }).on('click', () => {

    addForce(new Vector3(10, 0, 0));

});

pane.addButton({title: 'negate'}).on('click', () => {

    negate();
})

pane.addButton({title: 'reset'}).on('click', () => {

    reset();
});

pane.addButton({title: 'pause'}).on('click', () => {
    pause();
});

pane.addButton({title: 'button'}).on('click', () => {
    // console.log(particleSystem);
    // console.log(particle)
    console.log({})
});

const addForce = (force: Vector3): void => {

    particle.addForce(force);

    flag = !flag;

    // console.log(particle);

}

const negate = () => {

    particle.velocity.negate();

}

const reset = () => {

    particle.velocity.clear();
    particle.position.clear();
    cube.position.clear();

}

const pause = () => {

    particle.velocity.clear();
}


function mainLoop(/* dt: number, frame?: any */) {

    clock.tick();
    const dt = clock.dt;

    simulation.step(dt);

    // cube.position.copy(particleSystem.particles[0].position)
    sbindingManager.update();

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(mainLoop);
