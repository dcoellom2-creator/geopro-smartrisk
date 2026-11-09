# Cabina SmartRisk · GeoPro Control

Entrada: [cabina.html](../cabina.html). Aplicación Vue 3.5.13, incluida localmente en vendor; sin servicios externos para ejecutar la interfaz.

## Áreas operativas

- Cabina general: conteos calculados desde tareas y registros Kobo guardados en este navegador; accesos a receptor, ficha, GitHub, Kobo y sitio público.
- Control operativo: crear/editar tareas, filtrar por módulo, prioridad o responsable; cinco estados.
- Planificación: etapas propuestas 2026–2027 y compromisos con fecha. No asigna fechas ni responsables automáticamente.
- Módulos: ocho sectores y creación de acciones por módulo.
- Administración: exportar/importar tareas, consultar inventario y acceder a administración Kobo/GitHub.
- Bitácora: movimientos locales con hora Ecuador.

## Reglas

Terminado requiere responsable y evidencia. Un cambio de estado no valida los registros Kobo. No se calcula porcentaje global sin aceptación de entregables. El conteo Kobo usa la clave del receptor ya existente, sin copiar datos al repositorio.

El respaldo JSON incluye tareas y bitácora; su importación agrega IDs nuevos y conserva tareas existentes. La bitácora del archivo importado permanece como evidencia en el respaldo original y no se mezcla con movimientos actuales. Los respaldos de registros Kobo se gestionan desde el receptor.

## Límites actuales

Interfaz pública; almacenamiento local por navegador. Sin autenticación, roles de acceso ni base central. Las cuatro tareas iniciales son copias de planificación con enlaces a issues: no se sincronizan ni cambian GitHub. El guardado local no equivale a administración multiusuario. Evitar datos confidenciales hasta implementar acceso privado y almacenamiento central.

## Verificación

node cabina-core.test.cjs: cierre con evidencia/responsable, fechas vencidas, fecha inválida y respaldo con IDs duplicados. Comprobar además en navegador creación, edición, filtros, guardado y recuperación.

Referencias: https://vuejs.org/guide/ ; documentación Kobo en CONEXION_KOBO.md.
