import { TrainingState } from './TrainingState';

export type ContaminationStatus = 'clean' | 'contaminated_simulation';

export class ContaminationManager {
  private sampleStatus: ContaminationStatus = 'contaminated_simulation';
  private handStatus: ContaminationStatus = 'clean';
  private surfaceStatus: ContaminationStatus = 'clean';

  constructor(private readonly state: TrainingState) {}

  touchSample(): void { this.handStatus = this.sampleStatus; this.state.update({ virtualHandContaminated: true }); }
  applySimulatedMeasure(): void { this.handStatus = 'clean'; this.state.update({ virtualHandContaminated: false }); }
  touchSharedSurface(): boolean {
    this.surfaceStatus = this.handStatus;
    const contaminated = this.surfaceStatus === 'contaminated_simulation';
    this.state.update({ sharedSurfaceContaminated: contaminated, crossContaminationDetected: contaminated });
    return contaminated;
  }

  get status(): { sample: ContaminationStatus; hand: ContaminationStatus; surface: ContaminationStatus } { return { sample: this.sampleStatus, hand: this.handStatus, surface: this.surfaceStatus }; }
}
