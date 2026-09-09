export type AssetCategory = 'environment' | 'furniture' | 'equipment' | 'signage';
export type AssetStatus = 'pending' | 'available';

export type AssetDefinition = {
  id: string;
  path: string;
  category: AssetCategory;
  status: AssetStatus;
  source?: string;
  author?: string;
  license?: 'CC0' | 'CC BY';
};

/** Catálogo de modelos incorporados y pendientes de verificación. */
export const assets: Record<string, AssetDefinition> = {
  laboratoryTable: {
    id: 'laboratory-table', path: '/models/furniture/laboratory-table.glb', category: 'furniture', status: 'pending',
    source: 'https://sketchfab.com/3d-models/laboratory-table-e1321eb1e321486f8862d52bcacc2b36', author: 'yuitop', license: 'CC BY',
  },
  laboratoryCabinet: {
    id: 'laboratory-cabinet', path: '/models/furniture/modern_wooden_cabinet/modern_wooden_cabinet_1k.gltf', category: 'furniture', status: 'available',
    source: 'https://polyhaven.com/a/modern_wooden_cabinet', author: 'Patrik Pangerl', license: 'CC0',
  },
  monitor: {
    id: 'monitor', path: '/models/equipment/monitor.glb', category: 'equipment', status: 'pending',
    source: 'https://opengameart.org/content/3d-model-of-a-computer-monitor-and-desk', author: 'SweatyIce', license: 'CC0',
  },
  trashBin: { id: 'trash-bin', path: '/models/furniture/trash-bin.glb', category: 'furniture', status: 'pending' },
};
