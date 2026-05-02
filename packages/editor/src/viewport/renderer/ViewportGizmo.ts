import { BufferGeometry, Camera, DoubleSide, Group, Line, LineBasicMaterial, MeshBasicMaterial, Scene, Vector3, WebGLRenderer, Mesh, CanvasTexture, SpriteMaterial, Sprite, OrthographicCamera, Material } from "@stemngine/engine";

type context = {
    mainCamera: Camera,
    renderer: WebGLRenderer,
    width: number,
    height: number
};

export type ViewportGizmoContext = context;

export class ViewportGizmo {

    private scene: Scene;
    private camera: OrthographicCamera;
    private gizmo: Group;

    private size = 100;
    private margin = 10;

    public materials: Material[] = [];

    constructor() {

        this.scene = new Scene();

        const size = 1;
        this.camera = new OrthographicCamera(-size, size, size, -size, 0.1, 10);

        // TODO: need to set camera position from the viewport scene camera / main camera
        this.camera.position.set(1, 0, 2);
        this.camera.lookAt(0, 0, 0);

        this.gizmo = this.create();
        this.scene.add(this.gizmo);

    }

    // TODO: make sure to push all materials into a repo and dispose on dispose
    private create(): Group {

        const group = new Group();

        const createAxis = (dir: Vector3, color: number) => {
            return new Line(
                new BufferGeometry().setFromPoints([
                    new Vector3(0, 0, 0),
                    dir
                ]),
                new LineBasicMaterial({ color })
            );
        };

        const createEndMarker = (
            color: string,
            options?: {
                filled?: boolean,
                light?: boolean
            }
        ) => {

            const { filled = true, light = false } = options || {};

            // TODO: check if creating canvas is costly and find cheaper way
            const canvas = document.createElement('canvas');

            const dpr = window.devicePixelRatio || 1;
            canvas.width = 128 * dpr;
            canvas.height = 128 * dpr;

            const ctx = canvas.getContext('2d')!;
            ctx.scale(dpr, dpr);

            const cx = 64;
            const cy = 64;
            const r = 40;

            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);

            if (filled) {

                // positive axis
                ctx.fillStyle = color;
                ctx.fill();

            } else {

                // negative axis ( light background)
                ctx.fillStyle = light ? `${color}22` : '#ffffff'; // translucent
                ctx.fill();

                // stroke
                ctx.strokeStyle = color;
                ctx.lineWidth = 8;
                ctx.stroke();
            }

            const texture = new CanvasTexture(canvas);
            // texture.minFilter = LinearFilter;
            // texture.magFilter = LinearFilter;
            // texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

            const sprite = new Sprite(
                new SpriteMaterial({ map: texture, transparent: true })
            );

            const scale = 1.1;
            sprite.scale.set(scale, scale, scale);

            return sprite;
        };

        const createLabel = (text: string, color: string) => {

            // TODO: check if creating canvas is costly and find cheaper way
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;

            canvas.width = 128;
            canvas.height = 128;

            ctx.fillStyle = 'black';
            ctx.font = 'bold 60px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillText(text, 64, 64);

            const texture = new CanvasTexture(canvas);

            const material = new SpriteMaterial({ map: texture, transparent: true });
            return new Sprite(material);
        }

        // axes
        const xLine = createAxis(new Vector3(1, 0, 0), 0xff0000);
        const yLine = createAxis(new Vector3(0, 1, 0), 0x00ff00);
        const zLine = createAxis(new Vector3(0, 0, 1), 0x0000ff)

        // add lines
        group.addChildren([xLine, yLine, zLine]);

        const xCap = createEndMarker('#ff0000', { filled: true });
        const yCap = createEndMarker('#00ff00', { filled: true });
        const zCap = createEndMarker('#0000ff', { filled: true });

        xCap.position.set(1, 0, 0);
        yCap.position.set(0, 1, 0);
        zCap.position.set(0, 0, 1);

        // negative caps
        // const xNegCap = createEndMarker('#ff0000', { filled: false, light: true });
        // const yNegCap = createEndMarker('#00ff00', { filled: false, light: true });
        // const zNegCap = createEndMarker('#0000ff', { filled: false, light: true });

        // xNegCap.position.set(-1, 0, 0);
        // yNegCap.position.set(0, -1, 0);
        // zNegCap.position.set(0, 0, -1);

        // add caps
        group.addChildren([xCap, yCap, zCap/* , xNegCap, yNegCap, zNegCap */]);

        // labels
        const xLabel = createLabel('X', '#ff0000');
        const yLabel = createLabel('Y', '#00ff00');
        const zLabel = createLabel('Z', '#0000ff');

        xLabel.position.set(1, 0, 0);
        yLabel.position.set(0, 1, 0);
        zLabel.position.set(0, 0, 1);

        // add labels
        group.addChildren([xLabel, yLabel, zLabel]);

        group.scale.setScalar(0.5)

        return group;

    }

    public update(context: context): void {

        const { mainCamera, renderer } = context;

        // rotate whole gizmo - match orientation
        this.gizmo.quaternion.copy(mainCamera.quaternion);

    }

    public render(context: context) {

        const { renderer, width, height } = context;

        const size = this.size;

        renderer.clearDepth();

        renderer.setViewport(
            width - size - this.margin,
            height - size - this.margin,
            size,
            size
        );

        renderer.render(this.scene, this.camera);
    }

    public dispose() {

        this.materials.forEach((mat) => mat.dispose());

    }
}
