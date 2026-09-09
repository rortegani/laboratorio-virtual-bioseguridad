import * as THREE from 'three';

export function addGlassPanel(scene: THREE.Scene, position: THREE.Vector3, size: THREE.Vector3, glassMaterial: THREE.MeshPhysicalMaterial, frameMaterial: THREE.MeshStandardMaterial, rotation = 0, withFrame = true): THREE.Group {
  const group = new THREE.Group(); group.position.copy(position); group.rotation.y = rotation;
  const glass = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), glassMaterial); group.add(glass);
  if (withFrame) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(size.x + 0.12, 0.08, 0.06), frameMaterial); frame.position.y = size.y / 2; group.add(frame);
  }
  scene.add(group); return group;
}
