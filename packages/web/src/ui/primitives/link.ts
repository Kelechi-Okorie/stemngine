import { el, normalizeClass } from "../el";

export function Link(props: {
    text: string;
    href: string;
    class?: string | string[];
}) {

    const className = ["link", normalizeClass(props.class)]
        .filter(Boolean)
        .join(" ");

    return el("a", {
        text: props.text,
        href: props.href,
        class: className,
    });

}
