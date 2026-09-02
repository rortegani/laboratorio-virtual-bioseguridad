import * as THREE from 'three';

export function addLighting(scene: THREE.Scene): void {
  scene.add(new THREE.AmbientLight(0xe6f5f2, 0.45));
  scene.add(new THREE.HemisphereLight(0xd8f1f0, 0x31545a, 1.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.8);
  key.position.set(-5, 8, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xa8dce8, 0.65);
  fill.position.set(6, 5, -6);
  scene.add(fill);
}
