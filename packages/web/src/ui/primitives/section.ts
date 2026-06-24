import { el, normalizeClass } from "../el";

export function Section(props: {
    title: string;
    children: HTMLElement[];
    class?: string | string[];
}) {

    const className = ["section", normalizeClass(props.class)]
        .filter(Boolean)
        .join(" ");


    return el("div", { class: className }, [
        el("h3", { text: props.title }),
        ...props.children
    ]);

}
