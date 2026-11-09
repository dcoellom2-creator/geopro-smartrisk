# Inventario de herramientas del ecosistema GeoPro

Corte: 8 de noviembre de 2026. Revisión documental y de código; no equivale a validación operativa ni científica. Vinculado a la tarea #1.

## Criterios de evidencia

- **Código inspeccionado:** archivos accesibles revisados; no demuestra despliegue ni operación remota.
- **Documento/archivo localizado:** se revisó contenido del artefacto indicado; no demuestra envío, sincronización o vigencia del despliegue.
- **Propuesto:** todavía no se ha seleccionado o verificado una herramienta concreta.
- Desarrollo, verificación e integración son campos independientes.

## Ocho módulos

| ID | Módulo | Activo / función | Evidencia revisada | Estado y límite | Próxima acción |
|---|---|---|---|---|---|
| COM-01 | Comunidad y capacidades | Kobo_Comites_Comunitarios_Formulario_Piloto.xlsx: jornadas, código estable de comunidad, módulos condicionales y seguimiento | Archivo versión 1, modificado 29-10-2026; contenido de survey revisado y guía de uso del 30-10 | Componente para piloto. Despliegue, captura y recepción no comprobados en esta revisión | Verificar XLSForm completo, versión de settings, enlace autorizado y envío de prueba |
| GEO-01 | Geociencias y amenazas | Ficha web SmartRisk: responsables, territorio, exposición, análisis y revisión | Código de este repositorio, commit 56ba48d; engine.js, app.js e IMPLEMENTACION.md | Implementación parcial. 18 comprobaciones locales de lógica aprobadas. Guardado local y JSON; sin envío a Kobo, autenticación ni almacenamiento central | Probar interfaz, móvil, persistencia e importación/exportación en navegador; definir intercambio |
| GEO-02 | Geociencias y amenazas | XLSForm geomecánico RMR/SMR | Archivo herramienta_campo_geomecanica_rmr_smr_kobo.xlsx localizado y primeras secciones revisadas; antecedente de junio de 2026 | Antecedente localizado; no se certifica que sea el formulario maestro vigente. No confundir con la ficha web GEO-01 | Conciliar con versión de octubre y comprobar versión completa, fórmulas, acceso y prueba Kobo |
| INF-01 | Infraestructura y servicios | Fichas de inspección e inventario de servicios | Necesidad aprobada en el ecosistema | Propuesto; sin herramienta seleccionada ni integración | Definir tipos de activos, condición, funcionamiento, dependencias y responsable técnico |
| TRA-01 | Transporte y accesibilidad | Inventario vial, puentes, interrupciones y alternativas | Necesidad aprobada en el ecosistema | Propuesto; los campos de accesibilidad de otras herramientas no constituyen un módulo vial completo | Definir inventario y protocolo de verificación de rutas |
| AGR-01 | Agricultura y ganadería | Registros productivos, agua, cultivos y animales | Necesidad aprobada en el ecosistema | Propuesto; sin herramienta seleccionada ni integración | Definir unidad productiva, temporalidad, exposición y revisión sectorial |
| ECO-01 | Economía y continuidad | Diagnóstico de dependencias, interrupciones y recuperación | Necesidad aprobada en el ecosistema | Propuesto; sin herramienta seleccionada ni integración | Definir procesos, cadenas, criterios y evidencia económica |
| AMB-01 | Ambiente y territorio | SIG, uso del suelo, drenajes y cambios territoriales | Necesidad aprobada en el ecosistema | Propuesto; no se ha seleccionado un conjunto de datos ni herramienta para este módulo | Definir escala, CRS, fuente, licencia, fecha y actualización |
| EMR-01 | Emergencias y MATPEL | Cabina SCI NaTech/HAZMAT | Árbol de código accesible; docs/V17_2_GPS_PERSISTENTE.md revisado en repositorio independiente | Código y documentación localizados. La documentación describe persistencia GPS; no se repitió la prueba multiusuario ni se comprobó operación actual | Ensayo controlado, dependencias, permisos y revisión de intercambio con SmartRisk |

**Integración con el SmartRisk central del ecosistema:** no comprobada para ninguno de los módulos. La ficha web GEO-01 se llama SmartRisk, pero es una implementación parcial de captura; no acredita por sí sola el centro integrador propuesto.

## Recursos transversales

