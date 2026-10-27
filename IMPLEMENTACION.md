# GeoPro.ec · SmartRisk 1.0

Primera interfaz de registro guiado y cuadro sinóptico dinámico. Implementación parcial del flujo de SmartRisk; no sustituye al XLSForm completo.

## Uso
Abrir index.html con engine.js, app.js y style.css en la misma carpeta, o servir el repositorio como sitio estático. Sin dependencias externas.

- Cinco etapas: responsables, territorio, exposición, análisis y revisión.
- Guardado local manual, recuperación al abrir y exportación/importación JSON.
- Impresión del cuadro sinóptico.
- Comparación independiente de FS estático y pseudoestático con mínimos declarados.
- SMR es un resultado externo, sin reconstrucción de factores.
- No calcula RMR ni índice global territorial. No valida científicamente los resultados.
- No hay envío a Kobo, autenticación de operadores, almacenamiento central ni carga de adjuntos.
- Los campos mínimos de esta interfaz son un subconjunto; “borrador registrado” no implica completar todos los requisitos del formulario Kobo.

## Privacidad
El código es público. La aplicación no transmite los datos de la ficha a GitHub ni a Kobo. El usuario puede guardar datos en el navegador o descargarlos; un dispositivo compartido puede exponer los borradores guardados. No incluir registros reales ni credenciales en el repositorio.

## Publicación en GitHub Pages
En Settings > Pages, elegir Deploy from a branch, rama main y carpeta / (root), y guardar. Comprobar la URL que devuelva GitHub. La publicación no se ha habilitado automáticamente.

## Verificación
Ejecutar `node test.cjs` y `node --check app.js`. 18 comprobaciones locales de lógica, no escenarios enviados a Kobo. Prueba visual, móvil, impresión y persistencia real de navegador pendientes.

## Referencias
- Romana, M., Tomás, R., & Serón, J. B. (2015). Slope Mass Rating (SMR) geomechanics classification: thirty years review. ISRM Congress. https://personal.ua.es/es/roberto-tomas/documentos/isrm-smr.pdf
- MIDUVI (2015). Norma Ecuatoriana de la Construcción, capítulos NEC-SE-GC y NEC-SE-DS. Consultar la edición y condiciones aplicables. https://www.mit.gob.ec/norma-ecuatoriana-de-la-construccion/
- KoboToolbox. XLSForm with KoboToolbox. https://support.kobotoolbox.org/xlsform_with_kobotoolbox.html
