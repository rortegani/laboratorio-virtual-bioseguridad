import * as THREE from 'three';
import { AssetManager } from './assets/AssetManager';
import { assets } from './assets/AssetCatalog';

type BuiltObject = { root: THREE.Group; collision?: THREE.Box3 };
type AnimatedDoor = { root: THREE.Group; collision: THREE.Box3; open: boolean; progress: number };

const ROOM_WIDTH = 18;
const DOOR_WIDTH = 6;
const DOOR_HEIGHT = 3;
const DOOR_Z = 15;
const FLOOR_MIN_Z = -1;
const FLOOR_MAX_Z = 60;

export class Laboratory {
  readonly scene = new THREE.Scene();
  readonly interactive: BuiltObject[] = [];
  private readonly walls: THREE.Box3[] = [];
  readonly entryDoorRoot = new THREE.Group();
  readonly workAreaDoorRoot = new THREE.Group();
  readonly molecularDoorRoot = new THREE.Group();
  readonly incidentDoorRoot = new THREE.Group();
  readonly sampleRoot = new THREE.Group();
  readonly computerRoot = new THREE.Group();
  readonly cabinetRoot = new THREE.Group();
  readonly pipetteRoot = new THREE.Group();
  readonly workAreaRoot = new THREE.Group();
  readonly workSampleRoot = new THREE.Group();
  readonly sharedSurfaceRoot = new THREE.Group();
  readonly safetyMeasureRoot = new THREE.Group();
  readonly virtualHandRoot = new THREE.Group();
  readonly molecularEquipmentRoot = new THREE.Group();
  readonly molecularTerminalRoot = new THREE.Group();
  readonly molecularResultRoot = new THREE.Group();
  readonly incidentRoot = new THREE.Group();
  readonly activityControlRoot = new THREE.Group();
  readonly reportSystemRoot = new THREE.Group();
  readonly emergencyStationRoot = new THREE.Group();
  readonly wasteRoot = new THREE.Group();
  readonly closeoutRoot = new THREE.Group();
  readonly entryDoorCollision = new THREE.Box3();
  readonly workAreaDoorCollision = new THREE.Box3();
  readonly molecularDoorCollision = new THREE.Box3();
  readonly incidentDoorCollision = new THREE.Box3();
  private readonly doors: AnimatedDoor[] = [];
  private readonly assetManager = new AssetManager();

  constructor() {
    this.scene.background = new THREE.Color(0x9fb7bb);

    this.build();
  }

  get collisions(): THREE.Box3[] { return this.walls; }

  update(deltaTime: number): void {
    this.doors.forEach((door) => {
      if (!door.open || door.progress >= 1) return;
      door.progress = Math.min(1, door.progress + deltaTime * 2.4);
      door.root.rotation.y = -door.progress * Math.PI / 2;
    });
  }

  openEntryDoor(): void { this.openDoor(this.entryDoorRoot); }
  openWorkAreaDoor(): void { this.openDoor(this.workAreaDoorRoot); }
  openMolecularDoor(): void { this.openDoor(this.molecularDoorRoot); }
  openIncidentDoor(): void { this.openDoor(this.incidentDoorRoot); }
  isDoorOpen(root: THREE.Group): boolean { return this.doors.find((door) => door.root === root)?.open ?? false; }

  private openDoor(root: THREE.Group): void {
    const door = this.doors.find((candidate) => candidate.root === root);
    if (!door || door.open) return;
    door.open = true;
    door.progress = 0;
    door.root.rotation.y = 0;
  }

