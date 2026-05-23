import { App } from "./core/App";

const host = document.getElementById('host');

if (host === null) {

    throw new Error('host host does not exist');

}

host.style.width = '100%';
host.style.height = '100%';

const app = new App(host);
app.bootstrap();
