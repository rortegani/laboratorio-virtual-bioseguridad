import * as THREE from 'three';
export class InteractionManager {
    camera;
    onTarget;
    raycaster = new THREE.Raycaster();
    objects = new Map();
    current = null;
    constructor(camera, onTarget) {
        this.camera = camera;
        this.onTarget = onTarget;
    }
    register(mesh, object) { this.objects.set(mesh, object); }
    update() {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const hits = this.raycaster.intersectObjects([...this.objects.keys()], true);
        const hit = hits.find((entry) => entry.distance <= (this.objects.get(entry.object)?.maxDistance ?? 0));
        const target = hit ? this.findTarget(hit.object) : null;
        if (target !== this.current) {
            this.current = target;
            this.onTarget(target);
        }
    }
    interact() { this.current?.action(); }
    findTarget(object) {
        let cursor = object;
        while (cursor) {
            const target = this.objects.get(cursor);
            if (target)
                return target;
            cursor = cursor.parent;
        }
        return null;
    }
}
