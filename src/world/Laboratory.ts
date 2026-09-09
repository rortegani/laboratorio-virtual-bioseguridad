import * as THREE from 'three';
import { addLaboratoryWall } from './components/LaboratoryWall';
import { addLaboratoryFloor } from './components/LaboratoryFloor';
import { addLaboratoryCeiling } from './components/LaboratoryCeiling';
import { addCeilingLight } from './components/CeilingLight';
import { LaboratoryDoor } from './components/LaboratoryDoor';
import { addGlassPanel } from './components/GlassPanel';
import { addWallSign } from './components/WallSign';
import { createLaboratoryMaterials } from './materials/LaboratoryMaterials';

type BuiltObject = { root: THREE.Group; collision?: THREE.Box3 };

const ROOM_WIDTH = 18;
const DOOR_WIDTH = 2.2;
const DOOR_HEIGHT = 2.2;
const PARTITION_HEIGHT = 3;
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
  private readonly doors: LaboratoryDoor[] = [];

  constructor() {
    this.scene.background = new THREE.Color(0x9fb7bb);

    this.build();
    this.configureShadows();
  }

  get collisions(): THREE.Box3[] { return this.walls; }

  update(deltaTime: number): void {
    this.doors.forEach((door) => door.update(deltaTime));
  }

  openEntryDoor(): void { this.openDoor(this.entryDoorRoot); }
  openWorkAreaDoor(): void { this.openDoor(this.workAreaDoorRoot); }
  openMolecularDoor(): void { this.openDoor(this.molecularDoorRoot); }
  openIncidentDoor(): void { this.openDoor(this.incidentDoorRoot); }
  isDoorOpen(root: THREE.Group): boolean { return this.doors.find((door) => door.root === root)?.isOpen() ?? false; }

  private openDoor(root: THREE.Group): void {
    const door = this.doors.find((candidate) => candidate.root === root);
    door?.openDoor();
  }

  showContamination(): void { this.sharedSurfaceRoot.traverse((child) => { if (child instanceof THREE.Mesh && child.material instanceof THREE.Material && 'color' in child.material) (child.material as THREE.MeshBasicMaterial).color.set(0xf09b62); }); }

  private createPartitionWithDoor(z: number, root: THREE.Group, collision: THREE.Box3, wallMaterial: THREE.MeshStandardMaterial, doorMaterial: THREE.MeshStandardMaterial): void {
    const materials = createLaboratoryMaterials();
    this.doors.push(new LaboratoryDoor({ scene: this.scene, collisions: this.walls, z, root, collision, roomWidth: ROOM_WIDTH, width: DOOR_WIDTH, height: DOOR_HEIGHT, partitionHeight: PARTITION_HEIGHT, wallMaterial, doorMaterial, frameMaterial: materials.frame, metalMaterial: materials.metal, identificationPlate: z === DOOR_Z }));
  }

  private build(): void {
    const materials = createLaboratoryMaterials();
    const mat = (color: number, roughness = 0.78, metalness = 0.02) => new THREE.MeshStandardMaterial({ color, roughness, metalness, toneMapped: false });
    addLaboratoryFloor(this.scene, ROOM_WIDTH, FLOOR_MIN_Z, FLOOR_MAX_Z, materials.floor);
    addLaboratoryCeiling(this.scene, ROOM_WIDTH, FLOOR_MIN_Z, FLOOR_MAX_Z, 3.15, materials.ceiling);
    const ledMaterial = mat(0xffffff, 0.6);
    [-4.5, 4.5].forEach((x) => [7, 20, 31, 42, 53].forEach((z) => addCeilingLight(this.scene, new THREE.Vector3(x, 3.06, z), materials.frame, ledMaterial)));
    const baseboardMaterial = mat(0x829b9d);
    const baseboardLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, FLOOR_MAX_Z - FLOOR_MIN_Z), baseboardMaterial);
    baseboardLeft.position.set(-8.82, 0.18, (FLOOR_MIN_Z + FLOOR_MAX_Z) / 2); this.scene.add(baseboardLeft);
    const baseboardRight = baseboardLeft.clone(); baseboardRight.position.x = 8.82; this.scene.add(baseboardRight);
    const addBox = (size: THREE.Vector3, position: THREE.Vector3, color: number, collision = true): THREE.Mesh => {
      return addLaboratoryWall(this.scene, this.walls, position, size, mat(color), collision);
    };
    addBox(new THREE.Vector3(ROOM_WIDTH, 3, 0.25), new THREE.Vector3(0, 1.5, -1), materials.wall.color.getHex());
    addBox(new THREE.Vector3(0.25, 3, FLOOR_MAX_Z - FLOOR_MIN_Z), new THREE.Vector3(-9, 1.5, (FLOOR_MIN_Z + FLOOR_MAX_Z) / 2), materials.wall.color.getHex());
    addBox(new THREE.Vector3(0.25, 3, FLOOR_MAX_Z - FLOOR_MIN_Z), new THREE.Vector3(9, 1.5, (FLOOR_MIN_Z + FLOOR_MAX_Z) / 2), materials.wall.color.getHex());
    this.createPartitionWithDoor(DOOR_Z, this.entryDoorRoot, this.entryDoorCollision, materials.wall, materials.door);
    this.createPartitionWithDoor(25, this.workAreaDoorRoot, this.workAreaDoorCollision, materials.secondaryWall, materials.door);
    this.createPartitionWithDoor(36, this.molecularDoorRoot, this.molecularDoorCollision, materials.secondaryWall, materials.door);
    this.createPartitionWithDoor(47, this.incidentDoorRoot, this.incidentDoorCollision, materials.secondaryWall, materials.door);
    addBox(new THREE.Vector3(ROOM_WIDTH, 3, 0.25), new THREE.Vector3(0, 1.5, FLOOR_MAX_Z), materials.secondaryWall.color.getHex());
    const wallAccent = mat(0xb7c8c6);
    [-8.82, 8.82].forEach((x) => { const strip = new THREE.Mesh(new THREE.BoxGeometry(0.035, 2.15, FLOOR_MAX_Z - FLOOR_MIN_Z - 0.4), wallAccent); strip.position.set(x, 1.65, (FLOOR_MIN_Z + FLOOR_MAX_Z) / 2); this.scene.add(strip); });
    [DOOR_Z, 25, 36, 47].forEach((z) => { const header = new THREE.Mesh(new THREE.BoxGeometry(ROOM_WIDTH - DOOR_WIDTH - 0.4, 0.12, 0.04), wallAccent); header.position.set(0, 2.85, z - 0.15); this.scene.add(header); });
    addGlassPanel(this.scene, new THREE.Vector3(-6.1, 1.9, 24.84), new THREE.Vector3(4.6, 1.25, 0.04), materials.glass, materials.frame);
    addGlassPanel(this.scene, new THREE.Vector3(6.1, 1.9, 47.16), new THREE.Vector3(4.6, 1.25, 0.04), materials.glass, materials.frame);
    const sign = addWallSign(this.scene, 'ÁREA DE INGRESO', new THREE.Vector3(-8.84, 2.18, 2.8), 0, 2.9, 0.76, materials.signage, materials.accent);
    addWallSign(this.scene, 'RECEPCIÓN Y VERIFICACIÓN', new THREE.Vector3(8.84, 2.18, 18.5), 0, 4.2, 0.52, materials.signage, materials.accent);
    addWallSign(this.scene, 'ÁREA DE TRABAJO', new THREE.Vector3(-8.84, 2.18, 29), 0, 3.2, 0.52, materials.signage, materials.accent);
    addWallSign(this.scene, 'DIAGNÓSTICO MOLECULAR', new THREE.Vector3(8.84, 2.18, 40), 0, 4.2, 0.52, materials.signage, materials.accent);
    addWallSign(this.scene, 'INCIDENTES Y CIERRE', new THREE.Vector3(-8.84, 2.18, 51), 0, 3.8, 0.52, materials.signage, materials.accent);
    this.addEntryWallDetails(mat);
    this.addEntryLighting();
    const prep = new THREE.Group(); prep.position.set(4, 1.1, 3); this.scene.add(prep);
    prep.add(new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.82, 0.78), mat(0x78999a)));
    const prepTop = new THREE.Mesh(new THREE.BoxGeometry(3, 0.12, 0.86), mat(0xe6f1ee, 0.55, 0.08)); prepTop.position.y = 0.47; prep.add(prepTop);
    const prepBack = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.8, 0.12), mat(0xc7d5d4)); prepBack.position.set(0, 1.35, 0.31); prep.add(prepBack);
    const prepShelf = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.1, 0.55), mat(0x829b9d)); prepShelf.position.set(0, 1.2, -0.02); prep.add(prepShelf);
    [-0.85, 0, 0.85].forEach((x) => { const item = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.28), mat(0xe6f1ee)); item.position.set(x, 0.82, -0.18); prep.add(item); });
    const prepSign = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.24, 0.035), mat(0x65c9b8)); prepSign.position.set(0, 2.02, 0.23); prep.add(prepSign);
    const sink = new THREE.Group(); sink.position.set(-4, 0.85, 7); this.scene.add(sink);
    const sinkBody = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.7, 0.8), mat(0xb7c8c6)); sinkBody.position.y = -0.35; sink.add(sinkBody);
    const sinkTop = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.12, 0.85), mat(0xe6f1ee, 0.55, 0.08)); sinkTop.position.y = 0.04; sink.add(sinkTop);
    const basin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 0.55), mat(0x829b9d)); basin.position.set(0, 0.13, -0.2); sink.add(basin);
    const basinInner = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.06, 0.4), mat(0x456f72, 0.5, 0.1)); basinInner.position.set(0, 0.225, -0.2); sink.add(basinInner);
    const tapMaterial = mat(0xe6f1ee, 0.35, 0.55);
    const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.52, 12), tapMaterial); tap.position.set(0, 0.5, 0.05); sink.add(tap);
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.38, 12), tapMaterial); spout.rotation.x = Math.PI / 2; spout.position.set(0, 0.72, -0.1); sink.add(spout);
    const backsplash = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.7, 0.08), mat(0xc7d5d4)); backsplash.position.set(0, 0.38, 0.34); sink.add(backsplash);
    const dispenser = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.18), mat(0xe6f1ee)); dispenser.position.set(-0.9, 0.35, -0.24); sink.add(dispenser);
    const hygienePanel = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.42, 0.035), mat(0x65c9b8)); hygienePanel.position.set(0.72, 0.78, 0.3); sink.add(hygienePanel);
    const receptionTable = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.25, 2.3), mat(0x829b9d)); receptionTable.position.set(3, 1.2, 18); this.scene.add(receptionTable);
    this.walls.push(new THREE.Box3(new THREE.Vector3(0.75, 0, 16.85), new THREE.Vector3(5.25, 1.325, 19.15)));
    const tableLeg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.4, 0.25), mat(0x789293)); tableLeg.position.set(1.2, 0.1, 17.2); this.scene.add(tableLeg);
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.1, 0.18), mat(0x29494f)); monitor.position.set(3.8, 2.1, 17.7); this.computerRoot.add(monitor);
    const monitorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.95, 1.35, 0.12), mat(0x456f72)); monitorFrame.position.set(3.8, 2.1, 17.78); this.computerRoot.add(monitorFrame);
    const monitorScreen = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.82, 0.025), mat(0x65c9b8)); monitorScreen.position.set(3.8, 2.1, 17.58); this.computerRoot.add(monitorScreen);
    const monitorStatus = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.035, 0.025), mat(0xe6f1ee)); monitorStatus.position.set(3.8, 1.76, 17.58); this.computerRoot.add(monitorStatus);
    const monitorStand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.7, 0.18), mat(0x899e9d)); monitorStand.position.set(3.8, 1.4, 17.7); this.computerRoot.add(monitorStand);
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.45), mat(0xa6bdbc)); keyboard.position.set(3.8, 1.34, 18.25); this.computerRoot.add(keyboard);
    const keyboardBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.58), mat(0x456f72)); keyboardBase.position.set(3.8, 1.29, 18.25); this.computerRoot.add(keyboardBase);
    const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), mat(0xe6f1ee)); mouse.scale.set(0.85, 0.45, 1.2); mouse.position.set(4.75, 1.37, 18.24); this.computerRoot.add(mouse);
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
  }

  private addEntryWallDetails(material: (color: number, roughness?: number, metalness?: number) => THREE.MeshStandardMaterial): void {
    const sanitary = material(0xb7c8c6, 0.72);
    const clinical = material(0xc7d5d4, 0.78);
    [-8.84, 8.84].forEach((x) => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.035, 1.15, 2.6), sanitary);
      panel.position.set(x, 0.78, 4.4); this.scene.add(panel);
      const profile = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.5, 0.06), material(0x829b9d, 0.5, 0.2));
      profile.position.set(x + (x < 0 ? 0.025 : -0.025), 1.45, 4.4); this.scene.add(profile);
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 5.8), clinical);
      band.position.set(x, 2.55, 4.4); this.scene.add(band);
    });
    const technicalPanel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 1.1), material(0x829b9d, 0.55, 0.12));
    technicalPanel.position.set(8.84, 1.65, 9.2); this.scene.add(technicalPanel);
  }

  private addEntryLighting(): void {
    [-4.5, 4.5].forEach((x) => {
      const light = new THREE.PointLight(0xfff8ed, 0.55, 9, 2);
      light.position.set(x, 2.75, 7); this.scene.add(light);
    });
  }

  private configureShadows(): void {
    this.scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.receiveShadow = true;
      child.geometry.computeBoundingSphere();
      const material = Array.isArray(child.material) ? child.material[0] : child.material;
      child.castShadow = !material.transparent && child.geometry.boundingSphere?.radius !== undefined && child.geometry.boundingSphere.radius > 0.35;
    });
  }

}
