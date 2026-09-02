export class TrainingState {
    state = {
        riskInfoReviewed: false,
        preparationCompleted: false,
        handHygieneCompleted: false,
        doorUnlocked: false,
        mission1Completed: false,
    };
    listeners = new Set();
    get snapshot() { return { ...this.state }; }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    update(changes) {
        this.state = { ...this.state, ...changes };
        this.listeners.forEach((listener) => listener(this.snapshot));
    }
}
