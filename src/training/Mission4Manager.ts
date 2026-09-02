import { type MolecularAnswer, type MolecularScenario } from '../data/molecular';
import { TrainingState } from './TrainingState';

export type MolecularResult = { correct: true; reason: 'valid_interpretation' | 'invalid_interpretation' } | { correct: false; reason: 'mission3_incomplete' | 'area_not_reviewed' | 'analysis_not_started' | 'analysis_not_completed' | 'result_not_reviewed' } | { correct: false; reason: 'wrong_interpretation'; scenario: MolecularScenario };

export class Mission4Manager {
  constructor(private readonly state: TrainingState, private readonly scenario: MolecularScenario) {}
  canStart(): boolean { return this.state.snapshot.mission3Completed; }
  canAccessResult(): boolean { const current = this.state.snapshot; return current.mission3Completed && current.molecularAreaReviewed && current.molecularAnalysisStarted && current.molecularAnalysisCompleted; }
  reviewArea(): boolean { if (!this.canStart()) return false; this.state.update({ molecularAreaReviewed: true }); return true; }
  startAnalysis(): boolean { if (!this.canStart() || !this.state.snapshot.molecularAreaReviewed) return false; this.state.update({ molecularAnalysisStarted: true }); return true; }
  completeAnalysis(): boolean { if (!this.state.snapshot.molecularAnalysisStarted) return false; this.state.update({ molecularAnalysisCompleted: true }); return true; }
  reviewResult(): boolean { if (!this.canAccessResult()) return false; this.state.update({ molecularResultReviewed: true }); return true; }
  interpret(answer: MolecularAnswer): MolecularResult {
    const current = this.state.snapshot;
    if (!current.mission3Completed) return { correct: false, reason: 'mission3_incomplete' };
    if (!current.molecularAreaReviewed) return { correct: false, reason: 'area_not_reviewed' };
    if (!current.molecularAnalysisStarted) return { correct: false, reason: 'analysis_not_started' };
    if (!current.molecularAnalysisCompleted) return { correct: false, reason: 'analysis_not_completed' };
    if (!current.molecularResultReviewed) return { correct: false, reason: 'result_not_reviewed' };
    const correct = this.scenario === 'valid' ? answer === 'detected_target' : answer === 'invalid_no';
    if (!correct) return { correct: false, reason: 'wrong_interpretation', scenario: this.scenario };
    this.state.update(this.scenario === 'valid' ? { molecularResultInterpreted: true, mission4Completed: true } : { molecularResultInterpreted: true, molecularInvalidRecognized: true, mission4Completed: true });
    return { correct: true, reason: this.scenario === 'valid' ? 'valid_interpretation' : 'invalid_interpretation' };
  }
}
