// Conexión privada Kobo. La credencial se guarda en UserProperties del operador.
const KOBO_FORMS = [
  {uid:'axouQbKCtMo3YAPMVoKkyh',name:'Comunitario'},
  {uid:'a8LkrUBpB7KjDCu6NzDkNt',name:'Geológico y geotécnico'}
];
const KOBO_SYNC_HEADERS = {
  Sincronizacion:['fecha','formulario_uid','formulario','estado','registros','lote','detalle'],
  Kobo_Registros:['fecha_sync','formulario_uid','uuid','id_kobo','fecha_envio','version_formulario','hash_registro','lote','validacion']
};
function configurarKobo(){
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(KOBO_SETUP_HTML).setWidth(660).setHeight(500),'Conexión privada Kobo');
}
function koboSheets_(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  if(!ss||ss.getId()!=='17FlNM_1ftJs4Qpx1yV4DYiQ4qjyZdnWLc5JEP347IDY')throw Error('No se encontró el registro central vinculado.');
  for(const name of Object.keys(KOBO_SYNC_HEADERS)){
    let s=ss.getSheetByName(name);
    if(!s){s=ss.insertSheet(name);s.getRange(1,1,1,KOBO_SYNC_HEADERS[name].length).setValues([KOBO_SYNC_HEADERS[name]]);s.setFrozenRows(1);s.getRange(1,1,1,KOBO_SYNC_HEADERS[name].length).setFontWeight('bold').setBackground('#eeeeee');}
    if(JSON.stringify(s.getRange(1,1,1,KOBO_SYNC_HEADERS[name].length).getDisplayValues()[0])!==JSON.stringify(KOBO_SYNC_HEADERS[name]))throw Error('Encabezados alterados en '+name+'.');
  }
  return ss;
}
function koboAppend_(ss,name,rows){if(!rows.length)return;const s=ss.getSheetByName(name);s.getRange(s.getLastRow()+1,1,rows.length,KOBO_SYNC_HEADERS[name].length).setNumberFormat('@').setValues(rows.map(r=>r.map(smartLiteral_)));SpreadsheetApp.flush();}
function koboHash_(text){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,text).map(b=>(b+256).toString(16).slice(-2)).join('');}
function koboCanonical_(v){if(Array.isArray(v))return '['+v.map(koboCanonical_).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+koboCanonical_(v[k])).join(',')+'}';return JSON.stringify(v);}
function koboUrl_(url,uid){
  const root='https://kf.kobotoolbox.org/api/v2/assets/'+uid+'/data/';
  if(typeof url!=='string'||!(url===root||url.startsWith(root+'?')))throw Error('Paginación fuera del formulario autorizado.');
  return url;
}
function koboFetch_(url,uid,token){
  const response=UrlFetchApp.fetch(koboUrl_(url,uid),{method:'get',headers:{Authorization:'Token '+token,Accept:'application/json'},muteHttpExceptions:true,followRedirects:false});
  const status=response.getResponseCode();
  if(status!==200)throw Error(status===401||status===403?'Acceso Kobo rechazado. Revisa la clave y los permisos de ambos formularios.':'Kobo devolvió HTTP '+status+'. Se conservó el respaldo anterior.');
  const text=response.getContentText();if(text.length>5000000)throw Error('La página supera 5 MB.');
  try{return JSON.parse(text)}catch(e){throw Error('Respuesta Kobo no válida.');}
}
function koboReadAll_(form,token){
  let url='https://kf.kobotoolbox.org/api/v2/assets/'+form.uid+'/data/?format=json&limit=500',count=null,records=[],pages=0;const visited=new Set(),ids=new Set();
  while(url){
    if(visited.has(url)||++pages>50)throw Error('Paginación repetida o demasiado extensa.');visited.add(url);
    const page=koboFetch_(url,form.uid,token);
    if(!page||!Array.isArray(page.results)||!Number.isSafeInteger(page.count)||page.count<0)throw Error('Estructura de respuesta Kobo inesperada.');
    if(count===null)count=page.count;else if(count!==page.count)throw Error('Los envíos cambiaron durante la consulta. Se reintentará en la próxima actualización.');
    if(count>10000)throw Error('Más de 10.000 envíos. Requiere ajustar la estrategia de carga.');
    for(const record of page.results){const id=String(record._uuid||record._id||'');if(!id||ids.has(id))throw Error('Envío sin identificador o repetido.');ids.add(id);records.push(record);}
    url=page.next||null;if(url)koboUrl_(url,form.uid);
  }
  if(records.length!==count)throw Error('Lote incompleto. Se conservó el respaldo anterior.');
  records.sort((a,b)=>String(a._uuid||a._id).localeCompare(String(b._uuid||b._id)));
  const text=koboCanonical_({formUid:form.uid,formName:form.name,records});
  if(text.length>5000000)throw Error('El respaldo completo supera 5 MB.');return {records,text};
}
function koboStatus(){
  const ss=koboSheets_(),s=ss.getSheetByName('Sincronizacion'),rows=s.getLastRow()>1?s.getRange(2,1,s.getLastRow()-1,7).getDisplayValues():[];
  const latest=KOBO_FORMS.map(f=>{const row=rows.filter(r=>r[1]===f.uid).pop();return {form:f.name,last:row||null};});
  return {credentialConfigured:!!PropertiesService.getUserProperties().getProperty('KOBO_API_TOKEN'),hourlyTriggers:ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='sincronizarKoboProgramado').length,latest};
}
function guardarConexionKobo(token){
  if(typeof token!=='string'||!/^[A-Za-z0-9_-]{20,200}$/.test(token.trim()))throw Error('Revisa la clave API.');token=token.trim();
  // Comprobar ambos formularios antes de guardar la credencial o instalar el horario.
  for(const form of KOBO_FORMS)koboFetch_('https://kf.kobotoolbox.org/api/v2/assets/'+form.uid+'/data/?format=json&limit=1',form.uid,token);
  PropertiesService.getUserProperties().setProperty('KOBO_API_TOKEN',token);
  const result=sincronizarKoboProgramado();
  if(result.some(r=>!r.ok))throw Error('Clave guardada, pero la primera sincronización no terminó. '+result.filter(r=>!r.ok).map(r=>r.form+': '+r.detail).join(' '));
  const triggers=ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='sincronizarKoboProgramado');
  if(!triggers.length)ScriptApp.newTrigger('sincronizarKoboProgramado').timeBased().everyHours(1).create();
  return koboStatus();
}
function sincronizarKoboProgramado(){
  const lock=LockService.getScriptLock();if(!lock.tryLock(3000))return [{ok:false,form:'Ambos',detail:'Ya hay una sincronización en curso.'}];
  try{
    const token=PropertiesService.getUserProperties().getProperty('KOBO_API_TOKEN');if(!token)throw Error('Falta configurar la clave API privada de Kobo.');
    const ss=koboSheets_(),results=[];
    for(const form of KOBO_FORMS){
      try{
        const batch=koboReadAll_(form,token),saved=centralArchive(batch.text),at=new Date().toISOString(),index=ss.getSheetByName('Kobo_Registros');
        const indexed=index.getLastRow()>1&&index.getRange(2,8,index.getLastRow()-1,1).getDisplayValues().some(r=>r[0]===saved.id);
        if(!indexed)koboAppend_(ss,'Kobo_Registros',batch.records.map(r=>[at,form.uid,String(r._uuid||r._id),String(r._id||''),String(r._submission_time||''),String(r.__version__||r._version||''),koboHash_(koboCanonical_(r)),saved.id,'Reportado; pendiente de revisión técnica']));
        koboAppend_(ss,'Sincronizacion',[[at,form.uid,form.name,'OK',batch.records.length,saved.id,saved.duplicate?'Sin cambios; respaldo existente conservado.':'Respaldo completo recibido.']]);
        results.push({ok:true,form:form.name,count:batch.records.length,archive:saved.id});
      }catch(e){const detail=String(e.message||'Error de sincronización').slice(0,500);koboAppend_(ss,'Sincronizacion',[[new Date().toISOString(),form.uid,form.name,'ERROR','','',detail]]);results.push({ok:false,form:form.name,detail});}
    }
    return results;
  }finally{lock.releaseLock();}
}
const KOBO_SETUP_HTML=`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>body{font:15px Arial;padding:20px;color:#18374b}input{width:95%;padding:12px}button{padding:12px;margin-top:14px;background:#1263a2;color:white;border:0;border-radius:6px}#status{white-space:pre-wrap;padding:12px;background:#eef4f9}</style></head><body><h2>Formularios Kobo privados</h2><p>Comunitario y geológico/geotécnico. Actualización cada hora, bajo tu cuenta de Google.</p><p>Ingresa aquí tu clave API de Kobo. Se guarda en las propiedades privadas del usuario que configura la conexión. No se muestra en la hoja ni se publica en GitHub.</p><label>Clave API de Kobo<input id="key" type="password" autocomplete="off"></label><button id="connect">Comprobar, sincronizar y activar cada hora</button><button id="check">Consultar estado</button><pre id="status" role="status">Pendiente de configurar.</pre><script>
const key=document.getElementById('key'),status=document.getElementById('status'),button=document.getElementById('connect');
function show(s){status.textContent=(s.credentialConfigured?'Clave configurada.':'Falta clave.')+' Actualizadores horarios: '+s.hourlyTriggers+'\\n'+s.latest.map(x=>x.form+': '+(x.last?x.last[3]+' · '+x.last[0]+' · '+x.last[4]+' registros':'Sin ejecución confirmada')).join('\\n')}
button.onclick=()=>{button.disabled=true;status.textContent='Comprobando y sincronizando…';google.script.run.withSuccessHandler(s=>{key.value='';button.disabled=false;show(s)}).withFailureHandler(e=>{key.value='';button.disabled=false;status.textContent=e.message}).guardarConexionKobo(key.value)};
document.getElementById('check').onclick=()=>google.script.run.withSuccessHandler(show).withFailureHandler(e=>status.textContent=e.message).koboStatus();
</script></body></html>`;
