export type TrainingEvent = { id: string; type: string; timestamp: number; mission: 1 | 2 | 3 | 4 | 5; outcome: 'correct' | 'incorrect' | 'neutral'; critical: boolean; description: string };

export class EventLog {
  private startedAt = performance.now();
  private readonly entries: TrainingEvent[] = [];
  start(): void { this.startedAt = performance.now(); this.entries.length = 0; }
  record(event: Omit<TrainingEvent, 'id' | 'timestamp'>): void { this.entries.push({ ...event, id: `${event.type}-${this.entries.length + 1}`, timestamp: Math.max(0, performance.now() - this.startedAt) }); }
  get events(): TrainingEvent[] { return this.entries.map((event) => ({ ...event })); }
  reset(): void { this.start(); }
}
