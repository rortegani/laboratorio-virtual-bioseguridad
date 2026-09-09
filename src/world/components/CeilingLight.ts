import * as THREE from 'three';

export function addCeilingLight(scene: THREE.Scene, position: THREE.Vector3, frameMaterial: THREE.MeshStandardMaterial, diffuserMaterial: THREE.MeshStandardMaterial): THREE.Group {
  const light = new THREE.Group(); light.position.copy(position);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 0.72), frameMaterial); frame.position.y = 0.01; light.add(frame);
  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.025, 0.46), diffuserMaterial); diffuser.position.y = 0.035; light.add(diffuser);
  scene.add(light); return light;
}
