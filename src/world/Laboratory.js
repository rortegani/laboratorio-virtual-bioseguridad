import * as THREE from 'three';
export class Laboratory {
    scene = new THREE.Scene();
    interactive = [];
    walls = [];
    doorMesh;
    doorOpen = false;
    doorProgress = 0;
    constructor() {
        this.scene.background = new THREE.Color(0x0b2028);
        this.scene.fog = new THREE.Fog(0x0b2028, 16, 34);
        this.build();
    }
    get collisions() { return this.walls.filter((box) => !this.doorOpen || box !== this.doorCollision); }
    doorCollision = new THREE.Box3();
    update(deltaTime) {
        if (!this.doorOpen || this.doorProgress >= 1)
            return;
        this.doorProgress = Math.min(1, this.doorProgress + deltaTime * 1.8);
        this.doorMesh.rotation.y = -this.doorProgress * Math.PI / 2;
    }
    openDoor() { this.doorOpen = true; }
    build() {
        const mat = (color, roughness = 0.75) => new THREE.MeshStandardMaterial({ color, roughness });
        const floor = new THREE.Mesh(new THREE.BoxGeometry(18, 0.2, 18), mat(0x263b40));
        floor.position.y = -0.1;
        this.scene.add(floor);
        const addBox = (size, position, color, collision = true) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), mat(color));
            mesh.position.copy(position);
            this.scene.add(mesh);
            if (collision)
                this.walls.push(new THREE.Box3().setFromObject(mesh));
            return mesh;
        };
        addBox(new THREE.Vector3(18, 3, 0.25), new THREE.Vector3(0, 1.5, -1), 0x385258);
        addBox(new THREE.Vector3(0.25, 3, 16), new THREE.Vector3(-9, 1.5, 7), 0x385258);
        addBox(new THREE.Vector3(0.25, 3, 16), new THREE.Vector3(9, 1.5, 7), 0x385258);
        addBox(new THREE.Vector3(6, 3, 0.25), new THREE.Vector3(-6, 1.5, 15), 0x385258);
        addBox(new THREE.Vector3(6, 3, 0.25), new THREE.Vector3(6, 1.5, 15), 0x385258);
        addBox(new THREE.Vector3(10, 3, 0.25), new THREE.Vector3(-4, 1.5, 21), 0x31484e);
        addBox(new THREE.Vector3(10, 3, 0.25), new THREE.Vector3(4, 1.5, 21), 0x31484e);
        addBox(new THREE.Vector3(0.25, 3, 6), new THREE.Vector3(-9, 1.5, 18), 0x31484e);
        addBox(new THREE.Vector3(0.25, 3, 6), new THREE.Vector3(9, 1.5, 18), 0x31484e);
        const door = new THREE.Group();
        door.position.set(0, 1.5, 15);
        this.scene.add(door);
        this.doorMesh = door;
        const panel = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3, 0.18), mat(0x5a8b89));
        panel.position.x = 1.7;
        door.add(panel);
        this.doorCollision.set(new THREE.Vector3(-1.7, 0, 14.8), new THREE.Vector3(1.7, 3, 15.2));
        this.walls.push(this.doorCollision);
        const sign = new THREE.Group();
        sign.position.set(-6.5, 2.1, 1.5);
        this.scene.add(sign);
        const signBoard = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.16), mat(0xc4dfdc));
        signBoard.rotation.y = 0.18;
        sign.add(signBoard);
        const symbol = new THREE.Mesh(new THREE.CircleGeometry(0.43, 24), mat(0x183f46));
        symbol.position.z = -0.1;
        sign.add(symbol);
        const prep = new THREE.Group();
        prep.position.set(4, 1.1, 3);
        this.scene.add(prep);
        prep.add(new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 0.8), mat(0x617b7c)));
        for (let i = -1; i <= 1; i++) {
            const item = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.3), mat(0xc7d9d4));
            item.position.set(i * 0.8, 1.45, -0.45);
            prep.add(item);
        }
        const sink = new THREE.Group();
        sink.position.set(-4, 0.85, 7);
        this.scene.add(sink);
        sink.add(new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, 0.8), mat(0x80999a)));
        const basin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 0.55), mat(0xd6e5e1));
        basin.position.set(0, 0.8, -0.2);
        sink.add(basin);
        const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.65, 12), mat(0xd6e5e1));
        tap.position.set(0, 1.25, -0.3);
        sink.add(tap);
        this.interactive.push({ root: sign }, { root: prep }, { root: sink });
    }
}
