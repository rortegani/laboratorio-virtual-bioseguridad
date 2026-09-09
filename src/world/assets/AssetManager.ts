import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export type ModelTransform = {
  position?: THREE.Vector3 | [number, number, number];
  rotation?: THREE.Euler | [number, number, number];
  scale?: THREE.Vector3 | [number, number, number];
};

export type ModelOptions = ModelTransform & {
  onError?: (error: unknown) => void;
};

export type OptionalModelOptions = ModelOptions & {
  path: string;
  root: THREE.Object3D;
  fallback?: THREE.Object3D[];
};

/** Cargador opcional de modelos: un fallo deja que el greybox siga visible. */
export class AssetManager {
  private readonly loader = new GLTFLoader();
  private readonly cache = new Map<string, THREE.Object3D>();

  async loadModel(path: string, options: ModelOptions = {}): Promise<THREE.Object3D | null> {
    try {
      let source = this.cache.get(path);
      if (!source) {
        const gltf = await this.loader.loadAsync(path);
        source = gltf.scene;
        this.cache.set(path, source);
      }
      const model = source.clone(true);
      this.prepareModel(model);
      this.applyTransform(model, options);
      return model;
    } catch (error) {
      options.onError?.(error);
      return null;
    }
  }

  async attachOptionalModel(options: OptionalModelOptions): Promise<THREE.Object3D | null> {
    const { path, root, fallback, ...modelOptions } = options;
    const model = await this.loadModel(path, modelOptions);
    if (!model) return null;
    root.add(model);
    fallback?.forEach((object) => { object.visible = false; });
    return model;
  }

  private prepareModel(model: THREE.Object3D): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) { child.castShadow = false; child.receiveShadow = false; }
    });
  }

  private applyTransform(object: THREE.Object3D, options: ModelTransform): void {
    if (options.position) object.position.fromArray(options.position instanceof THREE.Vector3 ? options.position.toArray() : options.position);
    if (options.rotation) object.rotation.fromArray(options.rotation instanceof THREE.Euler ? options.rotation.toArray() : options.rotation);
    if (options.scale) object.scale.fromArray(options.scale instanceof THREE.Vector3 ? options.scale.toArray() : options.scale);
  }
}
