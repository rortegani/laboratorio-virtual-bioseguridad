import { scenario } from '../data/scenario';
import { InteractiveObject } from '../interaction/InteractiveObject';
import type { TrainingSnapshot } from '../training/TrainingState';
import type { VerificationResult } from '../training/Mission2Manager';
import { digitalCodeFor, sample } from '../data/sample';

export class UIManager {
  readonly root: HTMLElement;
  private modal!: HTMLElement;
  private prompt!: HTMLElement;
  private targetLabel!: HTMLElement;
  private missionToast!: HTMLElement;
  private pointerHint!: HTMLElement;

  constructor(container: HTMLElement) {
    this.root = document.createElement('div'); this.root.className = 'ui'; container.append(this.root);
    this.root.innerHTML = `<section class="start-screen"><div class="eyebrow">SIMULADOR EDUCATIVO · SPRINT 01</div><h1>${scenario.title}</h1><p>Capacitación inmersiva para estudiantes de ciencias de la salud.</p><div class="module">MÓDULO 01<br><strong>${scenario.module}</strong></div><button class="primary start">INICIAR CAPACITACIÓN</button><small>Demo educativo. No contiene material biológico real ni procedimientos experimentales.</small></section><section class="game-ui hidden"><div class="hud"><span class="eyebrow">MISIÓN 1/5</span><strong>${scenario.mission}</strong><span class="objective">Complete las condiciones necesarias para ingresar.</span></div><div class="crosshair">+</div><div class="interaction"><span class="target"></span><span class="prompt">[E] Interactuar</span></div><div class="controls">WASD mover · Mouse mirar · E interactuar · ESC liberar cursor</div><div class="pointer-hint">Haz clic en la escena para recuperar el control del cursor.</div><div class="toast"></div></section>`;
    this.modal = document.createElement('div'); this.modal.className = 'modal-layer hidden'; this.root.append(this.modal);
    this.prompt = this.root.querySelector('.prompt') as HTMLElement; this.targetLabel = this.root.querySelector('.target') as HTMLElement;
    this.missionToast = this.root.querySelector('.toast') as HTMLElement; this.pointerHint = this.root.querySelector('.pointer-hint') as HTMLElement;
  }
  onStart(callback: () => void): void { this.root.querySelector('.start')?.addEventListener('click', callback); }
  showGame(): void { this.root.querySelector('.start-screen')?.classList.add('hidden'); this.root.querySelector('.game-ui')?.classList.remove('hidden'); }
  setMission(snapshot: TrainingSnapshot): void {
    const eyebrow = this.root.querySelector('.hud .eyebrow'); const title = this.root.querySelector('.hud strong'); const objective = this.root.querySelector('.objective');
    if (!snapshot.mission1Completed) return;
    if (eyebrow) eyebrow.textContent = 'MISIÓN 2/5';
    if (title) title.textContent = snapshot.mission2Completed ? 'Completada' : 'Recepción y verificación';
    if (objective) objective.textContent = snapshot.mission2Completed ? 'Misión 2 completada.' : 'Localice SIM-001 y verifique su información.';
  }
  setTarget(target: InteractiveObject | null): void { this.prompt.classList.toggle('visible', Boolean(target)); this.targetLabel.textContent = target ? `${target.name} · ` : ''; }
  setPointerHint(visible: boolean): void { this.pointerHint.classList.toggle('visible', visible); }
  showSample(done: () => void): void { this.showModal(`<div class="eyebrow">MUESTRA DE ENTRENAMIENTO</div><h2>Identificación de SIM-001</h2><dl><dt>Código</dt><dd>${sample.physicalCode}</dd><dt>Tipo</dt><dd>${sample.type}</dd><dt>Solicitud</dt><dd>${sample.request}</dd><dt>Estado</dt><dd>Pendiente de verificación</dd></dl><button class="primary modal-action">REGISTRAR INFORMACIÓN REVISADA</button>`, done); }
  showComputer(scenario: 'match' | 'mismatch', onDecision: (decision: 'accept' | 'report_discrepancy') => void): void { const code = digitalCodeFor(scenario); this.showModal(`<div class="eyebrow">SISTEMA DE LABORATORIO</div><h2>Registro de recepción</h2><dl><dt>Paciente</dt><dd>${sample.patient}</dd><dt>Código de muestra</dt><dd>${code}</dd><dt>Tipo</dt><dd>${sample.type}</dd><dt>Solicitud</dt><dd>${sample.request}</dd><dt>Estado</dt><dd>Pendiente de recepción</dd></dl><div class="decision-buttons"><button class="primary accept">ACEPTAR MUESTRA</button><button class="secondary report">REPORTAR DISCREPANCIA</button></div>`, undefined); this.modal.querySelector('.accept')?.addEventListener('click', () => { this.closeModal(); onDecision('accept'); }); this.modal.querySelector('.report')?.addEventListener('click', () => { this.closeModal(); onDecision('report_discrepancy'); }); }
  showVerificationResult(result: VerificationResult): void { const content = result.correct ? (result.reason === 'sample_match' ? '<h2>MISIÓN 2 COMPLETADA</h2><p>Recepción y verificación correcta de SIM-001.</p>' : '<h2>MISIÓN 2 COMPLETADA</h2><p>Discrepancia de identificación reconocida correctamente.</p>') : (result.reason === 'sample_not_inspected' ? '<h2>VERIFICACIÓN INCOMPLETA</h2><p>Revise la identificación de la muestra antes de continuar.</p>' : result.reason === 'wrong_decision' ? (result.scenario === 'match' ? '<h2>DECISIÓN INCORRECTA</h2><p>Los datos presentados coinciden. Revise nuevamente la muestra y el registro.</p>' : '<h2>DECISIÓN INCORRECTA</h2><p>Existe una discrepancia entre la identificación física y el registro digital. Revise ambos datos antes de continuar.</p>') : '<h2>ACCESO NO DISPONIBLE</h2><p>Complete la Misión 1 antes de continuar.</p>'); this.showModal(content); }
  showSafety(done: () => void): void { this.showModal(`<div class="eyebrow">INFORMACIÓN DE SEGURIDAD</div><h2>Área de ingreso</h2><p>Escenario educativo de laboratorio clínico.</p><p>Antes de ingresar deben revisarse los riesgos y las medidas de seguridad establecidas para la actividad.</p><ul>${scenario.safetyRisks.map((risk) => `<li>${risk}</li>`).join('')}</ul><button class="primary modal-action">ENTENDIDO</button>`, done); }
  showPreparation(done: () => void): void { this.showModal(`<div class="eyebrow">PREPARACIÓN PERSONAL</div><h2>Condiciones de preparación</h2><p>Este escenario requiere completar las condiciones de preparación definidas antes del ingreso.</p><div class="prep-items"><span>Protección visual</span><span>Bata de laboratorio</span><span>Guantes simulados</span></div><button class="primary modal-action">COMPLETAR PREPARACIÓN</button>`, done); }
  showHandHygiene(done: () => void): void { this.showModal(`<div class="eyebrow">HIGIENE DE MANOS</div><h2>Estación de higiene de manos</h2><p>Acción de entrenamiento registrada.</p><div class="loader"></div><p class="muted">Procesando registro…</p>`, undefined); window.setTimeout(() => { this.closeModal(); done(); }, 2000); }
  showDoor(snapshot: TrainingSnapshot, unlock: () => void): void { const check = (value: boolean, label: string) => `<li class="${value ? 'done' : 'pending'}">${value ? '✓' : '×'} ${label}</li>`; const all = snapshot.riskInfoReviewed && snapshot.preparationCompleted && snapshot.handHygieneCompleted; this.showModal(`<div class="eyebrow">VERIFICACIÓN DE INGRESO</div><h2>${all ? 'ACCESO HABILITADO' : 'Requisitos pendientes'}</h2><ul class="checks">${check(snapshot.riskInfoReviewed, 'Información de seguridad revisada')}${check(snapshot.preparationCompleted, 'Preparación completada')}${check(snapshot.handHygieneCompleted, 'Higiene de manos registrada')}</ul>${all ? '<button class="primary modal-action">ABRIR PUERTA</button>' : '<p class="warning">Complete las condiciones pendientes antes de ingresar.</p>'}`, all ? unlock : undefined); }
  showComplete(): void { this.missionToast.innerHTML = '<strong>MISIÓN 1 COMPLETADA</strong><span>Ingreso seguro al laboratorio</span>'; this.missionToast.classList.add('visible'); window.setTimeout(() => this.missionToast.classList.remove('visible'), 4500); }
  private showModal(content: string, action?: () => void): void { this.modal.innerHTML = `<div class="modal">${content}<button class="close">Cerrar</button></div>`; this.modal.classList.remove('hidden'); this.modal.querySelector('.close')?.addEventListener('click', () => this.closeModal()); if (action) this.modal.querySelector('.modal-action')?.addEventListener('click', () => { this.closeModal(); action(); }); }
  private closeModal(): void { this.modal.classList.add('hidden'); this.modal.innerHTML = ''; }
}
