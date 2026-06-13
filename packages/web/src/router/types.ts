
export type RouteHandler<TParams = any> = (params: TParams) => void;

export type Route = {
    path: string;
    handler: RouteHandler;
};

export type CompiledRoute = {
    path: string;
    segments: string[];
    handler: RouteHandler;
}