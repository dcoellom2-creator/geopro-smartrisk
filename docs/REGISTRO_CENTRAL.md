# Registro central SmartRisk

Preparado el 9 de noviembre de 2026.

## Implementación

Google Sheets privado con Informacion, Tareas, Bitacora y Datos_Kobo. Apps Script vinculado, código en `apps-script/Code.gs`. `@OnlyCurrentDoc` limita el acceso al archivo actual. No hay endpoint público ni secretos en la cabina.

El menú SmartRisk abre una interfaz de consulta y edición. Cada guardado agrega una versión; la interfaz selecciona la última por ID. No editar manualmente encabezados, IDs o versiones. Las filas anteriores permanecen para recuperación. Bitacora resume cambios; las tablas de versiones son el registro principal.

La aplicación comprueba la versión previa bajo bloqueo del documento y rechaza sobrescrituras simultáneas. No se eliminan registros. Kobo se archiva en fragmentos con SHA-256 y deduplicación de archivos idénticos. No descarga datos desde Kobo.

## Activación comprobada

Autorización realizada el 9 de noviembre de 2026. Abrir la hoja y usar SmartRisk > Abrir registro central. La apertura debe realizarse desde el menú de la hoja; la llamada directa a abrirRegistro desde el editor puede carecer de contexto de interfaz.

Prueba integral: guardar la nota «Uso del registro central SmartRisk», cerrar y abrir la interfaz, recuperar la nota desde Sheets, buscar por «respaldo» y guardar una edición. Se comprobaron en Sheets las versiones 1 y 2 del mismo ID y su bitácora.

## Cabina pública

Información y respaldo contiene el acceso a la hoja. Las tareas de la cabina pública siguen siendo locales: **no hay sincronización automática entre GitHub Pages y Sheets**. Exportar respaldo local e importarlo en el registro central conserva IDs existentes. Los cambios posteriores en ambas copias no se fusionan. Para almacenamiento central, gestionar esos registros desde la interfaz de Sheets desde el menú SmartRisk.

La bitácora local del respaldo original no se importa como si fueran eventos nuevos. Mantener el JSON de origen. Los lotes Kobo se trasladan por archivo JSON.

## Verificación

`node apps-script/central.test.cjs`: ocho escenarios locales de versiones, conflictos, cierre de tareas, texto literal, fragmentación, deduplicación, integridad y estructura. Prueba integral en Google superada para información: creación, consulta al reabrir, búsqueda y edición con conservación de versiones. Importación Kobo y tareas cuentan con pruebas locales; no se trasladaron automáticamente datos del navegador.

## Documentación oficial

- https://developers.google.com/apps-script/guides/dialogs
- https://developers.google.com/apps-script/guides/html/communication
- https://developers.google.com/apps-script/guides/services/authorization
