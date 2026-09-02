import { TrainingState } from './TrainingState';

export type Mission3Result = { success: true } | { success: false; reason: 'mission2_incomplete' | 'requirements_incomplete' | 'contamination_not_acknowledged' };

export class Mission3Manager {
  constructor(private readonly state: TrainingState) {}

  canStart(): boolean { return this.state.snapshot.mission2Completed; }
  reviewCabinet(): boolean { return this.recordIfAvailable({ biosafetyCabinetReviewed: true }); }
  reviewPipette(): boolean { return this.recordIfAvailable({ pipetteReviewed: true }); }
  reviewWorkArea(): boolean { return this.recordIfAvailable({ workAreaReviewed: true }); }
  acknowledgeError(): boolean { if (!this.canStart() || !this.state.snapshot.crossContaminationDetected) return false; this.state.update({ crossContaminationAcknowledged: true }); return true; }

  complete(): Mission3Result {
    const current = this.state.snapshot;
    if (!current.mission2Completed) return { success: false, reason: 'mission2_incomplete' };
    if (!current.biosafetyCabinetReviewed || !current.pipetteReviewed || !current.workAreaReviewed) return { success: false, reason: 'requirements_incomplete' };
    const safe = current.safeFlowCompleted;
    const errorRecognized = current.crossContaminationDetected && current.crossContaminationAcknowledged;
    if (!safe && !errorRecognized) return { success: false, reason: 'contamination_not_acknowledged' };
    this.state.update({ mission3Completed: true }); return { success: true };
  }

  private recordIfAvailable(change: { biosafetyCabinetReviewed?: boolean; pipetteReviewed?: boolean; workAreaReviewed?: boolean }): boolean { if (!this.canStart()) return false; this.state.update(change); return true; }
}
