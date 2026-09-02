import * as THREE from 'three';
import { addLighting } from './Lighting';
import { Laboratory } from './Laboratory';

export class World {
  readonly laboratory: Laboratory;
  readonly renderer: THREE.WebGLRenderer;
  private readonly renderDebug = new URLSearchParams(window.location.search).get('renderDebug') === '1';
  private debugReady = false;

  constructor(canvas: HTMLCanvasElement, laboratory: Laboratory) {
    this.laboratory = laboratory;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    addLighting(this.laboratory.scene);
  }

  resize(camera: THREE.PerspectiveCamera): void {
    const width = window.innerWidth; const height = window.innerHeight;
    camera.aspect = width / height; camera.updateProjectionMatrix(); this.renderer.setSize(width, height, false);
  }

  render(camera: THREE.Camera): void {
    if (this.renderDebug && !this.debugReady) this.setupRenderDebug(camera);
    this.renderer.render(this.laboratory.scene, camera);
  }

  private setupRenderDebug(camera: THREE.Camera): void {
    this.debugReady = true;
    this.laboratory.scene.add(camera);

    const geometry = new THREE.PlaneGeometry(0.24, 0.24);
    const addDebugPlane = (material: THREE.Material, x: number): void => {
      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(x, 0, -1);
      plane.renderOrder = 999999;
      camera.add(plane);
    };

    addDebugPlane(new THREE.MeshBasicMaterial({ color: 0xff0000, toneMapped: false, fog: false, depthTest: false, depthWrite: false }), -0.55);
    addDebugPlane(new THREE.RawShaderMaterial({
      vertexShader: `
        precision highp float;
        attribute vec3 position;
        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        void main() {
          gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        }
      `,
      depthTest: false,
      depthWrite: false,
    }), 0);
    addDebugPlane(new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, fog: false, depthTest: false, depthWrite: false }), 0.55);

    const gl = this.renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info') as {
      UNMASKED_RENDERER_WEBGL: number;
      UNMASKED_VENDOR_WEBGL: number;
    } | null;
    console.table({
      webglVersion: gl.getParameter(gl.VERSION),
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      outputColorSpace: this.renderer.outputColorSpace,
      toneMapping: this.renderer.toneMapping,
    });
  }
}
