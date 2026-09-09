import type { TrainingSnapshot } from './TrainingState';
import type { TrainingMode } from './TrainingMode';

export type GuideStep = {
  id: string;
  mission: 1 | 2 | 3 | 4 | 5;
  order: number;
  label: string;
  targetKey?: string;
  completed: (snapshot: TrainingSnapshot) => boolean;
};

const steps: Record<1 | 2 | 3 | 4 | 5, GuideStep[]> = {
  1: [
    { id: 'safety', mission: 1, order: 1, label: 'Revisar información de seguridad', targetKey: 'sign', completed: (s) => s.riskInfoReviewed },
    { id: 'preparation', mission: 1, order: 2, label: 'Completar preparación personal', targetKey: 'prep', completed: (s) => s.preparationCompleted },
    { id: 'hygiene', mission: 1, order: 3, label: 'Registrar higiene de manos', targetKey: 'sink', completed: (s) => s.handHygieneCompleted },
    { id: 'entry-door', mission: 1, order: 4, label: 'Abrir puerta de ingreso', targetKey: 'entry-door', completed: (s) => s.doorUnlocked },
  ],
  2: [
    { id: 'sample', mission: 2, order: 1, label: 'Revisar SIM-001', targetKey: 'sample', completed: (s) => s.sampleInspected },
    { id: 'computer', mission: 2, order: 2, label: 'Consultar sistema de laboratorio', targetKey: 'computer', completed: (s) => s.sampleInspected },
    { id: 'decision', mission: 2, order: 3, label: 'Tomar decisión de recepción', targetKey: 'computer', completed: (s) => s.sampleVerified || s.sampleDiscrepancyReported },
    { id: 'work-door', mission: 2, order: 4, label: 'Abrir puerta del área de trabajo', targetKey: 'work-door', completed: (s) => s.mission2Completed },
  ],
  3: [
    { id: 'cabinet', mission: 3, order: 1, label: 'Reconocer Cabina de Seguridad Biológica', targetKey: 'cabinet', completed: (s) => s.biosafetyCabinetReviewed },
    { id: 'pipette', mission: 3, order: 2, label: 'Reconocer micropipeta', targetKey: 'pipette', completed: (s) => s.pipetteReviewed },
    { id: 'work-area', mission: 3, order: 3, label: 'Revisar organización del área', targetKey: 'work-area', completed: (s) => s.workAreaReviewed },
    { id: 'work-sample', mission: 3, order: 4, label: 'Interactuar con SIM-001', targetKey: 'work-sample', completed: (s) => s.workSampleContacted },
    { id: 'measure', mission: 3, order: 5, label: 'Aplicar medida simulada', targetKey: 'measure', completed: (s) => s.safeMeasureApplied },
    { id: 'shared-surface', mission: 3, order: 6, label: 'Interactuar con teclado / superficie compartida', targetKey: 'shared-surface', completed: (s) => s.safeFlowCompleted || s.crossContaminationDetected },
    { id: 'molecular-door', mission: 3, order: 7, label: 'Abrir puerta del área molecular', targetKey: 'molecular-door', completed: (s) => s.mission3Completed },
  ],
  4: [
    { id: 'molecular-area', mission: 4, order: 1, label: 'Reconocer sistema molecular', targetKey: 'molecular-equipment', completed: (s) => s.molecularAreaReviewed },
    { id: 'analysis-start', mission: 4, order: 2, label: 'Iniciar análisis simulado', targetKey: 'molecular-terminal', completed: (s) => s.molecularAnalysisStarted },
    { id: 'analysis-complete', mission: 4, order: 3, label: 'Esperar finalización del análisis', targetKey: 'molecular-terminal', completed: (s) => s.molecularAnalysisCompleted },
    { id: 'result', mission: 4, order: 4, label: 'Consultar resultado', targetKey: 'molecular-result', completed: (s) => s.molecularResultReviewed },
    { id: 'interpret', mission: 4, order: 5, label: 'Interpretar resultado', targetKey: 'molecular-result', completed: (s) => s.molecularResultInterpreted },
    { id: 'incident-door', mission: 4, order: 6, label: 'Abrir puerta de incidentes y cierre', targetKey: 'incident-door', completed: (s) => s.mission4Completed },
  ],
  5: [
    { id: 'incident', mission: 5, order: 1, label: 'Reconocer condición anormal', targetKey: 'incident', completed: (s) => s.incidentAcknowledged || s.incidentIgnored },
    { id: 'stop', mission: 5, order: 2, label: 'Detener actividad', targetKey: 'activity', completed: (s) => s.unsafeActivityStopped },
    { id: 'report', mission: 5, order: 3, label: 'Reportar incidente', targetKey: 'report', completed: (s) => s.incidentReported },
    { id: 'emergency', mission: 5, order: 4, label: 'Revisar estación de emergencia', targetKey: 'emergency', completed: (s) => s.emergencyStationReviewed },
    { id: 'waste', mission: 5, order: 5, label: 'Clasificar residuos', targetKey: 'waste', completed: (s) => s.wasteClassificationCompleted },
    { id: 'closeout', mission: 5, order: 6, label: 'Verificar cierre', targetKey: 'closeout', completed: (s) => s.closeoutReviewed },
    { id: 'finish', mission: 5, order: 7, label: 'Finalizar capacitación', targetKey: 'closeout', completed: (s) => s.mission5Completed },
  ],
};

export class GuideManager {
  private activeMission: 1 | 2 | 3 | 4 | 5 = 1;
  setActiveMission(mission: 1 | 2 | 3 | 4 | 5): void { this.activeMission = mission; }
  getSteps(): GuideStep[] { return steps[this.activeMission]; }
  getCurrentStep(snapshot: TrainingSnapshot): GuideStep | undefined { return this.getSteps().find((step) => !step.completed(snapshot)); }
  getCompletedSteps(snapshot: TrainingSnapshot): GuideStep[] { return this.getSteps().filter((step) => step.completed(snapshot)); }
  getMissionTitle(): string { return ['Ingreso seguro', 'Recepción y verificación', 'Trabajo seguro', 'Diagnóstico molecular', 'Incidente y finalización'][this.activeMission - 1]; }
  getModeHint(mode: TrainingMode): string { return mode === 'guided-demo' ? 'Los indicadores numerados señalan el siguiente paso de la demostración.' : 'Complete cada objetivo según el procedimiento de la simulación.'; }
}
