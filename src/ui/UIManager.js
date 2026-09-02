import { scenario } from '../data/scenario';
export class UIManager {
    root;
    modal;
    prompt;
    targetLabel;
    missionToast;
    constructor(container) {
        this.root = document.createElement('div');
        this.root.className = 'ui';
        container.append(this.root);
        this.root.innerHTML = `<section class="start-screen"><div class="eyebrow">SIMULADOR EDUCATIVO · SPRINT 01</div><h1>${scenario.title}</h1><p>Capacitación inmersiva para estudiantes de ciencias de la salud.</p><div class="module">MÓDULO 01<br><strong>${scenario.module}</strong></div><button class="primary start">INICIAR CAPACITACIÓN</button><small>Demo educativo. No contiene material biológico real ni procedimientos experimentales.</small></section><section class="game-ui hidden"><div class="hud"><span class="eyebrow">MISIÓN 1/5</span><strong>${scenario.mission}</strong><span class="objective">Complete las condiciones necesarias para ingresar.</span></div><div class="crosshair">+</div><div class="interaction"><span class="target"></span><span class="prompt">[E] Interactuar</span></div><div class="controls">WASD mover · Mouse mirar · E interactuar · ESC liberar cursor</div><div class="toast"></div></section>`;
        this.modal = document.createElement('div');
        this.modal.className = 'modal-layer hidden';
        this.root.append(this.modal);
        this.prompt = this.root.querySelector('.prompt');
        this.targetLabel = this.root.querySelector('.target');
        this.missionToast = this.root.querySelector('.toast');
    }
    onStart(callback) { this.root.querySelector('.start')?.addEventListener('click', callback); }
    showGame() { this.root.querySelector('.start-screen')?.classList.add('hidden'); this.root.querySelector('.game-ui')?.classList.remove('hidden'); }
    setTarget(target) { this.prompt.classList.toggle('visible', Boolean(target)); this.targetLabel.textContent = target ? `${target.name} · ` : ''; }
    showSafety(done) { this.showModal(`<div class="eyebrow">INFORMACIÓN DE SEGURIDAD</div><h2>Área de ingreso</h2><p>Escenario educativo de laboratorio clínico.</p><p>Antes de ingresar deben revisarse los riesgos y las medidas de seguridad establecidas para la actividad.</p><ul>${scenario.safetyRisks.map((risk) => `<li>${risk}</li>`).join('')}</ul><button class="primary modal-action">ENTENDIDO</button>`, done); }
    showPreparation(done) { this.showModal(`<div class="eyebrow">PREPARACIÓN PERSONAL</div><h2>Condiciones de preparación</h2><p>Este escenario requiere completar las condiciones de preparación definidas antes del ingreso.</p><div class="prep-items"><span>Protección visual</span><span>Bata de laboratorio</span><span>Guantes simulados</span></div><button class="primary modal-action">COMPLETAR PREPARACIÓN</button>`, done); }
    showHandHygiene(done) { this.showModal(`<div class="eyebrow">HIGIENE DE MANOS</div><h2>Estación de higiene de manos</h2><p>Acción de entrenamiento registrada.</p><div class="loader"></div><p class="muted">Procesando registro…</p>`, undefined); window.setTimeout(() => { this.closeModal(); done(); }, 2000); }
    showDoor(snapshot, unlock) { const check = (value, label) => `<li class="${value ? 'done' : 'pending'}">${value ? '✓' : '×'} ${label}</li>`; const all = snapshot.riskInfoReviewed && snapshot.preparationCompleted && snapshot.handHygieneCompleted; this.showModal(`<div class="eyebrow">VERIFICACIÓN DE INGRESO</div><h2>${all ? 'ACCESO HABILITADO' : 'Requisitos pendientes'}</h2><ul class="checks">${check(snapshot.riskInfoReviewed, 'Información de seguridad revisada')}${check(snapshot.preparationCompleted, 'Preparación completada')}${check(snapshot.handHygieneCompleted, 'Higiene de manos registrada')}</ul>${all ? '<button class="primary modal-action">ABRIR PUERTA</button>' : '<p class="warning">Complete las condiciones pendientes antes de ingresar.</p>'}`, all ? unlock : undefined); }
    showComplete() { this.missionToast.innerHTML = '<strong>MISIÓN 1 COMPLETADA</strong><span>Ingreso seguro al laboratorio</span>'; this.missionToast.classList.add('visible'); window.setTimeout(() => this.missionToast.classList.remove('visible'), 4500); }
    showModal(content, action) { this.modal.innerHTML = `<div class="modal">${content}<button class="close">Cerrar</button></div>`; this.modal.classList.remove('hidden'); this.modal.querySelector('.close')?.addEventListener('click', () => this.closeModal()); if (action)
        this.modal.querySelector('.modal-action')?.addEventListener('click', () => { this.closeModal(); action(); }); }
    closeModal() { this.modal.classList.add('hidden'); this.modal.innerHTML = ''; }
}
