
import { Clock, OrthographicCamera, PerspectiveCamera } from "@stemngine/engine";


// const clock = new Clock();
// console.log(clock);
const camera = new PerspectiveCamera(75, 16 / 9, 0.1, 1000);
// console.log(camera);
const json = camera.toJSON();
console.log(json);

const cam2 = new OrthographicCamera(-10, 10, 10, -10, 0.1, 1000);
console.log(cam2);
const json2 = cam2.toJSON();
console.log(json2);
