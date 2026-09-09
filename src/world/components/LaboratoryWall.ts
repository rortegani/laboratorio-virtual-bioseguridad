import * as THREE from 'three';

export function addLaboratoryWall(scene: THREE.Scene, collisions: THREE.Box3[], position: THREE.Vector3, size: THREE.Vector3, material: THREE.MeshStandardMaterial, collision = true): THREE.Mesh {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), material);
  wall.position.copy(position); scene.add(wall);
  if (collision) collisions.push(new THREE.Box3().setFromObject(wall));
  return wall;
}
