import * as THREE from 'three';

export class CollisionSystem {
  constructor(private readonly obstacles: THREE.Box3[], private readonly radius = 0.35) {}

  removeObstacle(obstacle: THREE.Box3): void {
    const index = this.obstacles.indexOf(obstacle);
    if (index >= 0) this.obstacles.splice(index, 1);
  }

  move(position: THREE.Vector3, delta: THREE.Vector3): THREE.Vector3 {
    const next = position.clone();
    next.x += delta.x;
    if (this.collides(next)) next.x = position.x;
    next.z += delta.z;
    if (this.collides(next)) next.z = position.z;
    return next;
  }

  private collides(position: THREE.Vector3): boolean {
    const player = new THREE.Box3(
      new THREE.Vector3(position.x - this.radius, position.y - 1.6, position.z - this.radius),
      new THREE.Vector3(position.x + this.radius, position.y + 0.15, position.z + this.radius),
    );
    return this.obstacles.some((obstacle) => player.intersectsBox(obstacle));
  }
}
