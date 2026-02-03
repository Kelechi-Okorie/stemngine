import { DirectionalLight, MeshPhongMaterial, OrthographicCamera, Scene } from "@stemngine/engine";
import { PerspectiveCamera } from "@stemngine/engine";
import { WebGLRenderer } from "@stemngine/engine";
import { BoxGeometry } from "@stemngine/engine";
import { MeshBasicMaterial } from "@stemngine/engine";
import { Mesh } from "@stemngine/engine";
import { OrbitControls, Color } from "@stemngine/engine";

import { Pane } from 'tweakpane';

const geometry = new BoxGeometry(1, 1, 1);
// const material = new MeshBasicMaterial({ color: 0x00ff00 });
const material = new MeshPhongMaterial({color: 0x00ff00});
const cube = new Mesh(geometry, material);

const scene = new Scene();
scene.background = new Color(0xff0000)

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const camera2 = new OrthographicCamera()

const left = -1;
const right = 1;
const top = 1;
const bottom = -1;
const near = 5;
const far = 50
// const camera = new OrthographicCamera(left, right, top, bottom, near, far);
// const camera = new OrthographicCamera();
// camera.zoom = 0.2;

const renderer = new WebGLRenderer({antialias: true});
renderer.setClearColor(0x000000, 1); // black, fully opaque
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setAnimationLoop(animate);

console.log(renderer.info)

document.body.appendChild(renderer.domElement);

scene.add(cube);

camera.position.z = 5;
camera.position.x = 2;

// console.log({scene})

const color = 0xff0000;
const intensity = 0.5;
const light = new DirectionalLight(color, intensity);
light.position.set(-1, 10, 4);
// scene.add(light);

renderer.render(scene, camera);

// console.log({scene, camera, renderer});

// const input = new BrowserInputManager(renderer.domElement);

// const orbitInput = new OrbitInputMapper(input);

const orbitControl = new OrbitControls(camera, renderer.domElement);

const pane = new Pane();
pane.addButton({ title: 'connect' }).on('click', () => {

  // input.dispose();
  orbitControl.connect();

});
pane.addButton({ title: 'disconnect' }).on('click', () => {

  // input.dispose();
  orbitControl.dispose();

});
pane.addButton({ title: 'move' }).on('click', () => {

  // input.dispose();
  // orbitControl.dispose();
  // cube.position.x += 0.1;
  console.log(camera.position.z)

});

function animate(time: number, frame?: any): void {

  // cube.rotation.x = time / 2000;
  // cube.rotation.y = time / 1000;

  renderer.render(scene, camera);

}
