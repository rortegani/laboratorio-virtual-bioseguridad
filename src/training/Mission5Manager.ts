import { incident, wasteCategories, type IncidentDecision, type WasteCategory, type WasteItem } from '../data/incident';
import { TrainingState } from './TrainingState';

export type WasteResult = { correct: true } | { correct: false; reason: 'mission4_incomplete' | 'wrong_category' };
export type CloseoutResult = { success: true } | { success: false; reason: 'requirements_incomplete' | 'mission4_incomplete' };
export type Mission5ActionResult = { success: true } | { success: false; reason: 'mission4_incomplete' | 'incident_not_acknowledged' | 'activity_not_stopped' };

export class Mission5Manager {
  private readonly classified = new Set<WasteItem>();
  constructor(private readonly state: TrainingState) {}
  canStart(): boolean { return this.state.snapshot.mission4Completed; }
  handleIncident(decision: IncidentDecision): boolean { if (!this.canStart()) return false; if (decision === 'acknowledge') this.state.update({ incidentDetected: true, incidentAcknowledged: true }); else this.state.update({ incidentIgnored: true }); return true; }
  stopActivity(): Mission5ActionResult { if (!this.canStart()) return { success: false, reason: 'mission4_incomplete' }; if (!this.state.snapshot.incidentAcknowledged) return { success: false, reason: 'incident_not_acknowledged' }; this.state.update({ unsafeActivityStopped: true }); return { success: true }; }
  reportIncident(): Mission5ActionResult { const current = this.state.snapshot; if (!this.canStart()) return { success: false, reason: 'mission4_incomplete' }; if (!current.incidentAcknowledged) return { success: false, reason: 'incident_not_acknowledged' }; if (!current.unsafeActivityStopped) return { success: false, reason: 'activity_not_stopped' }; this.state.update({ incidentReported: true }); return { success: true }; }
  reviewEmergencyStation(): boolean { if (!this.canStart()) return false; this.state.update({ emergencyStationReviewed: true }); return true; }
  classifyWaste(item: WasteItem, category: WasteCategory): WasteResult { if (!this.canStart()) return { correct: false, reason: 'mission4_incomplete' }; if (wasteCategories[item] !== category) return { correct: false, reason: 'wrong_category' }; this.classified.add(item); if (this.classified.size === 3) this.state.update({ wasteClassificationCompleted: true }); return { correct: true }; }
  confirmCloseout(): CloseoutResult { const current = this.state.snapshot; if (!current.mission4Completed) return { success: false, reason: 'mission4_incomplete' }; if (!current.incidentAcknowledged || !current.unsafeActivityStopped || !current.incidentReported || !current.emergencyStationReviewed || !current.wasteClassificationCompleted) return { success: false, reason: 'requirements_incomplete' }; this.state.update({ closeoutReviewed: true }); return { success: true }; }
  complete(): CloseoutResult { const current = this.state.snapshot; if (!current.mission4Completed) return { success: false, reason: 'mission4_incomplete' }; if (!current.incidentAcknowledged || !current.unsafeActivityStopped || !current.incidentReported || !current.emergencyStationReviewed || !current.wasteClassificationCompleted || !current.closeoutReviewed) return { success: false, reason: 'requirements_incomplete' }; this.state.update({ mission5Completed: true }); return { success: true }; }
  get caseDetails(): typeof incident { return incident; }
}
