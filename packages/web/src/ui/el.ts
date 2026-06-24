

export function el(tag: string, props: any = {}, children: any[] = []) {

    const node = document.createElement(tag);

    // props
    for (const key in props) {

        if (key === 'class') {

            const className = normalizeClass(props.class);
            node.className = className;

        } else if (key === 'text') {

            node.textContent = props[key];

        } else {

            node.setAttribute(key, props[key]);

        }
    }

    // children
    for (const child of children) {

        if (typeof child === 'string') {

            node.appendChild(document.createTextNode(child));

        } else if (child) {

            node.appendChild(child);

        }

    }

    return node;

}

export function normalizeClass(cls?: string | string[]) {

    if (!cls) return "";
    return Array.isArray(cls) ? cls.join(" ") : cls;

}
