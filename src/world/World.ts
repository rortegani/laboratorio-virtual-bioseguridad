import * as THREE from 'three';
import { addLighting } from './Lighting';
import { Laboratory } from './Laboratory';

export class World {
  readonly laboratory = new Laboratory();
  readonly renderer: THREE.WebGLRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    addLighting(this.laboratory.scene);
  }

  resize(camera: THREE.PerspectiveCamera): void {
    const width = window.innerWidth; const height = window.innerHeight;
    camera.aspect = width / height; camera.updateProjectionMatrix(); this.renderer.setSize(width, height, false);
  }

  render(camera: THREE.Camera): void { this.renderer.render(this.laboratory.scene, camera); }
}
