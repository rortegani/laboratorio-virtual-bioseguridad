import * as THREE from 'three';
export class PlayerController {
    canvas;
    collisions;
    camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
    keys = new Set();
    yaw = 0;
    pitch = 0;
    locked = false;
    constructor(canvas, collisions) {
        this.canvas = canvas;
        this.collisions = collisions;
        this.camera.position.set(0, 1.65, 7.5);
        window.addEventListener('keydown', (event) => this.keys.add(event.code));
        window.addEventListener('keyup', (event) => this.keys.delete(event.code));
        document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === this.canvas; });
        document.addEventListener('mousemove', (event) => {
            if (!this.locked)
                return;
            this.yaw -= event.movementX * 0.0022;
            this.pitch = THREE.MathUtils.clamp(this.pitch - event.movementY * 0.0022, -1.45, 1.45);
            this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
        });
    }
    update(deltaTime) {
        const direction = new THREE.Vector3((this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0), 0, (this.keys.has('KeyS') ? 1 : 0) - (this.keys.has('KeyW') ? 1 : 0));
        if (direction.lengthSq() === 0)
            return;
        direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        this.camera.position.copy(this.collisions.move(this.camera.position, direction.multiplyScalar(3.2 * deltaTime)));
    }
    focus() { this.canvas.requestPointerLock(); }
    release() { document.exitPointerLock(); }
}
