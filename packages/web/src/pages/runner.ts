
// TODO: this should be in router or services
/**
 * Loading from fastify server
 * @param id 
 */
export async function loadBundle(id: string) {


    // TODO: replace with correct URL
    const url = `http://localhost:3000/artifact/${id}`;

    const res = await fetch(url);

    // TODO: find better way to handle, instead of erroring out
    if (!res.ok) {
        throw new Error(`Failed to load bundle: ${res.status}`);
    }

    return res.json();

}

export async function renderRunner(id: string) {


    const root = document.getElementById("root")!;
    root.innerHTML = "Loading...";

    const data = await loadBundle(id);

    console.log("BUNDLE:", data); // TODO: to be removes

    root.innerHTML = "";

    const container = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = `Running: ${id}`;

    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(/* bundle */ data, null, 2);

    container.appendChild(title);
    container.appendChild(pre);

    root.appendChild(container);

}
