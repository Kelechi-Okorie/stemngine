import { el, normalizeClass } from "../el";

export function Button(props: {
    text: string;
    href?: string;
    onClick?: () => void;
    class?: string | string[];
}): HTMLElement {

    const className = ["button", normalizeClass(props.class)]
        .filter(Boolean)
        .join(" ");


    const elNode = el("button", {
        class: className,
        text: props.text
    });

    if (props.onClick) {

        elNode.onclick = props.onClick;

    }

    if (props.href) {

        elNode.onclick = () => {

            location.hash = props.href!;

        };

    }

    return elNode;

}
