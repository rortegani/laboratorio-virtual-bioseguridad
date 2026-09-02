# Laboratorio Virtual de Bioseguridad

Simulador educativo 3D para estudiantes de ciencias de la salud. El Sprint 1 construye un laboratorio greybox y una misión de ingreso seguro, sin material biológico ni procedimientos experimentales reales.

## Tecnologías

Vite, TypeScript, Three.js, HTML y CSS. No hay framework de UI, backend ni base de datos.

## Instalación y ejecución

```bash
npm install
npm run dev
```

Para validar la compilación: `npm run build`.

## Controles

WASD mueve al estudiante, el mouse permite mirar, E interactúa y ESC libera el cursor.

## Arquitectura

- `core`: ciclo de aplicación y composición de módulos.
- `world`: escena, iluminación y laboratorio greybox.
- `player`: cámara en primera persona y colisiones AABB.
- `interaction`: registro de objetos y raycasting centralizado.
- `training`: estado observable y reglas de la misión.
- `ui`: HUD, pantalla inicial y modales HTML.
- `data`: contenido estático del escenario.

## Alcance terminado del Sprint 1

Incluye pantalla inicial, movimiento con delta time, mirada con Pointer Lock, colisiones con paredes y puerta cerrada, señal de seguridad, estación de preparación, lavamanos con registro de dos segundos, verificación de requisitos, apertura animada y mensaje de misión completada al cruzar.

## Pendiente

Modelos 3D de producción, equipos internos, accesibilidad avanzada, experiencia móvil, persistencia, usuarios, backend y las misiones 3 a 5 quedan fuera de este sprint.

## Sprint 2 — Recepción y verificación

La segunda misión se activa al completar el ingreso seguro. El estudiante examina la muestra respiratoria simulada `SIM-001` y utiliza el computador de recepción para comparar la identificación física con el registro digital.

La configuración `sampleScenario` en `src/data/scenario.ts` permite probar dos variantes sin aleatoriedad: `match` muestra `SIM-001` en el sistema y requiere aceptar la muestra; `mismatch` muestra `SIM-017` y requiere reportar la discrepancia. La misión no se completa sin examinar primero la muestra ni con una decisión incorrecta.

Este sprint no incluye procesamiento molecular, RT-qPCR, pipeteo, contaminación, residuos, incidentes, backend, usuarios, VR, WebXR ni Sprint 3.

## Sprint 3 — Trabajo seguro y contaminación cruzada

La tercera misión se activa al completar la recepción de SIM-001. Incluye el reconocimiento conceptual de una Cabina de Seguridad Biológica, una micropipeta y la organización del área de trabajo.

`Mission3Manager` controla el acceso, los reconocimientos y la finalización. `ContaminationManager` administra exclusivamente estados simulados para SIM-001, la mano virtual y la superficie compartida. El estudiante puede aplicar una medida institucional simulada antes de tocar el teclado (camino seguro) o reconocer la visualización `SIM-001 → Mano virtual → Teclado` si produce contaminación cruzada simulada.

No se incluyen protocolos, parámetros, RT-qPCR, resultados moleculares, residuos, incidentes, derrames, puntuación, backend, VR, WebXR, Blender ni Sprint 4.
