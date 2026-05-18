import { App } from "./core/App";

const container = document.getElementById('root');

if (container === null) {

    throw new Error('root container does not exist');

}

const app = new App(container);
app.bootstrap();