  showContamination(): void { this.sharedSurfaceRoot.traverse((child) => { if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) child.material.color.set(0xf09b62); }); }

  private createPartitionWithDoor(z: number, root: THREE.Group, collision: THREE.Box3, wallMaterial: THREE.MeshBasicMaterial, doorMaterial: THREE.MeshBasicMaterial): void {
    const wallSideWidth = (ROOM_WIDTH - DOOR_WIDTH) / 2;
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallSideWidth, DOOR_HEIGHT, 0.25), wallMaterial);
    leftWall.position.set(-(ROOM_WIDTH + DOOR_WIDTH) / 4, DOOR_HEIGHT / 2, z); this.scene.add(leftWall); this.walls.push(new THREE.Box3().setFromObject(leftWall));
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallSideWidth, DOOR_HEIGHT, 0.25), wallMaterial);
    rightWall.position.set((ROOM_WIDTH + DOOR_WIDTH) / 4, DOOR_HEIGHT / 2, z); this.scene.add(rightWall); this.walls.push(new THREE.Box3().setFromObject(rightWall));
    root.position.set(-DOOR_WIDTH / 2, 0, z); this.scene.add(root);
    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(DOOR_WIDTH, DOOR_HEIGHT, 0.18), doorMaterial);
    doorPanel.position.set(DOOR_WIDTH / 2, DOOR_HEIGHT / 2, 0); root.add(doorPanel);
    const frameMaterial = new THREE.MeshBasicMaterial({ color: 0x456f72, toneMapped: false });
    const frameSide = new THREE.Mesh(new THREE.BoxGeometry(0.18, DOOR_HEIGHT + 0.35, 0.3), frameMaterial);
    frameSide.position.set(-DOOR_WIDTH / 2, (DOOR_HEIGHT + 0.35) / 2, z); this.scene.add(frameSide);
    const frameSideRight = frameSide.clone();
    frameSideRight.position.x = DOOR_WIDTH / 2; this.scene.add(frameSideRight);
    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(DOOR_WIDTH + 0.18, 0.18, 0.3), frameMaterial);
    frameTop.position.set(0, DOOR_HEIGHT + 0.08, z); this.scene.add(frameTop);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), new THREE.MeshBasicMaterial({ color: 0xe6f1ee, toneMapped: false }));
    handle.position.set(DOOR_WIDTH - 0.45, DOOR_HEIGHT / 2, -0.16); root.add(handle);
    collision.set(new THREE.Vector3(-DOOR_WIDTH / 2, 0, z - 0.125), new THREE.Vector3(DOOR_WIDTH / 2, DOOR_HEIGHT, z + 0.125));
    this.walls.push(collision);
    this.doors.push({ root, collision, open: false, progress: 0 });
  }

  private build(): void {
    const mat = (color: number) => new THREE.MeshBasicMaterial({ color, toneMapped: false });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(ROOM_WIDTH, 0.2, FLOOR_MAX_Z - FLOOR_MIN_Z + 1), mat(0x9aa9ab));
    floor.position.set(0, -0.1, (FLOOR_MIN_Z + FLOOR_MAX_Z) / 2); this.scene.add(floor);
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(ROOM_WIDTH, 0.16, FLOOR_MAX_Z - FLOOR_MIN_Z + 1), mat(0xe6f1ee));
    ceiling.position.set(0, 3.15, (FLOOR_MIN_Z + FLOOR_MAX_Z) / 2); this.scene.add(ceiling);
    const baseboardMaterial = mat(0x829b9d);
    const baseboardLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, FLOOR_MAX_Z - FLOOR_MIN_Z), baseboardMaterial);
    baseboardLeft.position.set(-8.82, 0.18, (FLOOR_MIN_Z + FLOOR_MAX_Z) / 2); this.scene.add(baseboardLeft);
    const baseboardRight = baseboardLeft.clone(); baseboardRight.position.x = 8.82; this.scene.add(baseboardRight);
    const addBox = (size: THREE.Vector3, position: THREE.Vector3, color: number, collision = true): THREE.Mesh => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), mat(color));
      mesh.position.copy(position); this.scene.add(mesh);
      if (collision) this.walls.push(new THREE.Box3().setFromObject(mesh));
      return mesh;
    };
    addBox(new THREE.Vector3(ROOM_WIDTH, 3, 0.25), new THREE.Vector3(0, 1.5, -1), 0xd7e1df);
    addBox(new THREE.Vector3(0.25, 3, FLOOR_MAX_Z - FLOOR_MIN_Z), new THREE.Vector3(-9, 1.5, (FLOOR_MIN_Z + FLOOR_MAX_Z) / 2), 0xd7e1df);
    addBox(new THREE.Vector3(0.25, 3, FLOOR_MAX_Z - FLOOR_MIN_Z), new THREE.Vector3(9, 1.5, (FLOOR_MIN_Z + FLOOR_MAX_Z) / 2), 0xd7e1df);
    this.createPartitionWithDoor(DOOR_Z, this.entryDoorRoot, this.entryDoorCollision, mat(0xd7e1df), mat(0x5f9690));
    this.createPartitionWithDoor(25, this.workAreaDoorRoot, this.workAreaDoorCollision, mat(0xc7d5d4), mat(0x5f9690));
    this.createPartitionWithDoor(36, this.molecularDoorRoot, this.molecularDoorCollision, mat(0xc7d5d4), mat(0x5f9690));
    this.createPartitionWithDoor(47, this.incidentDoorRoot, this.incidentDoorCollision, mat(0xc7d5d4), mat(0x5f9690));
    addBox(new THREE.Vector3(ROOM_WIDTH, 3, 0.25), new THREE.Vector3(0, 1.5, FLOOR_MAX_Z), 0xc7d5d4);
    this.addAreaLabel('ÁREA DE INGRESO', new THREE.Vector3(-5.5, 2.7, 2));
    this.addAreaLabel('RECEPCIÓN Y VERIFICACIÓN', new THREE.Vector3(4.5, 2.7, 18.5));
    this.addAreaLabel('ÁREA DE TRABAJO', new THREE.Vector3(-4.5, 2.7, 29));
    this.addAreaLabel('DIAGNÓSTICO MOLECULAR', new THREE.Vector3(4.5, 2.7, 40));
    this.addAreaLabel('INCIDENTES Y CIERRE', new THREE.Vector3(-4.5, 2.7, 51));
    const sign = new THREE.Group(); sign.position.set(-6.5, 2.1, 1.5); this.scene.add(sign);
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.16), mat(0xe6f1ee)); signBoard.rotation.y = 0.18; sign.add(signBoard);
    const symbol = new THREE.Mesh(new THREE.CircleGeometry(0.43, 24), mat(0x29494f)); symbol.position.z = -0.1; sign.add(symbol);
    const prep = new THREE.Group(); prep.position.set(4, 1.1, 3); this.scene.add(prep);
    prep.add(new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 0.8), mat(0x78999a)));
    for (let i = -1; i <= 1; i++) { const item = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.3), mat(0xe6f1ee)); item.position.set(i * 0.8, 1.45, -0.45); prep.add(item); }
    const sink = new THREE.Group(); sink.position.set(-4, 0.85, 7); this.scene.add(sink);
    sink.add(new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, 0.8), mat(0xb7c8c6)));
    const basin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 0.55), mat(0xe6f1ee)); basin.position.set(0, 0.8, -0.2); sink.add(basin);
    const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.65, 12), mat(0xe6f1ee)); tap.position.set(0, 1.25, -0.3); sink.add(tap);
    const receptionTable = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.25, 2.3), mat(0x829b9d)); receptionTable.position.set(3, 1.2, 18); this.scene.add(receptionTable);
    this.walls.push(new THREE.Box3(new THREE.Vector3(0.75, 0, 16.85), new THREE.Vector3(5.25, 1.325, 19.15)));
    const tableLeg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.4, 0.25), mat(0x789293)); tableLeg.position.set(1.2, 0.1, 17.2); this.scene.add(tableLeg);
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.1, 0.18), mat(0x29494f)); monitor.position.set(3.8, 2.1, 17.7); this.computerRoot.add(monitor);
    const monitorStand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.7, 0.18), mat(0x899e9d)); monitorStand.position.set(3.8, 1.4, 17.7); this.computerRoot.add(monitorStand);
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.45), mat(0xa6bdbc)); keyboard.position.set(3.8, 1.34, 18.25); this.computerRoot.add(keyboard);
    this.scene.add(this.computerRoot);
    this.sampleRoot.position.set(1.8, 1.55, 18); this.scene.add(this.sampleRoot);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.15, 16), mat(0x70c5bd)); tube.rotation.z = Math.PI / 2; this.sampleRoot.add(tube);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.25, 16), mat(0xe1b678)); cap.rotation.z = Math.PI / 2; cap.position.x = 0.68; this.sampleRoot.add(cap);
    const labelCanvas = document.createElement('canvas'); labelCanvas.width = 256; labelCanvas.height = 64;
    const context = labelCanvas.getContext('2d'); if (context) { context.fillStyle = '#f2f7f4'; context.fillRect(0, 0, 256, 64); context.fillStyle = '#12343a'; context.font = 'bold 30px sans-serif'; context.fillText('SIM-001', 58, 40); }
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(labelCanvas) })); label.scale.set(1.4, 0.35, 1); label.position.set(0, 0.35, 0); this.sampleRoot.add(label);
    this.interactive.push({ root: sign }, { root: prep }, { root: sink }, { root: this.sampleRoot }, { root: this.computerRoot });
    const workMaterial = mat(0x789293);
    this.cabinetRoot.position.set(-5, 1.5, 30.5); this.scene.add(this.cabinetRoot);
    this.cabinetRoot.add(new THREE.Mesh(new THREE.BoxGeometry(3.2, 3, 1.1), workMaterial));
    const cabinetOpening = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.4, 0.08), mat(0x29494f)); cabinetOpening.position.set(0, 0.2, -0.58); this.cabinetRoot.add(cabinetOpening);
    this.walls.push(new THREE.Box3(new THREE.Vector3(-6.6, 0, 29.9), new THREE.Vector3(-3.4, 3, 31.1)));
    this.workAreaRoot.position.set(0, 1, 32.4); this.scene.add(this.workAreaRoot);
    this.workAreaRoot.add(new THREE.Mesh(new THREE.BoxGeometry(4.5, 2, 1.2), workMaterial));
    this.walls.push(new THREE.Box3(new THREE.Vector3(-2.25, 0, 31.8), new THREE.Vector3(2.25, 2, 33)));
    this.pipetteRoot.position.set(-0.8, 2.2, 31.75); this.scene.add(this.pipetteRoot);
    const pipetteBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.5, 0.35), mat(0xd4e5df)); pipetteBody.rotation.z = -0.2; this.pipetteRoot.add(pipetteBody);
    const pipetteTip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.65, 12), mat(0x65c9b8)); pipetteTip.position.y = -0.95; this.pipetteRoot.add(pipetteTip);
    this.workSampleRoot.position.set(0.6, 2.25, 31.8); this.scene.add(this.workSampleRoot);
    const workTube = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.1, 16), mat(0x67c7bd)); workTube.rotation.z = Math.PI / 2; this.workSampleRoot.add(workTube);
    this.sharedSurfaceRoot.position.set(1.35, 2.05, 31.75); this.scene.add(this.sharedSurfaceRoot);
    this.sharedSurfaceRoot.add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.55), mat(0x29494f)));
    this.virtualHandRoot.position.set(0.1, 2.15, 32.15); this.scene.add(this.virtualHandRoot);
    this.virtualHandRoot.add(new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 10), mat(0x8dc9be)));
    const molecularTable = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.25, 2.1), mat(0x789293)); molecularTable.position.set(6.7, 1.2, 42.3); this.scene.add(molecularTable);
    this.walls.push(new THREE.Box3(new THREE.Vector3(5, 0, 41.25), new THREE.Vector3(8.4, 1.325, 43.35)));
    this.molecularEquipmentRoot.position.set(6.1, 1.45, 41.85); this.scene.add(this.molecularEquipmentRoot);
    this.molecularEquipmentRoot.add(new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.1, 1.1), mat(0x789293)));
    const equipmentLight = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.08), mat(0x65c9b8)); equipmentLight.position.set(0, 0.65, -0.58); this.molecularEquipmentRoot.add(equipmentLight);
    this.molecularTerminalRoot.position.set(7.35, 2.15, 41.75); this.scene.add(this.molecularTerminalRoot);
    this.molecularTerminalRoot.add(new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.9, 0.12), mat(0x29494f)));
    this.molecularResultRoot.position.set(4.8, 1.9, 42.75); this.scene.add(this.molecularResultRoot);
    this.molecularResultRoot.add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.14), mat(0x315f62)));
    const addPanel = (root: THREE.Group, position: THREE.Vector3, color: number): void => { root.position.copy(position); this.scene.add(root); root.add(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.6, 0.2), mat(color))); };
    addPanel(this.incidentRoot, new THREE.Vector3(-7, 1.1, 52.6), 0xc98265);
    addPanel(this.activityControlRoot, new THREE.Vector3(-7, 1.1, 50.1), 0x789293);
    addPanel(this.reportSystemRoot, new THREE.Vector3(7, 1.1, 50.1), 0x789293);
    addPanel(this.emergencyStationRoot, new THREE.Vector3(7, 1.1, 53), 0x789293);
    addPanel(this.wasteRoot, new THREE.Vector3(-3.5, 1.1, 53), 0x789293);
    addPanel(this.closeoutRoot, new THREE.Vector3(3.5, 1.1, 53), 0x789293);
    this.safetyMeasureRoot.position.set(3, 1.5, 32.8); this.scene.add(this.safetyMeasureRoot);
    this.safetyMeasureRoot.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.3, 0.18), mat(0x65c9b8)));
    this.interactive.push({ root: this.cabinetRoot }, { root: this.pipetteRoot }, { root: this.workAreaRoot }, { root: this.workSampleRoot }, { root: this.safetyMeasureRoot }, { root: this.sharedSurfaceRoot });
    void this.assetManager.attachOptionalModel({
      path: assets.laboratoryCabinet.path,
      root: this.scene,
      position: [-7.5, 0, 20.2],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });
  }

  private addAreaLabel(text: string, position: THREE.Vector3): void {
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 96;
    const context = canvas.getContext('2d');
    if (context) { context.fillStyle = '#29494f'; context.fillRect(0, 0, canvas.width, canvas.height); context.strokeStyle = '#65c9b8'; context.lineWidth = 4; context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4); context.fillStyle = '#e6f1ee'; context.font = 'bold 30px sans-serif'; context.textAlign = 'center'; context.fillText(text, canvas.width / 2, 59); }
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthTest: true, toneMapped: false }));
    label.position.copy(position); label.scale.set(4.2, 0.52, 1); label.renderOrder = 10; this.scene.add(label);
  }
}
