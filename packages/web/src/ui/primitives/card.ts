import { el, normalizeClass } from "../el";

// Optional (but powerful): slots pattern
// Later, you can evolve Card into:
// Card({
//   header: el(...),
//   body: [...],
//   footer: el(...)
// })
// But don’t overbuild yet.

export function Card(props: {
    title?: string;
    children?: HTMLElement[];
    class?: string | string[];
}): HTMLElement {

    const className = ["card", normalizeClass(props.class)]
        .filter(Boolean)
        .join(" ");

    return el("div", { class: className }, [
        props.title ? el("h4", { text: props.title }) : null,
        ...(props.children || [])
    ]);

}
