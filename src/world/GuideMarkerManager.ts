import * as THREE from 'three';
import type { GuideStep } from '../training/GuideManager';

export class GuideMarkerManager {
  private readonly marker = new THREE.Sprite();
  private targets = new Map<string, THREE.Object3D>();
  private currentId?: string;
  constructor(private readonly scene: THREE.Scene) {
    this.marker.visible = false;
    this.marker.renderOrder = 1000;
    this.scene.add(this.marker);
  }
  setTargets(targets: Record<string, THREE.Object3D>): void { this.targets = new Map(Object.entries(targets)); }
  update(step: GuideStep | undefined, guided: boolean): void {
    if (!guided || !step?.targetKey) { this.marker.visible = false; this.currentId = undefined; return; }
    const target = this.targets.get(step.targetKey);
    if (!target) { this.marker.visible = false; return; }
    if (this.currentId !== step.id) { this.marker.material = new THREE.SpriteMaterial({ map: this.texture(`PASO ${step.order}\n${step.label}`), transparent: true, depthTest: false, toneMapped: false }); this.currentId = step.id; }
    target.getWorldPosition(this.marker.position);
    this.marker.position.y += 1.8;
    this.marker.scale.set(2.8, 0.7, 1);
    this.marker.visible = true;
  }
  private texture(text: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96;
    const context = canvas.getContext('2d'); if (context) { context.fillStyle = 'rgba(7,22,29,.9)'; context.fillRect(0, 0, canvas.width, canvas.height); context.strokeStyle = '#65c9b8'; context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2); context.fillStyle = '#e8f2f0'; context.font = 'bold 24px DM Sans'; context.textAlign = 'center'; text.split('\n').forEach((line, index) => context.fillText(line, canvas.width / 2, 34 + index * 30)); }
    return new THREE.CanvasTexture(canvas);
  }
}
