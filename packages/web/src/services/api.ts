
// TODO: replace with correct URL
const host = `http://localhost:3000`;

// TODO: to be removed
// export async function getRegistry() {

//     const url = `${host}/registry`;

//     const res = await fetch(url);

//     // TODO: find better way to handle, instead of erroring out
//     if (!res.ok) {
//         console.log(res)
//         throw new Error(`Failed to load bundle: ${res.status}`);
//     }

//     return res.json();

// }

export async function getConcept(id: string) {

    const url = `${host}/concept/${id}`;

    const res = await fetch(url);

    // TODO: find better way to handle, instead of erroring out
    if (!res.ok) {
        console.log(res)
        throw new Error(`Failed to load bundle: ${res.status}`);
    }

    return res.json();

}

/**
 * Loading from fastify server
 * @param id 
 */
export async function loadBundle(id: string) {

    const url = `${host}/bundle/${id}`;

    const res = await fetch(url);

    // TODO: find better way to handle, instead of erroring out
    if (!res.ok) {
        console.log(res)
        throw new Error(`Failed to load bundle: ${res.status}`);
    }

    return res.json();

}
