import * as THREE from 'three';

function createFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas'); canvas.width = 96; canvas.height = 96;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#9aa9ab'; context.fillRect(0, 0, 96, 96);
    context.fillStyle = 'rgba(255,255,255,.035)'; context.fillRect(7, 9, 38, 32); context.fillRect(58, 57, 31, 25);
    context.fillStyle = 'rgba(50,80,82,.025)'; context.fillRect(48, 18, 35, 28);
  }
  const texture = new THREE.CanvasTexture(canvas); texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(8, 28); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

export function addLaboratoryFloor(scene: THREE.Scene, width: number, minZ: number, maxZ: number, material: THREE.MeshStandardMaterial): THREE.Mesh {
  material.map = createFloorTexture(); material.needsUpdate = true;
  const floor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.2, maxZ - minZ + 1), material);
  floor.position.set(0, -0.1, (minZ + maxZ) / 2); floor.receiveShadow = true; scene.add(floor); return floor;
}
