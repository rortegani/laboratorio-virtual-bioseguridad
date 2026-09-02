import * as THREE from 'three';
export function addLighting(scene) {
    scene.add(new THREE.HemisphereLight(0xc4e4e7, 0x112026, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-5, 8, 4);
    scene.add(key);
}
