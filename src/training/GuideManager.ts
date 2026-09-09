import type { TrainingSnapshot } from './TrainingState';
import type { TrainingMode } from './TrainingMode';

export type GuideContext = { snapshot: TrainingSnapshot; mode: TrainingMode; workAreaDoorOpen: boolean; molecularDoorOpen: boolean; incidentDoorOpen: boolean };
export type GuideStepStatus = 'completed' | 'current' | 'pending';
export type GuideStep = { id: string; mission: 1 | 2 | 3 | 4 | 5; order: number; label: string; targetKey?: string; completed: (context: GuideContext) => boolean };
export type GuideProgressItem = { step: GuideStep; status: GuideStepStatus };

const steps: Record<1 | 2 | 3 | 4 | 5, GuideStep[]> = {
  1: [
    { id: 'safety', mission: 1, order: 1, label: 'Revisar información de seguridad', targetKey: 'sign', completed: (c) => c.snapshot.riskInfoReviewed },
    { id: 'preparation', mission: 1, order: 2, label: 'Completar preparación personal', targetKey: 'prep', completed: (c) => c.snapshot.preparationCompleted },
    { id: 'hygiene', mission: 1, order: 3, label: 'Registrar higiene de manos', targetKey: 'sink', completed: (c) => c.snapshot.handHygieneCompleted },
    { id: 'entry-door', mission: 1, order: 4, label: 'Abrir puerta de ingreso', targetKey: 'entry-door', completed: (c) => c.snapshot.doorUnlocked },
  ],
  2: [
    { id: 'sample', mission: 2, order: 1, label: 'Revisar SIM-001', targetKey: 'sample', completed: (c) => c.snapshot.sampleInspected },
    { id: 'decision', mission: 2, order: 2, label: 'Tomar decisión de recepción', targetKey: 'computer', completed: (c) => c.snapshot.sampleVerified || c.snapshot.sampleDiscrepancyReported },
    { id: 'work-door', mission: 2, order: 3, label: 'Abrir puerta del área de trabajo', targetKey: 'work-door', completed: (c) => c.workAreaDoorOpen },
  ],
  3: [
    { id: 'cabinet', mission: 3, order: 1, label: 'Reconocer Cabina de Seguridad Biológica', targetKey: 'cabinet', completed: (c) => c.snapshot.biosafetyCabinetReviewed },
    { id: 'pipette', mission: 3, order: 2, label: 'Reconocer micropipeta', targetKey: 'pipette', completed: (c) => c.snapshot.pipetteReviewed },
    { id: 'work-area', mission: 3, order: 3, label: 'Revisar organización del área', targetKey: 'work-area', completed: (c) => c.snapshot.workAreaReviewed },
    { id: 'work-sample', mission: 3, order: 4, label: 'Interactuar con SIM-001', targetKey: 'work-sample', completed: (c) => c.snapshot.workSampleContacted },
    { id: 'measure', mission: 3, order: 5, label: 'Aplicar medida simulada', targetKey: 'measure', completed: (c) => c.snapshot.safeMeasureApplied || c.snapshot.crossContaminationAcknowledged },
    { id: 'shared-surface', mission: 3, order: 6, label: 'Interactuar con teclado / superficie compartida', targetKey: 'shared-surface', completed: (c) => c.snapshot.safeFlowCompleted || c.snapshot.crossContaminationAcknowledged },
    { id: 'molecular-door', mission: 3, order: 7, label: 'Abrir puerta del área molecular', targetKey: 'molecular-door', completed: (c) => c.molecularDoorOpen },
  ],
  4: [
    { id: 'molecular-area', mission: 4, order: 1, label: 'Reconocer sistema molecular', targetKey: 'molecular-equipment', completed: (c) => c.snapshot.molecularAreaReviewed },
    { id: 'analysis-start', mission: 4, order: 2, label: 'Iniciar análisis simulado', targetKey: 'molecular-terminal', completed: (c) => c.snapshot.molecularAnalysisStarted },
    { id: 'analysis-complete', mission: 4, order: 3, label: 'Esperar finalización del análisis', targetKey: 'molecular-terminal', completed: (c) => c.snapshot.molecularAnalysisCompleted },
    { id: 'result', mission: 4, order: 4, label: 'Consultar resultado', targetKey: 'molecular-result', completed: (c) => c.snapshot.molecularResultReviewed },
    { id: 'interpret', mission: 4, order: 5, label: 'Interpretar resultado', targetKey: 'molecular-result', completed: (c) => c.snapshot.molecularResultInterpreted },
    { id: 'incident-door', mission: 4, order: 6, label: 'Abrir puerta de incidentes y cierre', targetKey: 'incident-door', completed: (c) => c.incidentDoorOpen },
  ],
  5: [
    { id: 'incident', mission: 5, order: 1, label: 'Reconocer condición anormal', targetKey: 'incident', completed: (c) => c.snapshot.incidentAcknowledged },
    { id: 'stop', mission: 5, order: 2, label: 'Detener actividad', targetKey: 'activity', completed: (c) => c.snapshot.unsafeActivityStopped },
    { id: 'report', mission: 5, order: 3, label: 'Reportar incidente', targetKey: 'report', completed: (c) => c.snapshot.incidentReported },
    { id: 'emergency', mission: 5, order: 4, label: 'Revisar estación de emergencia', targetKey: 'emergency', completed: (c) => c.snapshot.emergencyStationReviewed },
    { id: 'waste', mission: 5, order: 5, label: 'Clasificar residuos', targetKey: 'waste', completed: (c) => c.snapshot.wasteClassificationCompleted },
    { id: 'closeout', mission: 5, order: 6, label: 'Verificar cierre', targetKey: 'closeout', completed: (c) => c.snapshot.closeoutReviewed },
    { id: 'finish', mission: 5, order: 7, label: 'Finalizar capacitación', targetKey: 'closeout', completed: (c) => c.snapshot.mission5Completed },
  ],
};

export class GuideManager {
  private activeMission: 1 | 2 | 3 | 4 | 5 = 1;
  setActiveMission(mission: 1 | 2 | 3 | 4 | 5): void { this.activeMission = mission; }
  getSteps(): GuideStep[] { return steps[this.activeMission]; }
  getCurrentStep(context: GuideContext): GuideStep | undefined { return this.getSteps().find((step) => !step.completed(context)); }
  getProgress(context: GuideContext): GuideProgressItem[] { const current = this.getCurrentStep(context); return this.getSteps().map((step) => ({ step, status: step.completed(context) ? 'completed' : step.id === current?.id ? 'current' : 'pending' })); }
  getMissionTitle(): string { return ['Ingreso seguro', 'Recepción y verificación', 'Trabajo seguro', 'Diagnóstico molecular', 'Incidente y finalización'][this.activeMission - 1]; }
  getModeHint(mode: TrainingMode): string { return mode === 'guided-demo' ? 'Los indicadores numerados señalan el siguiente paso de la demostración.' : 'Complete cada objetivo según el procedimiento de la simulación.'; }
}
