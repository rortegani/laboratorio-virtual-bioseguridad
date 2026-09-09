import * as THREE from 'three';

export function addLighting(scene: THREE.Scene): void {
  scene.add(new THREE.AmbientLight(0xe6f5f2, 0.6));
  scene.add(new THREE.HemisphereLight(0xd8f1f0, 0x567277, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(-5, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -12; key.shadow.camera.right = 12; key.shadow.camera.top = 12; key.shadow.camera.bottom = -12; key.shadow.camera.near = 0.5; key.shadow.camera.far = 80;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xa8dce8, 0.75);
  fill.position.set(6, 5, -6);
  scene.add(fill);
}
