import * as THREE from 'three';

type BuiltObject = { root: THREE.Group; collision?: THREE.Box3 };

const ROOM_WIDTH = 18;
const DOOR_WIDTH = 6;
const DOOR_HEIGHT = 3;
const DOOR_Z = 15;
const FLOOR_MIN_Z = -1;
const FLOOR_MAX_Z = 21;

export class Laboratory {
  readonly scene = new THREE.Scene();
  readonly interactive: BuiltObject[] = [];
  private readonly walls: THREE.Box3[] = [];
  readonly doorRoot = new THREE.Group();
  private doorOpen = false;
  private doorProgress = 0;

  constructor() {
    this.scene.background = new THREE.Color(0x0b2028);
    this.scene.fog = new THREE.Fog(0x0b2028, 16, 34);
    this.build();
  }

  get collisions(): THREE.Box3[] { return this.walls.filter((box) => !this.doorOpen || box !== this.doorCollision); }
  readonly doorCollision = new THREE.Box3();

  update(deltaTime: number): void {
    if (!this.doorOpen || this.doorProgress >= 1) return;
    this.doorProgress = Math.min(1, this.doorProgress + deltaTime * 1.8);
    this.doorRoot.rotation.y = -this.doorProgress * Math.PI / 2;
  }

  openDoor(): void { this.doorOpen = true; }

  private build(): void {
    const mat = (color: number, roughness = 0.75) => new THREE.MeshStandardMaterial({ color, roughness });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(ROOM_WIDTH, 0.2, FLOOR_MAX_Z - FLOOR_MIN_Z + 1), mat(0x263b40));
    floor.position.set(0, -0.1, (FLOOR_MIN_Z + FLOOR_MAX_Z) / 2); this.scene.add(floor);
    const addBox = (size: THREE.Vector3, position: THREE.Vector3, color: number, collision = true): THREE.Mesh => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), mat(color));
      mesh.position.copy(position); this.scene.add(mesh);
      if (collision) this.walls.push(new THREE.Box3().setFromObject(mesh));
      return mesh;
    };
    addBox(new THREE.Vector3(ROOM_WIDTH, 3, 0.25), new THREE.Vector3(0, 1.5, -1), 0x385258);
    addBox(new THREE.Vector3(0.25, 3, 16), new THREE.Vector3(-9, 1.5, 7), 0x385258);
    addBox(new THREE.Vector3(0.25, 3, 16), new THREE.Vector3(9, 1.5, 7), 0x385258);
    const wallSideWidth = (ROOM_WIDTH - DOOR_WIDTH) / 2;
    addBox(new THREE.Vector3(wallSideWidth, DOOR_HEIGHT, 0.25), new THREE.Vector3(-(ROOM_WIDTH + DOOR_WIDTH) / 4, DOOR_HEIGHT / 2, DOOR_Z), 0x385258);
    addBox(new THREE.Vector3(wallSideWidth, DOOR_HEIGHT, 0.25), new THREE.Vector3((ROOM_WIDTH + DOOR_WIDTH) / 4, DOOR_HEIGHT / 2, DOOR_Z), 0x385258);
    addBox(new THREE.Vector3(10, 3, 0.25), new THREE.Vector3(-4, 1.5, 21), 0x31484e);
    addBox(new THREE.Vector3(10, 3, 0.25), new THREE.Vector3(4, 1.5, 21), 0x31484e);
    addBox(new THREE.Vector3(0.25, 3, 6), new THREE.Vector3(-9, 1.5, 18), 0x31484e);
    addBox(new THREE.Vector3(0.25, 3, 6), new THREE.Vector3(9, 1.5, 18), 0x31484e);
    this.doorRoot.position.set(-DOOR_WIDTH / 2, 0, DOOR_Z); this.scene.add(this.doorRoot);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(DOOR_WIDTH, DOOR_HEIGHT, 0.18), mat(0x5a8b89)); panel.position.set(DOOR_WIDTH / 2, DOOR_HEIGHT / 2, 0); this.doorRoot.add(panel);
    this.doorCollision.set(new THREE.Vector3(-DOOR_WIDTH / 2, 0, DOOR_Z - 0.125), new THREE.Vector3(DOOR_WIDTH / 2, DOOR_HEIGHT, DOOR_Z + 0.125)); this.walls.push(this.doorCollision);
    const sign = new THREE.Group(); sign.position.set(-6.5, 2.1, 1.5); this.scene.add(sign);
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.16), mat(0xc4dfdc)); signBoard.rotation.y = 0.18; sign.add(signBoard);
    const symbol = new THREE.Mesh(new THREE.CircleGeometry(0.43, 24), mat(0x183f46)); symbol.position.z = -0.1; sign.add(symbol);
    const prep = new THREE.Group(); prep.position.set(4, 1.1, 3); this.scene.add(prep);
    prep.add(new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 0.8), mat(0x617b7c)));
    for (let i = -1; i <= 1; i++) { const item = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.3), mat(0xc7d9d4)); item.position.set(i * 0.8, 1.45, -0.45); prep.add(item); }
    const sink = new THREE.Group(); sink.position.set(-4, 0.85, 7); this.scene.add(sink);
    sink.add(new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, 0.8), mat(0x80999a)));
    const basin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 0.55), mat(0xd6e5e1)); basin.position.set(0, 0.8, -0.2); sink.add(basin);
    const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.65, 12), mat(0xd6e5e1)); tap.position.set(0, 1.25, -0.3); sink.add(tap);
    this.interactive.push({ root: sign }, { root: prep }, { root: sink });
  }
}
