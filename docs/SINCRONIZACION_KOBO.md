# Actualización periódica Kobo

Conector instalado en el Apps Script del registro central. Estado: preparado; falta la clave API privada y confirmar la primera lectura. No hay horario activo confirmado.

Formularios permitidos exclusivamente:
- Comunitario: axouQbKCtMo3YAPMVoKkyh.
- Geológico/geotécnico: a8LkrUBpB7KjDCu6NzDkNt.

## Activar

Abrir la hoja central, menú SmartRisk > Conectar formularios Kobo. Revisar los permisos nuevos de Google para conexiones externas y ejecución programada. El titular ingresa su clave API en el campo de contraseña y pulsa Comprobar, sincronizar y activar cada hora. No enviar la clave por chat ni escribirla en las celdas o en el repositorio.

La credencial se conserva en UserProperties del operador. El script solo consulta por GET los dos formularios definidos, en kf.kobotoolbox.org, sin seguir redirecciones. Kobo puede otorgar a la clave acceso al resto de la cuenta: el código restringe las consultas, pero la clave no es un permiso por formulario. Preferir una cuenta de integración con acceso de lectura limitado si se administra un conjunto mayor de datos.

El horario cada hora se crea únicamente si la primera sincronización de ambos formularios termina correctamente. Consultar estado confirma si hay un actualizador horario. Cada ejecución utiliza la cuenta que lo instaló. La hora exacta depende del programador de Google.

## Datos y errores

Sigue todas las páginas antes de guardar. Rechaza lotes incompletos, IDs repetidos, enlaces fuera del formulario y volúmenes superiores a los límites definidos. Un formulario puede sincronizar aunque el otro falle; cada resultado queda diferenciado.

Datos_Kobo conserva cada lote completo como JSON con huella SHA-256. Kobo_Registros indexa los envíos por lote. Sincronizacion registra fecha, formulario, resultado, total y referencia del lote. El mismo lote no se duplica. Los registros recibidos se consideran reportados, pendientes de revisión técnica. Los respaldos anteriores no se borran.

Si cambia la cantidad de envíos durante la paginación, se conserva el respaldo anterior y se reintenta en la siguiente ejecución. Los archivos adjuntos se referencian en el JSON; no se descargan los binarios. La cabina pública no se sincroniza automáticamente con esta hoja.

## Verificación

`node apps-script/kobo-sync.test.cjs`: nueve comprobaciones locales. Prueba integral pendiente de la credencial. Verificar primera lectura de ambos formularios, repetir sin duplicados y comprobar una ejecución real del horario.

Referencias oficiales:
- https://support.kobotoolbox.org/migrating_api.html
- https://support.kobotoolbox.org/api
- https://developers.google.com/apps-script/guides/triggers/installable
