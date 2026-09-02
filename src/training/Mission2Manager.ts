import { digitalCodeFor, sample, type SampleDecision, type SampleScenario } from '../data/sample';
import { TrainingState } from './TrainingState';

export type VerificationResult =
  | { correct: true; reason: 'sample_match' | 'sample_mismatch' }
  | { correct: false; reason: 'mission1_incomplete' | 'sample_not_inspected' }
  | { correct: false; reason: 'wrong_decision'; scenario: SampleScenario };
export type InspectionResult = { success: true } | { success: false; reason: 'mission1_incomplete' };

export class Mission2Manager {
  constructor(private readonly state: TrainingState, private readonly scenario: SampleScenario) {}

  inspectSample(): InspectionResult {
    if (!this.state.snapshot.mission1Completed) return { success: false, reason: 'mission1_incomplete' };
    this.state.update({ sampleLocated: true, sampleInspected: true });
    return { success: true };
  }

  verifySampleDecision(decision: SampleDecision): VerificationResult {
    const current = this.state.snapshot;
    if (!current.mission1Completed) return { correct: false, reason: 'mission1_incomplete' };
    if (!current.sampleInspected) return { correct: false, reason: 'sample_not_inspected' };
    const matches = digitalCodeFor(this.scenario) === sample.physicalCode;
    const correct = matches ? decision === 'accept' : decision === 'report_discrepancy';
    if (!correct) return { correct: false, reason: 'wrong_decision', scenario: this.scenario };
    this.state.update(matches ? { sampleVerified: true, mission2Completed: true } : { sampleDiscrepancyReported: true, mission2Completed: true });
    return { correct: true, reason: matches ? 'sample_match' : 'sample_mismatch' };
  }
}
