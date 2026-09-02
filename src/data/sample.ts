export type SampleScenario = 'match' | 'mismatch';
export type SampleDecision = 'accept' | 'report_discrepancy';

export const sample = {
  physicalCode: 'SIM-001',
  patient: 'Paciente Simulado 001',
  type: 'Muestra respiratoria simulada',
  request: 'Influenza A/B',
} as const;

export function digitalCodeFor(scenario: SampleScenario): string {
  return scenario === 'match' ? sample.physicalCode : 'SIM-017';
}
