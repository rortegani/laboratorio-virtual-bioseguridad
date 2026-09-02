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
  };

  private listeners = new Set<(state: TrainingSnapshot) => void>();

  get snapshot(): TrainingSnapshot { return { ...this.state }; }

  subscribe(listener: (state: TrainingSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  update(changes: Partial<TrainingSnapshot>): void {
    this.state = { ...this.state, ...changes };
    this.listeners.forEach((listener) => listener(this.snapshot));
  }
}
