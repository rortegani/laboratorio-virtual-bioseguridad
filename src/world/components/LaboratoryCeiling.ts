import * as THREE from 'three';

export function addLaboratoryCeiling(scene: THREE.Scene, width: number, minZ: number, maxZ: number, height: number, material: THREE.MeshStandardMaterial): THREE.Mesh {
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(width, 0.16, maxZ - minZ + 1), material);
  ceiling.position.set(0, height, (minZ + maxZ) / 2); ceiling.receiveShadow = true; scene.add(ceiling); return ceiling;
}
