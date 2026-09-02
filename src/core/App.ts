import { CollisionSystem } from '../player/CollisionSystem';
import { PlayerController } from '../player/PlayerController';
import { InteractiveObject } from '../interaction/InteractiveObject';
import { InteractionManager } from '../interaction/InteractionManager';
import { TrainingState } from '../training/TrainingState';
import { MissionManager } from '../training/MissionManager';
import { Mission2Manager } from '../training/Mission2Manager';
import { scenario } from '../data/scenario';
import { Laboratory } from '../world/Laboratory';
import { World } from '../world/World';
import { UIManager } from '../ui/UIManager';

export class App {
  private readonly canvas = document.createElement('canvas');
  private readonly ui: UIManager;
  private world!: World;
  private player!: PlayerController;
  private interaction!: InteractionManager;
  private readonly state = new TrainingState();
  private readonly mission = new MissionManager(this.state);
  private readonly mission2 = new Mission2Manager(this.state, scenario.sampleScenario);
  private previousTime = 0;

  constructor(private readonly container: HTMLElement | null) { if (!container) throw new Error('App container not found'); this.ui = new UIManager(container); }
  start(): void { this.ui.onStart(() => this.enterLaboratory()); }

  private enterLaboratory(): void {
    this.canvas.className = 'scene'; this.container?.prepend(this.canvas);
    this.ui.showGame();
    const laboratory = new Laboratory(); this.world = new World(this.canvas, laboratory);
    const collisionSystem = new CollisionSystem(laboratory.collisions);
    this.player = new PlayerController(this.canvas, collisionSystem);
    this.interaction = new InteractionManager(this.player.camera, (target) => this.ui.setTarget(target));
    this.registerMission1Interactions(laboratory, collisionSystem);
    this.state.subscribe((snapshot) => this.ui.setMission(snapshot));
    let mission2Registered = false;
    this.state.subscribe((snapshot) => {
      if (snapshot.mission1Completed && !mission2Registered) { mission2Registered = true; this.registerMission2Interactions(laboratory); }
    });
    window.addEventListener('resize', () => this.world.resize(this.player.camera));
    this.canvas.addEventListener('click', () => { this.ui.setPointerHint(false); this.player.focus(); });
    document.addEventListener('pointerlockchange', () => this.ui.setPointerHint(document.pointerLockElement !== this.canvas));
    window.addEventListener('keydown', (event) => { if (event.code === 'KeyE') this.interaction.interact(); });
    this.ui.setPointerHint(true); this.world.resize(this.player.camera); requestAnimationFrame((time) => this.loop(time, laboratory));
  }

  private registerMission1Interactions(laboratory: Laboratory, collisionSystem: CollisionSystem): void {
    const [sign, prep, sink] = laboratory.interactive;
    this.interaction.register(sign.root, new InteractiveObject('safety-sign', 'Información del área', 'safety', 5, () => { this.openModal(); this.ui.showSafety(() => this.state.update({ riskInfoReviewed: true })); }));
    this.interaction.register(prep.root, new InteractiveObject('preparation-station', 'Estación de preparación', 'preparation', 4, () => { this.openModal(); this.ui.showPreparation(() => this.state.update({ preparationCompleted: true })); }));
    this.interaction.register(sink.root, new InteractiveObject('hand-washing', 'Estación de higiene de manos', 'hygiene', 4, () => { this.openModal(); this.ui.showHandHygiene(() => this.state.update({ handHygieneCompleted: true })); }));
    this.interaction.register(laboratory.doorRoot, new InteractiveObject('door', 'Puerta de ingreso', 'door', 4, () => { this.openModal(); this.ui.showDoor(this.state.snapshot, () => { if (this.mission.unlockDoor()) { collisionSystem.removeObstacle(laboratory.doorCollision); laboratory.openDoor(); } }); }));
  }

  private registerMission2Interactions(laboratory: Laboratory): void {
    this.interaction.register(laboratory.sampleRoot, new InteractiveObject('sample-sim-001', 'Muestra SIM-001', 'sample', 4, () => { this.openModal(); const result = this.mission2.inspectSample(); if (result.success) this.ui.showSample(() => undefined); else this.ui.showInspectionBlocked(); }));
    this.interaction.register(laboratory.computerRoot, new InteractiveObject('reception-computer', 'Sistema de información del laboratorio', 'computer', 4, () => { this.openModal(); this.ui.showComputer(scenario.sampleScenario, (decision) => this.ui.showVerificationResult(this.mission2.verifySampleDecision(decision))); }));
  }

  private openModal(): void { this.player.release(); this.ui.setPointerHint(true); }
  private loop(time: number, laboratory: Laboratory): void { const delta = Math.min((time - this.previousTime) / 1000, 0.05); this.previousTime = time; this.player.update(delta); laboratory.update(delta); this.interaction.update(); if (!this.state.snapshot.mission1Completed && this.state.snapshot.doorUnlocked && this.player.camera.position.z > 16) { this.mission.markMissionComplete(); this.ui.showComplete(); } this.world.render(this.player.camera); requestAnimationFrame((next) => this.loop(next, laboratory)); }
}
