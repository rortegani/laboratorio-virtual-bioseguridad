import * as THREE from 'three';
import { addLaboratoryWall } from './LaboratoryWall';

export type LaboratoryDoorOptions = {
  scene: THREE.Scene;
  collisions: THREE.Box3[];
  z: number;
  root: THREE.Group;
  collision: THREE.Box3;
  roomWidth: number;
  width: number;
  height: number;
  partitionHeight: number;
  wallMaterial: THREE.MeshStandardMaterial;
  doorMaterial: THREE.MeshStandardMaterial;
  frameMaterial: THREE.MeshStandardMaterial;
  metalMaterial: THREE.MeshStandardMaterial;
  identificationPlate?: boolean;
};

export class LaboratoryDoor {
  readonly root: THREE.Group;
  readonly collision: THREE.Box3;
  private open = false;
  private progress = 0;

  constructor(private readonly options: LaboratoryDoorOptions) {
    this.root = options.root; this.collision = options.collision;
    this.build();
  }

  update(deltaTime: number): void {
    if (!this.open || this.progress >= 1) return;
    this.progress = Math.min(1, this.progress + deltaTime * 2.4);
    this.root.rotation.y = -this.progress * Math.PI / 2;
  }

  openDoor(): void { if (this.open) return; this.open = true; this.progress = 0; this.root.rotation.y = 0; }
  isOpen(): boolean { return this.open; }

  private build(): void {
    const { scene, collisions, z, root, collision, roomWidth, width, height, partitionHeight, wallMaterial, doorMaterial, frameMaterial, metalMaterial } = this.options;
    const sideWidth = (roomWidth - width) / 2;
    addLaboratoryWall(scene, collisions, new THREE.Vector3(-(roomWidth + width) / 4, partitionHeight / 2, z), new THREE.Vector3(sideWidth, partitionHeight, 0.25), wallMaterial);
    addLaboratoryWall(scene, collisions, new THREE.Vector3((roomWidth + width) / 4, partitionHeight / 2, z), new THREE.Vector3(sideWidth, partitionHeight, 0.25), wallMaterial);
    addLaboratoryWall(scene, collisions, new THREE.Vector3(0, height + (partitionHeight - height) / 2, z), new THREE.Vector3(width, partitionHeight - height, 0.25), wallMaterial);
    root.position.set(-width / 2, 0, z); scene.add(root);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.18), doorMaterial); panel.position.set(width / 2, height / 2, 0); root.add(panel);
    const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, height + 0.35, 0.3), frameMaterial); frameLeft.position.set(-width / 2, (height + 0.35) / 2, z); scene.add(frameLeft);
    const frameRight = frameLeft.clone(); frameRight.position.x = width / 2; scene.add(frameRight);
    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(width + 0.18, 0.18, 0.3), frameMaterial); frameTop.position.set(0, height + 0.08, z); scene.add(frameTop);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), metalMaterial); handle.position.set(width - 0.45, height / 2, -0.16); root.add(handle);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.62, 0.035), new THREE.MeshPhysicalMaterial({ color: 0x9edbd5, transparent: true, opacity: 0.32, roughness: 0.22, metalness: 0, depthWrite: false, toneMapped: false })); glass.position.set(width / 2, 2.12, -0.12); root.add(glass);
    if (this.options.identificationPlate) {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, 0.025), frameMaterial); plate.position.set(width / 2 + 0.42, 1.38, -0.105); root.add(plate);
      const inset = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.035, 0.012), new THREE.MeshStandardMaterial({ color: 0x65c9b8, roughness: 0.45, toneMapped: false })); inset.position.set(width / 2 + 0.42, 1.38, -0.122); root.add(inset);
    }
    collision.set(new THREE.Vector3(-width / 2, 0, z - 0.125), new THREE.Vector3(width / 2, height, z + 0.125)); collisions.push(collision);
  }
}
