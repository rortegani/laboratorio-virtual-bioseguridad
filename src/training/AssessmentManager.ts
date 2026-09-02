import { ScoreManager, type AssessmentResult } from './ScoreManager';
import type { TrainingEvent } from './EventLog';
import type { TrainingSnapshot } from './TrainingState';

export class AssessmentManager {
  private readonly scorer = new ScoreManager();
  assess(snapshot: TrainingSnapshot, events: TrainingEvent[]): AssessmentResult | null { return snapshot.mission5Completed ? this.scorer.calculate(snapshot, events) : null; }
}
