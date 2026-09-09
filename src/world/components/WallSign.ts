import * as THREE from 'three';

export function addWallSign(scene: THREE.Scene, text: string, position: THREE.Vector3, rotation: number, width: number, height: number, boardMaterial: THREE.MeshStandardMaterial, accentMaterial: THREE.MeshStandardMaterial): THREE.Group {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) { context.fillStyle = '#e6f1ee'; context.fillRect(0, 0, canvas.width, canvas.height); context.strokeStyle = '#65c9b8'; context.lineWidth = 8; context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8); context.fillStyle = '#29494f'; context.font = 'bold 34px sans-serif'; context.textAlign = 'center'; context.fillText(text, canvas.width / 2, 78); }
  const group = new THREE.Group(); group.position.copy(position); group.rotation.y = rotation;
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.06, height, width), boardMaterial); group.add(board);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(width - 0.18, height - 0.18), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), toneMapped: false })); sign.position.x = 0.035; sign.rotation.y = Math.PI / 2; group.add(sign);
  const accent = new THREE.Mesh(new THREE.BoxGeometry(0.035, height - 0.12, width - 0.12), accentMaterial); accent.position.x = -0.035; group.add(accent);
  scene.add(group); return group;
}
