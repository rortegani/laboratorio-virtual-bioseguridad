import * as THREE from 'three';

export type LaboratoryMaterials = {
  wall: THREE.MeshStandardMaterial;
  secondaryWall: THREE.MeshStandardMaterial;
  floor: THREE.MeshStandardMaterial;
  ceiling: THREE.MeshStandardMaterial;
  door: THREE.MeshStandardMaterial;
  frame: THREE.MeshStandardMaterial;
  countertop: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  signage: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  accent: THREE.MeshStandardMaterial;
};

const standard = (color: number, roughness: number, metalness = 0): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, toneMapped: false });

export function createLaboratoryMaterials(): LaboratoryMaterials {
  return {
    wall: standard(0xd7e1df, 0.78),
    secondaryWall: standard(0xc7d5d4, 0.78),
    floor: standard(0x9aa9ab, 0.72),
    ceiling: standard(0xe6f1ee, 0.9),
    door: standard(0x5f9690, 0.78),
    frame: standard(0x456f72, 0.5, 0.2),
    countertop: standard(0xe6f1ee, 0.55, 0.08),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x9edbd5, transparent: true, opacity: 0.28, roughness: 0.22, metalness: 0, depthWrite: false, toneMapped: false }),
    signage: standard(0xe6f1ee, 0.6, 0.05),
    metal: standard(0xe6f1ee, 0.35, 0.55),
    accent: standard(0x65c9b8, 0.45),
  };
}