| ID | Recurso | Evidencia y función | Límite / siguiente paso |
|---|---|---|---|
| FOR-01 | Promter Risk | README del repositorio describe v0.14.2; archivos control/program/panelist-live-v142 existen. Apoya formación, conducción y presentación | Sin ensayo audiovisual nuevo. README contiene historia de arquitecturas; inspeccionar código vigente antes de confirmar transporte y sincronización |
| WEB-01 | GeoPro.ec | Ecosistema circular aprobado y publicado, versión Sites 12 | Presentación demostrativa; activar sectores no conecta sistemas ni envía datos |
| DAT-01 | Estudios universitarios, drones, fotogrametría y fuentes oficiales | Recursos previstos para alimentar varios sectores | Registrar cada fuente concreta, versión, derechos de uso, escala y evidencia antes de incorporarla |

## Enlaces de código verificados

- [Ficha web SmartRisk y documentación](https://github.com/dcoellom2-creator/geopro-smartrisk)
- [Promter Risk: arquitectura e historial](https://github.com/dcoellom2-creator/cabina-sci-natech-hazmat/blob/main/crigmpal-control/README.md)
- [Cabina: persistencia GPS documentada](https://github.com/dcoellom2-creator/cabina-sci-natech-hazmat/blob/main/docs/V17_2_GPS_PERSISTENTE.md)
- [Ecosistema público](https://geopro.ec/#ecosistema-digital)

Los enlaces de captura Kobo no se publican aquí hasta comprobar correspondencia con la versión y autorización de distribución. Los formularios localizados permanecen en su fuente documental; no se copiaron datos de campo al repositorio.

## Brechas prioritarias

1. Identificar inequívocamente el XLSForm geomecánico vigente: el antecedente localizado es anterior a revisiones documentadas en octubre.
2. Probar el formulario comunitario desplegado: archivo existente no implica captura y recepción correctas.
3. Definir identificadores territoriales comunes sin perder códigos de origen. El comunitario ya declara código de comunidad, proyecto y jornada.
4. Mantener separados dato observado, resultado externo, revisión, recomendación y decisión.
5. Definir almacenamiento central y acceso del panel interno; GitHub Pages y localStorage no equivalen a una base compartida.
6. Seleccionar herramientas para infraestructura, transporte, agricultura/ganadería, economía y ambiente después de definir requisitos.

## Responsables y aceptación

Responsables operativos, revisores y fechas: por confirmar. No se atribuye aceptación técnica a autores o colaboradores por aparecer en documentos anteriores.

Tarea #1 permanece abierta: inventario inicial documentado; falta verificación funcional, conciliación de versiones y revisión de aceptación. No se asigna porcentaje global.

## Fuentes y alcance

- Código de geopro-smartrisk, commit 56ba48d: 18 comprobaciones de lógica ejecutadas en esta revisión; no son 18 pruebas de integración.
- Kobo_Comites_Comunitarios_Formulario_Piloto.xlsx, versión 1, 29-10-2026: lectura parcial de survey.
- GeoPro_CRIGMPAL_Comites_Comunitarios_NotebookLM.pdf, 30-10-2026: propósito y recorrido del piloto.
- herramienta_campo_geomecanica_rmr_smr_kobo.xlsx, 23-06-2026: lectura parcial de control, ubicación y geometría; no certifica versión vigente ni fórmulas.
- Comparación documental de formulario geomecánico, 29-10-2026: evidencia de revisiones posteriores y pruebas locales, sin prueba de envío Kobo. No se reproduce el caso privado.
- README Promter Risk y documento V17.2: documentación inspeccionada; afirmaciones de pruebas históricas no se cuentan como pruebas nuevas.

## Actualización de conexión · 8 noviembre 2026

Sesión Kobo del propietario revisada: comunitario `axouQbKCtMo3YAPMVoKkyh`, v1 (204 preguntas); geológico/geotécnico `a8LkrUBpB7KjDCu6NzDkNt`, v6 (295 preguntas). Ambos implementados y con un envío. Se inspeccionaron los campos de sus respuestas JSON con sesión autorizada, sin recuperar credenciales. Esto resuelve la identificación de la versión geotécnica desplegada; no certifica la equivalencia con archivos anteriores.

Implementado receptor por lotes JSON: [documentación de conexión](CONEXION_KOBO.md). Conserva origen, UUID, códigos territoriales y grupos repetibles, distingue duplicados y mantiene recepción como reportado. Sin sincronización automática ni base central. La afirmación anterior de ausencia de integración debe leerse ahora como ausencia de integración automática: ya existe una vía de recepción por lotes, pendiente de completar ensayo publicado.
