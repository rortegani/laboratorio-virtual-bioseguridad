import { CollisionSystem } from '../player/CollisionSystem';
import { PlayerController } from '../player/PlayerController';
import { InteractiveObject } from '../interaction/InteractiveObject';
import { InteractionManager } from '../interaction/InteractionManager';
import { TrainingState } from '../training/TrainingState';
import { MissionManager } from '../training/MissionManager';
import { Mission2Manager } from '../training/Mission2Manager';
import { Mission3Manager } from '../training/Mission3Manager';
import { ContaminationManager } from '../training/ContaminationManager';
import { Mission4Manager } from '../training/Mission4Manager';
import { molecular } from '../data/molecular';
import { Mission5Manager } from '../training/Mission5Manager';
import { type WasteItem } from '../data/incident';
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
  private readonly mission3 = new Mission3Manager(this.state);
  private readonly contamination = new ContaminationManager(this.state);
  private readonly mission4 = new Mission4Manager(this.state, scenario.molecularScenario);
  private readonly mission5 = new Mission5Manager(this.state);
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
    let mission3Registered = false;
    this.state.subscribe((snapshot) => {
      if (snapshot.mission2Completed && !mission3Registered) { mission3Registered = true; this.registerMission3Interactions(laboratory); }
    });
    let mission4Registered = false;
    this.state.subscribe((snapshot) => {
      if (snapshot.mission3Completed && !mission4Registered) { mission4Registered = true; this.registerMission4Interactions(laboratory); }
    });
    let mission5Registered = false;
    this.state.subscribe((snapshot) => {
      if (snapshot.mission4Completed && !mission5Registered) { mission5Registered = true; this.registerMission5Interactions(laboratory); }
      this.ui.setMission(snapshot);
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
    this.interaction.register(laboratory.sampleRoot, new InteractiveObject('sample-sim-001', 'Muestra SIM-001', 'sample', 4, () => { this.openModal(); this.ui.showSample(() => { const result = this.mission2.inspectSample(); if (!result.success) this.ui.showInspectionBlocked(); }); }));
    this.interaction.register(laboratory.computerRoot, new InteractiveObject('reception-computer', 'Sistema de información del laboratorio', 'computer', 4, () => { this.openModal(); this.ui.showComputer(scenario.sampleScenario, (decision) => this.ui.showVerificationResult(this.mission2.verifySampleDecision(decision))); }));
  }

  private registerMission3Interactions(laboratory: Laboratory): void {
    this.interaction.register(laboratory.cabinetRoot, new InteractiveObject('biosafety-cabinet', 'Cabina de Seguridad Biológica', 'cabinet', 4, () => { this.openModal(); this.ui.showConceptReview('CABINA DE SEGURIDAD BIOLÓGICA', 'Equipo de contención primaria que forma parte de las medidas de control determinadas mediante evaluación de riesgo. Su utilización depende del procedimiento institucional y de la evaluación de riesgo.', 'REGISTRAR RECONOCIMIENTO', () => { this.mission3.reviewCabinet(); this.checkMission3(); }); }));
    this.interaction.register(laboratory.pipetteRoot, new InteractiveObject('conceptual-pipette', 'Micropipeta', 'pipette', 4, () => { this.openModal(); this.ui.showConceptReview('MICROPIPETA', 'Instrumento utilizado para transferir pequeños volúmenes. En esta simulación solo se evalúa el reconocimiento del instrumento dentro del flujo general de trabajo.', 'RECONOCIDA', () => { this.mission3.reviewPipette(); this.checkMission3(); }); }));
    this.interaction.register(laboratory.workAreaRoot, new InteractiveObject('work-area', 'Organización del área', 'work-area', 4, () => { this.openModal(); this.ui.showConceptReview('ORGANIZACIÓN DEL FLUJO', 'Recepción → Área de trabajo → Procesamiento conceptual → Análisis. Mantener un flujo organizado ayuda a reducir errores y contaminación cruzada.', 'REVISAR ORGANIZACIÓN', () => { this.mission3.reviewWorkArea(); this.checkMission3(); }); }));
    this.interaction.register(laboratory.workSampleRoot, new InteractiveObject('work-sample', 'SIM-001 en área de trabajo', 'work-sample', 4, () => { this.openModal(); const contacted = this.contamination.touchSample(); if (contacted) this.ui.showConceptReview('TRANSFERENCIA SIMULADA', 'La mano virtual ha interactuado con SIM-001. Antes de tocar una superficie compartida, aplique la medida institucional correspondiente.', 'CONTINUAR', () => undefined); }));
    this.interaction.register(laboratory.safetyMeasureRoot, new InteractiveObject('safety-measure', 'Medida simulada', 'safety-measure', 4, () => { this.openModal(); const applied = this.contamination.applySimulatedMeasure(); if (applied) this.ui.showSafeFlow(() => undefined); else this.ui.showConceptReview('SECUENCIA INCOMPLETA', 'Interactúe primero con SIM-001 para iniciar la actividad de trabajo seguro.', 'CERRAR', () => undefined); }));
    this.interaction.register(laboratory.sharedSurfaceRoot, new InteractiveObject('shared-surface', 'Teclado / superficie compartida', 'shared-surface', 4, () => { this.openModal(); const result = this.contamination.touchSharedSurface(); if (result === 'contamination') { laboratory.showContamination(); this.ui.showContamination(() => { this.mission3.acknowledgeError(); this.checkMission3(); }); } else if (result === 'safe_flow') this.ui.showSafeFlow(() => this.checkMission3()); else this.ui.showConceptReview('SECUENCIA INCOMPLETA', 'Interactúe primero con SIM-001 y complete la medida simulada antes de tocar la superficie compartida.', 'CERRAR', () => undefined); }));
  }

  private checkMission3(): void { const result = this.mission3.complete(); if (result.success) this.ui.showMission3Result('MISIÓN 3 COMPLETADA'); }

  private registerMission5Interactions(laboratory: Laboratory): void {
    this.interaction.register(laboratory.incidentRoot, new InteractiveObject('simulated-incident', 'Condición anormal detectada', 'incident', 4, () => { this.openModal(); this.ui.showIncident((decision) => { if (this.mission5.handleIncident(decision) && decision === 'acknowledge') this.ui.showIncidentMessage('INCIDENTE RECONOCIDO', 'La condición anormal ha sido identificada. El siguiente paso es detener la actividad insegura y reportar el evento.'); else this.ui.showIncidentMessage('CONDUCTA INSEGURA REGISTRADA', 'La simulación ha registrado que se continuó o ignoró una condición anormal. Ante un incidente, debe detenerse la actividad y seguirse el procedimiento institucional correspondiente.'); }); }));
    this.interaction.register(laboratory.activityControlRoot, new InteractiveObject('activity-control', 'Control de actividad', 'activity-control', 4, () => { this.openModal(); this.ui.showConceptReview('CONTROL DE ACTIVIDAD', 'Ante una condición anormal, la simulación requiere detener la actividad antes de continuar.', 'DETENER ACTIVIDAD', () => { const result = this.mission5.stopActivity(); if (!result.success) this.ui.showMission5Blocked(result.reason === 'incident_not_acknowledged' ? 'Reconozca primero la condición anormal antes de registrar la detención de la actividad.' : 'Complete la Misión 4 antes de continuar.'); }); }));
    this.interaction.register(laboratory.reportSystemRoot, new InteractiveObject('incident-report', 'Sistema de reporte', 'incident-report', 4, () => { this.openModal(); this.ui.showReport(() => { const result = this.mission5.reportIncident(); if (result.success) this.ui.showIncidentMessage('REPORTE REGISTRADO', 'El incidente fue registrado en la simulación. Siga el procedimiento institucional correspondiente para este tipo de evento.'); else this.ui.showMission5Blocked(result.reason === 'incident_not_acknowledged' ? 'Reconozca el incidente antes de realizar el reporte.' : result.reason === 'activity_not_stopped' ? 'Detenga primero la actividad insegura antes de reportar el incidente.' : 'Complete la Misión 4 antes de continuar.'); }); }));
    this.interaction.register(laboratory.emergencyStationRoot, new InteractiveObject('emergency-station', 'Estación de emergencia', 'emergency-station', 4, () => { this.openModal(); this.ui.showEmergency(() => { this.mission5.reviewEmergencyStation(); }); }));
    this.interaction.register(laboratory.wasteRoot, new InteractiveObject('simulated-waste', 'Zona de residuos', 'waste', 4, () => { this.openModal(); this.runWasteExercise(laboratory); }));
    this.interaction.register(laboratory.closeoutRoot, new InteractiveObject('closeout', 'Verificación de cierre', 'closeout', 4, () => { this.openModal(); this.ui.showCloseout(this.state.snapshot, () => { const result = this.mission5.confirmCloseout(); if (result.success) this.ui.showFinalize(() => { const finalResult = this.mission5.complete(); if (finalResult.success) this.ui.showMission5Complete(); }); }); }));
  }

  private runWasteExercise(_laboratory: Laboratory): void { const items: Array<[WasteItem, string]> = [['general_item', 'Material no contaminado'], ['simulated_biological_item', 'Material biológico SIMULADO'], ['simulated_sharps', 'Elemento cortopunzante SIMULADO']]; let index = 0; const next = (): void => { if (index >= items.length) { this.ui.showWasteComplete(); return; } const [item, label] = items[index]; this.ui.showWasteItem(label, (category) => { const result = this.mission5.classifyWaste(item, category); if (!result.correct) this.ui.showWasteIncorrect(next); else { index += 1; next(); } }); }; next(); }

  private registerMission4Interactions(laboratory: Laboratory): void {
    this.interaction.register(laboratory.molecularEquipmentRoot, new InteractiveObject('molecular-equipment', molecular.equipment, 'molecular-equipment', 4, () => { this.openModal(); this.ui.showMolecularRecognition(() => { this.mission4.reviewArea(); }); }));
    this.interaction.register(laboratory.molecularTerminalRoot, new InteractiveObject('molecular-terminal', 'Iniciar análisis simulado', 'molecular-terminal', 4, () => { this.openModal(); this.ui.showMolecularStart(() => { if (this.mission4.startAnalysis()) { this.ui.showAnalysisProgress(() => { this.mission4.completeAnalysis(); }); } else this.ui.showMolecularBlocked(); }); }));
    this.interaction.register(laboratory.molecularResultRoot, new InteractiveObject('molecular-result', 'Resultado molecular', 'molecular-result', 4, () => { this.openModal(); if (!this.mission4.canAccessResult()) this.ui.showMolecularBlocked(); else this.ui.showMolecularResult(scenario.molecularScenario, () => { if (this.mission4.reviewResult()) this.ui.showMolecularQuestion(scenario.molecularScenario, (answer) => { const result = this.mission4.interpret(answer); this.ui.showMolecularInterpretation(result); if (result.correct) window.setTimeout(() => this.ui.showMission4Result(), 1800); }); else this.ui.showMolecularBlocked(); }); }));
  }

  private openModal(): void { this.player.release(); this.ui.setPointerHint(true); }
  private loop(time: number, laboratory: Laboratory): void { const delta = Math.min((time - this.previousTime) / 1000, 0.05); this.previousTime = time; this.player.update(delta); laboratory.update(delta); this.interaction.update(); if (!this.state.snapshot.mission1Completed && this.state.snapshot.doorUnlocked && this.player.camera.position.z > 16) { this.mission.markMissionComplete(); this.ui.showComplete(); } this.world.render(this.player.camera); requestAnimationFrame((next) => this.loop(next, laboratory)); }
}
