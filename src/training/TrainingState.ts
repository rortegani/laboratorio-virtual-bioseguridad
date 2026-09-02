export type TrainingSnapshot = {
  riskInfoReviewed: boolean;
  preparationCompleted: boolean;
  handHygieneCompleted: boolean;
  doorUnlocked: boolean;
  mission1Completed: boolean;
  sampleLocated: boolean;
  sampleInspected: boolean;
  sampleVerified: boolean;
  sampleDiscrepancyReported: boolean;
  mission2Completed: boolean;
  biosafetyCabinetReviewed: boolean;
  pipetteReviewed: boolean;
  workAreaReviewed: boolean;
  virtualHandContaminated: boolean;
  sharedSurfaceContaminated: boolean;
  crossContaminationDetected: boolean;
  crossContaminationAcknowledged: boolean;
  mission3Completed: boolean;
  workSampleContacted: boolean;
  safeMeasureApplied: boolean;
  sharedSurfaceContacted: boolean;
  safeFlowCompleted: boolean;
  molecularAreaReviewed: boolean;
  molecularAnalysisStarted: boolean;
  molecularAnalysisCompleted: boolean;
  molecularResultReviewed: boolean;
  molecularResultInterpreted: boolean;
  molecularInvalidRecognized: boolean;
  mission4Completed: boolean;
  incidentDetected: boolean;
  incidentAcknowledged: boolean;
  unsafeActivityStopped: boolean;
  incidentReported: boolean;
  emergencyStationReviewed: boolean;
  wasteClassificationCompleted: boolean;
  closeoutReviewed: boolean;
  mission5Completed: boolean;
  incidentIgnored: boolean;
};

export class TrainingState {
  private state: TrainingSnapshot = {
    riskInfoReviewed: false,
    preparationCompleted: false,
    handHygieneCompleted: false,
    doorUnlocked: false,
    mission1Completed: false,
    sampleLocated: false,
    sampleInspected: false,
    sampleVerified: false,
    sampleDiscrepancyReported: false,
    mission2Completed: false,
    biosafetyCabinetReviewed: false,
    pipetteReviewed: false,
    workAreaReviewed: false,
    virtualHandContaminated: false,
    sharedSurfaceContaminated: false,
    crossContaminationDetected: false,
    crossContaminationAcknowledged: false,
    mission3Completed: false,
    workSampleContacted: false,
    safeMeasureApplied: false,
    sharedSurfaceContacted: false,
    safeFlowCompleted: false,
    molecularAreaReviewed: false,
    molecularAnalysisStarted: false,
    molecularAnalysisCompleted: false,
    molecularResultReviewed: false,
    molecularResultInterpreted: false,
    molecularInvalidRecognized: false,
    mission4Completed: false,
    incidentDetected: false,
    incidentAcknowledged: false,
    unsafeActivityStopped: false,
    incidentReported: false,
    emergencyStationReviewed: false,
    wasteClassificationCompleted: false,
    closeoutReviewed: false,
    mission5Completed: false,
    incidentIgnored: false,
  };

  private listeners = new Set<(state: TrainingSnapshot) => void>();

  get snapshot(): TrainingSnapshot { return { ...this.state }; }
  reset(): void { const current = this.state; Object.keys(current).forEach((key) => { current[key as keyof TrainingSnapshot] = false as never; }); this.listeners.forEach((listener) => listener(this.snapshot)); }

  subscribe(listener: (state: TrainingSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  update(changes: Partial<TrainingSnapshot>): void {
    this.state = { ...this.state, ...changes };
    this.listeners.forEach((listener) => listener(this.snapshot));
  }
}
