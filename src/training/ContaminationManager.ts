import { TrainingState } from './TrainingState';

export type ContaminationStatus = 'clean' | 'contaminated_simulation';
export type SurfaceContactResult = 'contamination' | 'safe_flow' | 'not_ready';

export class ContaminationManager {
  private sampleStatus: ContaminationStatus = 'contaminated_simulation';
  private handStatus: ContaminationStatus = 'clean';
  private surfaceStatus: ContaminationStatus = 'clean';

  constructor(private readonly state: TrainingState) {}

  touchSample(): boolean { if (!this.state.snapshot.mission2Completed) return false; this.handStatus = this.sampleStatus; this.state.update({ workSampleContacted: true, virtualHandContaminated: true }); return true; }
  applySimulatedMeasure(): boolean { if (!this.state.snapshot.mission2Completed || !this.state.snapshot.workSampleContacted) return false; this.handStatus = 'clean'; this.state.update({ safeMeasureApplied: true, virtualHandContaminated: false }); return true; }
  touchSharedSurface(): SurfaceContactResult {
    const current = this.state.snapshot;
    if (!current.mission2Completed || !current.workSampleContacted) return 'not_ready';
    this.state.update({ sharedSurfaceContacted: true });
    if (this.handStatus === 'contaminated_simulation') {
      this.surfaceStatus = 'contaminated_simulation';
      this.state.update({ sharedSurfaceContaminated: true, crossContaminationDetected: true });
      return 'contamination';
    }
    if (current.safeMeasureApplied && !current.crossContaminationDetected) { this.state.update({ safeFlowCompleted: true }); return 'safe_flow'; }
    return 'not_ready';
  }

  get status(): { sample: ContaminationStatus; hand: ContaminationStatus; surface: ContaminationStatus } { return { sample: this.sampleStatus, hand: this.handStatus, surface: this.surfaceStatus }; }
}
