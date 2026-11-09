# Recepción Kobo → SmartRisk

Corte: 8 noviembre 2026. Modalidad operativa: recepción por lotes JSON en el navegador. No es sincronización automática ni almacenamiento central.

## Formularios comprobados en la sesión del propietario

| Formulario | Asset UID | Versión visible | Envíos al comprobar |
|---|---|---|---|
| Organización comunitaria | axouQbKCtMo3YAPMVoKkyh | v1, 204 preguntas | 1 |
| Reconocimiento geológico y geotécnico preliminar | a8LkrUBpB7KjDCu6NzDkNt | v6, 295 preguntas | 1 |

Ambos implementados con fecha de modificación 29 octubre 2026. La inspección de los endpoints JSON se hizo con la sesión del propietario, sin recuperar tokens ni modificar permisos. Ningún registro recibido se incorpora al código público.

## Uso

1. Abrir `recepcion-kobo.html` en la aplicación SmartRisk.
2. Seleccionar el formulario de origen y abrir su JSON con sesión Kobo.
3. Copiar el JSON completo al receptor o abrir un archivo JSON descargado.
4. Pulsar Recibir registros. Revisar origen, UUID, código territorial, observación, acción, faltantes y datos originales.
5. Guardar en este dispositivo o descargar respaldo. El respaldo puede abrirse desde el selector de archivos.

El importador acepta lista JSON o respuesta API con `results`. Rechaza páginas incompletas (`next` o count desigual); no realiza llamadas de red ni envía datos a GitHub. Límite: 2000 registros/10 MB por lote.

UUID e ID se usan con el UID del formulario como clave de origen. Un reingreso idéntico se omite; un registro modificado conserva la versión anterior durante la sesión y se recibe nuevamente como reportado. Los grupos repetibles y metadatos se conservan en el original, sin reducirlos a columnas. No se descargan adjuntos; sus referencias pueden requerir acceso Kobo.

Las comunidades y estaciones geotécnicas no se fusionan por nombre. La correspondencia territorial requiere revisión y todavía no se implementó. Recibir datos no los valida científicamente. El receptor no tiene controles para atribuir validación técnica.

## Límites y siguientes pasos

- La copia desde Kobo es manual. No configurar webhooks hacia GitHub Pages: no es un receptor de servidor.
- La futura sincronización automática requiere servicio privado, credenciales protegidas, paginación, registro de cambios, control de acceso y pruebas de extremo a extremo.
- Los borradores guardados son locales al navegador, no se comparten entre equipos.
- La restauración del respaldo reconstruye los registros como reportados; no restaura una validación ni un historial de revisión.

## Comprobaciones

`node kobo-bridge.test.cjs`: origen correcto, detección de duplicados, actualización con historial, preservación de repetibles, rechazo de lotes incompletos y ausencia de IDs. Datos de prueba completamente ficticios.

## Referencia técnica

- https://support.kobotoolbox.org/api
- https://support.kobotoolbox.org/export_download.html
