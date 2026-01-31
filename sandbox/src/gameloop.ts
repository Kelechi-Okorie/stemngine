
import { Clock, OrthographicCamera, PerspectiveCamera } from "@stemngine/engine";


const clock = new Clock();
console.log(clock);

const perspectiveCamera = new PerspectiveCamera(75, 16 / 9, 0.1, 1000);
console.log(perspectiveCamera);
// const json = camera.toJSON();
// console.log(json);

const orthographicCamera = new OrthographicCamera(-10, 10, 10, -10, 0.1, 1000);
console.log(orthographicCamera);
// const json2 = cam2.toJSON();
// console.log(json2);
