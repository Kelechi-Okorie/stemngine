
// supports
// /home
// /run/:id

export function matchRoute(
    routePath: string,
    urlPath: string
): Record<string, string> | null {

    const routeParts = routePath.split("/").filter(Boolean);
    const urlParts = urlPath.split("/").filter(Boolean);

    // prevent invalid partial matches
    if (routeParts.length !== urlParts.length) return null;

    const params: Record<string, string> = {};

    for (let i = 0; i < routeParts.length; i++) {

        const r = routeParts[i];
        const u = urlParts[i];

        if (r.startsWith(":")) {

            params[r.slice(1)] = u;

        } else if (r !== u) {

            return null;
        }

    }

    return params;
}
