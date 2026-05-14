import { Group, LineBasicMaterial, Vector3, BufferGeometry, Line } from "@stemngine/engine";


export class Axes extends Group {

    constructor() {

        super();

        const material = new LineBasicMaterial({ color: 0xff0000 });

        const points = [];
        points.push(new Vector3(-10, 0, 0));
        points.push(new Vector3(10, 0, 0));

        const geometry = new BufferGeometry().setFromPoints(points);

        const line = new Line(geometry, material);
        this.add(line);


        const material2 = new LineBasicMaterial({ color: 0x0000ff });

        const points2 = [];
        points2.push(new Vector3(0, 0, -10));
        points2.push(new Vector3(0, 0, 10));

        const geometry2 = new BufferGeometry().setFromPoints(points2);

        const line2 = new Line(geometry2, material2);
        this.add(line2)

    }

}
