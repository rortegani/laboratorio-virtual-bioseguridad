export type IncidentDecision = 'acknowledge' | 'continue_work' | 'ignore';
export type WasteItem = 'general_item' | 'simulated_biological_item' | 'simulated_sharps';
export type WasteCategory = 'general' | 'simulated_biological' | 'simulated_sharps';

export const incident = {
  caseId: 'SIM-001',
  area: 'Laboratorio simulado',
} as const;

export const wasteCategories: Record<WasteItem, WasteCategory> = {
  general_item: 'general',
  simulated_biological_item: 'simulated_biological',
  simulated_sharps: 'simulated_sharps',
};
