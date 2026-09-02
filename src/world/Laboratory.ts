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

  showContamination(): void { this.sharedSurfaceRoot.traverse((child) => { if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) child.material.color.set(0xf09b62); }); }

  private build(): void {
    const mat = (color: number, roughness = 0.75) => {
      const baseColor = new THREE.Color(color);
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness,
        metalness: 0,
        emissive: baseColor.clone(),
        emissiveIntensity: 0.22,
      });
    };
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
    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(DOOR_WIDTH, DOOR_HEIGHT, 0.18), mat(0x5a8b89)); doorPanel.position.set(DOOR_WIDTH / 2, DOOR_HEIGHT / 2, 0); this.doorRoot.add(doorPanel);
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
    const receptionTable = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.25, 2.3), mat(0x5c7778)); receptionTable.position.set(3, 1.2, 18); this.scene.add(receptionTable);
    this.walls.push(new THREE.Box3(new THREE.Vector3(0.75, 0, 16.85), new THREE.Vector3(5.25, 1.325, 19.15)));
    const tableLeg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.4, 0.25), mat(0x425e61)); tableLeg.position.set(1.2, 0.1, 17.2); this.scene.add(tableLeg);
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.1, 0.18), mat(0x1c343a)); monitor.position.set(3.8, 2.1, 17.7); this.computerRoot.add(monitor);
    const monitorStand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.7, 0.18), mat(0x899e9d)); monitorStand.position.set(3.8, 1.4, 17.7); this.computerRoot.add(monitorStand);
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.45), mat(0xa6bdbc)); keyboard.position.set(3.8, 1.34, 18.25); this.computerRoot.add(keyboard);
    this.scene.add(this.computerRoot);
    this.sampleRoot.position.set(1.8, 1.55, 18); this.scene.add(this.sampleRoot);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.15, 16), mat(0x70c5bd, 0.35)); tube.rotation.z = Math.PI / 2; this.sampleRoot.add(tube);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.25, 16), mat(0xe1b678)); cap.rotation.z = Math.PI / 2; cap.position.x = 0.68; this.sampleRoot.add(cap);
    const labelCanvas = document.createElement('canvas'); labelCanvas.width = 256; labelCanvas.height = 64;
    const context = labelCanvas.getContext('2d'); if (context) { context.fillStyle = '#f2f7f4'; context.fillRect(0, 0, 256, 64); context.fillStyle = '#12343a'; context.font = 'bold 30px sans-serif'; context.fillText('SIM-001', 58, 40); }
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(labelCanvas) })); label.scale.set(1.4, 0.35, 1); label.position.set(0, 0.35, 0); this.sampleRoot.add(label);
    this.interactive.push({ root: sign }, { root: prep }, { root: sink }, { root: this.sampleRoot }, { root: this.computerRoot });
    const workMaterial = mat(0x526d70);
    this.cabinetRoot.position.set(-5, 1.5, 18.5); this.scene.add(this.cabinetRoot);
    this.cabinetRoot.add(new THREE.Mesh(new THREE.BoxGeometry(3.2, 3, 1.1), workMaterial));
    const cabinetOpening = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.4, 0.08), mat(0x172f35)); cabinetOpening.position.set(0, 0.2, -0.58); this.cabinetRoot.add(cabinetOpening);
    this.walls.push(new THREE.Box3(new THREE.Vector3(-6.6, 0, 17.9), new THREE.Vector3(-3.4, 3, 19.1)));
    this.workAreaRoot.position.set(0, 1, 19.4); this.scene.add(this.workAreaRoot);
    this.workAreaRoot.add(new THREE.Mesh(new THREE.BoxGeometry(4.5, 2, 1.2), workMaterial));
    this.walls.push(new THREE.Box3(new THREE.Vector3(-2.25, 0, 18.8), new THREE.Vector3(2.25, 2, 20)));
    this.pipetteRoot.position.set(-0.8, 2.2, 18.75); this.scene.add(this.pipetteRoot);
    const pipetteBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.5, 0.35), mat(0xd4e5df)); pipetteBody.rotation.z = -0.2; this.pipetteRoot.add(pipetteBody);
    const pipetteTip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.65, 12), mat(0x65c9b8)); pipetteTip.position.y = -0.95; this.pipetteRoot.add(pipetteTip);
    this.workSampleRoot.position.set(0.6, 2.25, 18.8); this.scene.add(this.workSampleRoot);
    const workTube = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.1, 16), mat(0x67c7bd, 0.35)); workTube.rotation.z = Math.PI / 2; this.workSampleRoot.add(workTube);
    this.sharedSurfaceRoot.position.set(1.35, 2.05, 18.75); this.scene.add(this.sharedSurfaceRoot);
    this.sharedSurfaceRoot.add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.55), mat(0x253d43)));
    this.virtualHandRoot.position.set(0.1, 2.15, 19.15); this.scene.add(this.virtualHandRoot);
    this.virtualHandRoot.add(new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 10), mat(0x8dc9be)));
    const molecularTable = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.25, 2.1), mat(0x526d70)); molecularTable.position.set(6.7, 1.2, 19.3); this.scene.add(molecularTable);
    this.walls.push(new THREE.Box3(new THREE.Vector3(5, 0, 18.25), new THREE.Vector3(8.4, 1.325, 20.35)));
    this.molecularEquipmentRoot.position.set(6.1, 1.45, 18.85); this.scene.add(this.molecularEquipmentRoot);
    this.molecularEquipmentRoot.add(new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.1, 1.1), mat(0x4f8582)));
    const equipmentLight = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.08), mat(0x65c9b8, 0.35)); equipmentLight.position.set(0, 0.65, -0.58); this.molecularEquipmentRoot.add(equipmentLight);
    this.molecularTerminalRoot.position.set(7.35, 2.15, 18.75); this.scene.add(this.molecularTerminalRoot);
    this.molecularTerminalRoot.add(new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.9, 0.12), mat(0x1c343a)));
    this.molecularResultRoot.position.set(4.8, 1.9, 19.75); this.scene.add(this.molecularResultRoot);
    this.molecularResultRoot.add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.14), mat(0x315f62)));
    const addPanel = (root: THREE.Group, position: THREE.Vector3, color: number): void => { root.position.copy(position); this.scene.add(root); root.add(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.6, 0.2), mat(color))); };
    addPanel(this.incidentRoot, new THREE.Vector3(-7, 1.1, 19.6), 0xb7775f);
    addPanel(this.activityControlRoot, new THREE.Vector3(-7, 1.1, 17.1), 0x5e8e89);
    addPanel(this.reportSystemRoot, new THREE.Vector3(7, 1.1, 17.1), 0x5e8e89);
    addPanel(this.emergencyStationRoot, new THREE.Vector3(7, 1.1, 20), 0x7e9b83);
    addPanel(this.wasteRoot, new THREE.Vector3(-3.5, 1.1, 20), 0x718287);
    addPanel(this.closeoutRoot, new THREE.Vector3(3.5, 1.1, 20), 0x708b91);
    this.safetyMeasureRoot.position.set(3, 1.5, 19.8); this.scene.add(this.safetyMeasureRoot);
    this.safetyMeasureRoot.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.3, 0.18), mat(0x6d9c98)));
    this.interactive.push({ root: this.cabinetRoot }, { root: this.pipetteRoot }, { root: this.workAreaRoot }, { root: this.workSampleRoot }, { root: this.safetyMeasureRoot }, { root: this.sharedSurfaceRoot });
  }
}
