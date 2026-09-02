import * as THREE from 'three';
import { InteractiveObject } from './InteractiveObject';

export class InteractionManager {
  private readonly raycaster = new THREE.Raycaster();
  private readonly objects = new Map<THREE.Object3D, InteractiveObject>();
  private current: InteractiveObject | null = null;

  constructor(private readonly camera: THREE.Camera, private readonly onTarget: (target: InteractiveObject | null) => void) {}

  register(mesh: THREE.Object3D, object: InteractiveObject): void { this.objects.set(mesh, object); }

  update(): void {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const hits = this.raycaster.intersectObjects([...this.objects.keys()], true);
    const target = hits.reduce<InteractiveObject | null>((selected, entry) => {
      if (selected) return selected;
      const candidate = this.findTarget(entry.object);
      return candidate && entry.distance <= candidate.maxDistance ? candidate : null;
    }, null);
    if (target !== this.current) { this.current = target; this.onTarget(target); }
  }

  interact(): void { this.current?.action(); }

  private findTarget(object: THREE.Object3D): InteractiveObject | null {
    let cursor: THREE.Object3D | null = object;
    while (cursor) {
      const target = this.objects.get(cursor);
      if (target) return target;
      cursor = cursor.parent;
    }
    return null;
  }
}
