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

Modelos 3D de producción, equipos internos, accesibilidad avanzada, experiencia móvil, persistencia, usuarios, backend y las misiones 2 a 5 quedan fuera de este sprint.
