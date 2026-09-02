export type MolecularScenario = 'valid' | 'invalid';
export type MolecularAnswer = 'detected_target' | 'viable_virus' | 'no_other_infection' | 'discard_result' | 'invalid_yes' | 'invalid_no';

export const molecular = {
  equipment: 'BIO-LAB MOLECULAR SYSTEM',
  caseId: 'SIM-001',
  request: 'Influenza A / Influenza B',
} as const;
