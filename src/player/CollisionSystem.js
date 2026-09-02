import * as THREE from 'three';
export class CollisionSystem {
    obstacles;
    radius;
    constructor(obstacles, radius = 0.35) {
        this.obstacles = obstacles;
        this.radius = radius;
    }
    removeObstacle(obstacle) {
        const index = this.obstacles.indexOf(obstacle);
        if (index >= 0)
            this.obstacles.splice(index, 1);
    }
    move(position, delta) {
        const next = position.clone();
        next.x += delta.x;
        if (this.collides(next))
            next.x = position.x;
        next.z += delta.z;
        if (this.collides(next))
            next.z = position.z;
        return next;
    }
    collides(position) {
        const player = new THREE.Box3(new THREE.Vector3(position.x - this.radius, position.y - 1.6, position.z - this.radius), new THREE.Vector3(position.x + this.radius, position.y + 0.15, position.z + this.radius));
        return this.obstacles.some((obstacle) => player.intersectsBox(obstacle));
    }
}
