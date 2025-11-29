import { PerspectiveCamera } from "../src/cameras/PerspectiveCamera";
// const PerspectiveCamera = require("../src/cameras/PerspectiveCamera").PerspectiveCamera;

const cam = new PerspectiveCamera(75, 16 / 9, 0.1, 1000);
console.log(cam);
