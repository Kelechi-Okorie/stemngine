import { App } from "./core/App";

const container = document.getElementById('root');

if (container === null) {

    throw new Error('root container does not exist');

}

container.style.width = '100%';
container.style.height = '100%';

const app = new App(container);
app.bootstrap();
