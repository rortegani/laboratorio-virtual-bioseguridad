import { scoring } from '../data/scoring';
import type { CriticalErrorCode, TrainingEvent } from './EventLog';
import type { TrainingSnapshot } from './TrainingState';

export type AssessmentResult = { score: number; passed: boolean; criticalErrors: Array<{ code: CriticalErrorCode; description: string }>; sections: Record<'preparation' | 'reception' | 'safeWork' | 'contamination' | 'molecular' | 'incident' | 'closeout', number>; strengths: string[]; improvements: string[] };

export class ScoreManager {
  calculate(snapshot: TrainingSnapshot, events: TrainingEvent[]): AssessmentResult {
    const wrongReception = events.filter((event) => event.type === 'wrong_decision').length;
    const wrongMolecular = events.filter((event) => event.type === 'wrong_interpretation').length;
    const wrongWaste = events.filter((event) => event.type === 'wrong_waste_classification').length;
    const sections = {
      preparation: snapshot.mission1Completed ? scoring.preparation : 0,
      reception: snapshot.mission2Completed ? Math.max(0, scoring.reception - wrongReception * scoring.wrongDecisionPenalty) : 0,
      safeWork: snapshot.mission3Completed ? scoring.safeWork : 0,
      contamination: snapshot.safeFlowCompleted ? scoring.contamination : snapshot.crossContaminationDetected ? 8 : 0,
      molecular: snapshot.mission4Completed ? Math.max(0, scoring.molecular - wrongMolecular * scoring.wrongInterpretationPenalty) : 0,
      incident: snapshot.incidentAcknowledged && snapshot.unsafeActivityStopped && snapshot.incidentReported ? (snapshot.incidentIgnored ? 3 : scoring.incident) : 0,
      closeout: snapshot.mission5Completed ? Math.max(0, scoring.closeout - wrongWaste * scoring.wastePenalty) : 0,
    };
    const criticalErrors = Array.from(new Map(events.flatMap((event) => event.criticalCode ? [[event.criticalCode, { code: event.criticalCode, description: event.description }] as const] : [])).values());
    const improvements: string[] = []; if (snapshot.crossContaminationDetected) improvements.push('Generó contaminación cruzada simulada.'); if (snapshot.incidentIgnored) improvements.push('Inicialmente ignoró una condición anormal.'); if (wrongMolecular > 0) improvements.push('Realizó una interpretación incorrecta antes de corregir.'); if (wrongReception > 0) improvements.push('Necesitó corregir una decisión de recepción.');
    const strengths: string[] = []; if (snapshot.mission1Completed) strengths.push('Completó la preparación de ingreso.'); if (snapshot.mission2Completed) strengths.push('Verificó correctamente SIM-001.'); if (snapshot.biosafetyCabinetReviewed) strengths.push('Reconoció la Cabina de Seguridad Biológica.'); if (snapshot.mission4Completed) strengths.push('Interpretó correctamente el resultado molecular.'); if (snapshot.mission5Completed) strengths.push('Completó el cierre de la actividad.');
    const score = Math.min(100, Math.max(0, Object.values(sections).reduce((sum, value) => sum + value, 0)));
    return { score, passed: score >= 80 && criticalErrors.length === 0, criticalErrors, sections, strengths, improvements };
  }
}
