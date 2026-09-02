import { TrainingState } from './TrainingState';

export class MissionManager {
  constructor(private readonly state: TrainingState) {}

  canOpenDoor(): boolean {
    const current = this.state.snapshot;
    return current.riskInfoReviewed && current.preparationCompleted && current.handHygieneCompleted;
  }

  unlockDoor(): boolean {
    if (!this.canOpenDoor()) return false;
    this.state.update({ doorUnlocked: true });
    return true;
  }

  markMissionComplete(): void {
    if (this.state.snapshot.doorUnlocked) this.state.update({ mission1Completed: true });
  }
}
