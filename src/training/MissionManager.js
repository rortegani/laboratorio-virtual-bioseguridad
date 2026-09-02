export class MissionManager {
    state;
    constructor(state) {
        this.state = state;
    }
    canOpenDoor() {
        const current = this.state.snapshot;
        return current.riskInfoReviewed && current.preparationCompleted && current.handHygieneCompleted;
    }
    unlockDoor() {
        if (!this.canOpenDoor())
            return false;
        this.state.update({ doorUnlocked: true });
        return true;
    }
    markMissionComplete() {
        if (this.state.snapshot.doorUnlocked)
            this.state.update({ mission1Completed: true });
    }
}
