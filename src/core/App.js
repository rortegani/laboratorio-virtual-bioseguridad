import * as THREE from 'three';
import { CollisionSystem } from '../player/CollisionSystem';
import { PlayerController } from '../player/PlayerController';
import { InteractiveObject } from '../interaction/InteractiveObject';
import { InteractionManager } from '../interaction/InteractionManager';
import { TrainingState } from '../training/TrainingState';
import { MissionManager } from '../training/MissionManager';
import { Laboratory } from '../world/Laboratory';
import { World } from '../world/World';
import { UIManager } from '../ui/UIManager';
export class App {
    container;
    canvas = document.createElement('canvas');
    ui;
    world;
    player;
    interaction;
    state = new TrainingState();
    mission = new MissionManager(this.state);
    previousTime = 0;
    constructor(container) {
        this.container = container;
        if (!container)
            throw new Error('App container not found');
        this.ui = new UIManager(container);
    }
    start() { this.ui.onStart(() => this.enterLaboratory()); }
    enterLaboratory() {
        this.canvas.className = 'scene';
        this.container?.prepend(this.canvas);
        this.ui.showGame();
        const laboratory = new Laboratory();
        this.world = new World(this.canvas);
        this.world.laboratory.scene.clear();
        this.world.laboratory.scene.add(...laboratory.scene.children);
        const collisionSystem = new CollisionSystem(laboratory.collisions);
        this.player = new PlayerController(this.canvas, collisionSystem);
        this.interaction = new InteractionManager(this.player.camera, (target) => this.ui.setTarget(target));
        this.registerInteractions(laboratory, collisionSystem);
        window.addEventListener('resize', () => this.world.resize(this.player.camera));
        this.canvas.addEventListener('click', () => this.player.focus());
        window.addEventListener('keydown', (event) => { if (event.code === 'KeyE')
            this.interaction.interact(); });
        this.world.resize(this.player.camera);
        requestAnimationFrame((time) => this.loop(time, laboratory));
    }
    registerInteractions(laboratory, collisionSystem) {
        const [sign, prep, sink] = laboratory.interactive;
        this.interaction.register(sign.root, new InteractiveObject('safety-sign', 'Información del área', 'safety', 5, () => this.ui.showSafety(() => this.state.update({ riskInfoReviewed: true }))));
        this.interaction.register(prep.root, new InteractiveObject('preparation-station', 'Estación de preparación', 'preparation', 4, () => this.ui.showPreparation(() => this.state.update({ preparationCompleted: true }))));
        this.interaction.register(sink.root, new InteractiveObject('hand-washing', 'Estación de higiene de manos', 'hygiene', 4, () => this.ui.showHandHygiene(() => this.state.update({ handHygieneCompleted: true }))));
        this.interaction.register(laboratory.scene.children.find((child) => child instanceof THREE.Group && child.position.z === 15) ?? laboratory.scene, new InteractiveObject('door', 'Puerta de ingreso', 'door', 4, () => this.ui.showDoor(this.state.snapshot, () => { this.mission.unlockDoor(); collisionSystem.removeObstacle(laboratory.doorCollision); laboratory.openDoor(); })));
        this.state.subscribe((snapshot) => { if (snapshot.doorUnlocked)
            this.ui.setTarget(null); });
    }
    loop(time, laboratory) { const delta = Math.min((time - this.previousTime) / 1000, 0.05); this.previousTime = time; this.player.update(delta); laboratory.update(delta); this.interaction.update(); if (!this.state.snapshot.mission1Completed && this.state.snapshot.doorUnlocked && this.player.camera.position.z > 16) {
        this.mission.markMissionComplete();
        this.ui.showComplete();
    } this.world.render(this.player.camera); requestAnimationFrame((next) => this.loop(next, laboratory)); }
}
