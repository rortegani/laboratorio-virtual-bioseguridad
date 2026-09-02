export const scenario = {
  title: 'Laboratorio Virtual de Bioseguridad',
  module: 'Seguridad y diagnóstico molecular de Influenza A/B',
  mission: 'Ingreso seguro',
  sampleScenario: 'match' as 'match' | 'mismatch',
  mission3: 'Trabajo seguro',
  safetyRisks: [
    'Exposición accidental a material clínico simulado',
    'Salpicaduras',
    'Contaminación de superficies',
    'Contaminación cruzada',
    'Errores de identificación',
  ],
} as const;
