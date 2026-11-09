/** @OnlyCurrentDoc */
// SmartRisk: registro privado vinculado a la hoja. Sin endpoint público.
const SMART_HEADERS = {
  Informacion: ['id','titulo','categoria','modulo','detalle','fuente','responsable','etiquetas','creado','actualizado','version'],
  Tareas: ['id','titulo','modulo','responsable','fecha','estado','prioridad','evidencia','notas','creado','actualizado','version'],
  Bitacora: ['fecha','tipo','id','accion','version','resumen'],
  Datos_Kobo: ['lote','parte','total','json','fecha','sha256']
};
function onOpen() { SpreadsheetApp.getUi().createMenu('SmartRisk').addItem('Abrir registro central','abrirRegistro').addToUi(); }
function abrirRegistro() {
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(SMART_HTML).setWidth(1100).setHeight(720),'SmartRisk · Registro central');
}
function smartSheet_(name) {
  const s=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if(!s || JSON.stringify(s.getRange(1,1,1,SMART_HEADERS[name].length).getDisplayValues()[0])!==JSON.stringify(SMART_HEADERS[name])) throw Error('La estructura de '+name+' cambió. No se escribieron datos.');
  return s;
}
function smartLatest_(name) {
  const s=smartSheet_(name), heads=SMART_HEADERS[name], map=Object.create(null);
  if(s.getLastRow()<2)return [];
  s.getRange(2,1,s.getLastRow()-1,heads.length).getDisplayValues().forEach(row=>{
    if(!row[0])return;
    const x={};heads.forEach((h,i)=>x[h]=row[i]);x.version=Number(x.version);
    if(!Number.isSafeInteger(x.version)||x.version<1)throw Error('Versión inválida en '+name+'.');
    if(!map[x.id]||map[x.id].version<x.version)map[x.id]=x;
    else if(map[x.id].version===x.version)throw Error('Versión repetida. Revisar '+name+'.');
  });return Object.keys(map).map(k=>map[k]);
}
function smartText_(value,max) {const x=String(value==null?'':value).trim();if(x.length>max)throw Error('Texto demasiado largo. Máximo '+max+' caracteres.');return x;}
function smartLiteral_(x){return typeof x==='string'&&/^[=+\-@']/.test(x)?"'"+x:x;}
function smartAppend_(name,rows){if(!rows.length)return;const s=smartSheet_(name);s.getRange(s.getLastRow()+1,1,rows.length,SMART_HEADERS[name].length).setNumberFormat('@').setValues(rows.map(r=>r.map(smartLiteral_)));SpreadsheetApp.flush();}
function centralList(){
  return {informacion:smartLatest_('Informacion'),tareas:smartLatest_('Tareas'),lotes:smartArchives_(),at:new Date().toISOString()};
}
function centralSave(kind,input,expectedVersion){
  if(!['Informacion','Tareas'].includes(kind))throw Error('Tipo inválido.');
  const lock=LockService.getDocumentLock();lock.waitLock(20000);
  try{
    const all=smartLatest_(kind),id=smartText_(input.id,100);
    if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id))throw Error('Identificador inválido.');
    const old=all.find(x=>x.id===id),actual=old?old.version:0;
    if(Number(expectedVersion)!==actual)throw Error('Otro guardado cambió este registro. Actualiza y revisa antes de guardar; tu formulario sigue disponible.');
    const x={};SMART_HEADERS[kind].forEach(h=>x[h]=smartText_(input[h],h==='titulo'?200:20000));
    if(!x.titulo)throw Error('Escribe un título.');
    if(kind==='Tareas'){
      if(!['Pendiente','En curso','Bloqueado','En revisión','Terminado'].includes(x.estado)||!['Alta','Media','Baja'].includes(x.prioridad))throw Error('Estado o prioridad inválidos.');
      if(x.fecha&&(!/^\d{4}-\d{2}-\d{2}$/.test(x.fecha)||new Date(x.fecha+'T12:00:00Z').toISOString().slice(0,10)!==x.fecha))throw Error('Fecha inválida.');
      if(x.estado==='Terminado'&&(!x.responsable||!x.evidencia))throw Error('Terminado requiere responsable y evidencia.');
    }
    x.id=id;x.creado=old?old.creado:new Date().toISOString();x.actualizado=new Date().toISOString();x.version=actual+1;
    // Cada versión se agrega. Las versiones anteriores no se sobrescriben.
    smartAppend_(kind,[SMART_HEADERS[kind].map(h=>x[h])]);
    let warning='';try{smartAppend_('Bitacora',[[x.actualizado,kind,id,old?'Nueva versión':'Creado',x.version,x.titulo]]);}catch(e){warning='Guardado confirmado; bitácora auxiliar pendiente: '+e.message;}
    return {record:x,warning};
  }finally{lock.releaseLock();}
}
function smartArchives_(){
  const s=smartSheet_('Datos_Kobo');if(s.getLastRow()<2)return [];
  return s.getRange(2,1,s.getLastRow()-1,6).getDisplayValues().filter(r=>r[1]==='1').map(r=>({id:r[0],partes:Number(r[2]),fecha:r[4],hash:r[5]}));
}
function centralArchive(text){
  if(typeof text!=='string'||text.length>5000000)throw Error('Máximo 5 MB de texto JSON.');
  const d=JSON.parse(text);
  if(!(Array.isArray(d)||(d&&Array.isArray(d.records))||(d&&Array.isArray(d.results))))throw Error('Se necesita un lote o respaldo Kobo JSON.');
  if(d.next)throw Error('Lote paginado incompleto. Descarga todas las páginas.');
  const lock=LockService.getDocumentLock();lock.waitLock(20000);
  try{
    const hash=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,text).map(b=>(b+256).toString(16).slice(-2)).join('');
    const existing=smartArchives_().find(x=>x.hash===hash);if(existing)return {id:existing.id,duplicate:true};
    const id=Utilities.getUuid(),at=new Date().toISOString(),parts=Math.ceil(text.length/30000),rows=[];
    for(let i=0;i<parts;i++)rows.push([id,i+1,parts,text.slice(i*30000,(i+1)*30000),at,hash]);
    smartAppend_('Datos_Kobo',rows);return {id,duplicate:false};
  }finally{lock.releaseLock();}
}
function centralArchiveRead(id){
  const s=smartSheet_('Datos_Kobo');if(s.getLastRow()<2)throw Error('Lote no encontrado.');
  const rows=s.getRange(2,1,s.getLastRow()-1,6).getDisplayValues().filter(r=>r[0]===id).sort((a,b)=>Number(a[1])-Number(b[1]));
  if(!rows.length||rows.length!==Number(rows[0][2])||rows.some((r,i)=>Number(r[1])!==i+1||r[2]!==rows[0][2]||r[5]!==rows[0][5]))throw Error('El lote está incompleto.');
  const text=rows.map(r=>r[3]).join('');const hash=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,text).map(b=>(b+256).toString(16).slice(-2)).join('');
  if(hash!==rows[0][5])throw Error('El lote cambió. Revisar su integridad.');return text;
}
const SMART_HTML = `<!doctype html><html lang="es"><head><base target="_blank"><meta charset="utf-8"><style>
body{font:15px Arial;background:#f3f7fb;color:#163044;margin:24px}h1{font-size:25px}button,input,select,textarea{font:inherit;padding:10px;border:1px solid #b8c8d6;border-radius:6px}button{cursor:pointer;background:white}button.primary{background:#1163a2;color:white}nav{display:flex;gap:8px;margin:20px 0}label{display:grid;gap:5px}form{display:grid;grid-template-columns:1fr 1fr;gap:13px;background:white;padding:20px;border-radius:10px}textarea{min-height:90px}.wide{grid-column:1/-1}#status{padding:12px;background:#e4eef8;white-space:pre-wrap}article{background:white;border:1px solid #d6e1e8;border-radius:8px;padding:14px;margin:10px 0}small{color:#526779}#results{max-height:280px;overflow:auto}#query{width:70%}.hidden{display:none!important}</style></head><body>
<h1>SmartRisk · Registro central</h1><p>Información y tareas guardadas en tu Google Sheets. Cada edición conserva la versión anterior.</p>
<div id="status" role="status" aria-live="polite">Consultando Google Sheets…</div>
<nav><button id="info">Información</button><button id="tasks">Tareas</button><button id="refresh">Actualizar consulta</button><button id="new">Nuevo registro</button></nav>
<input id="query" aria-label="Buscar información" placeholder="Buscar título, módulo, responsable o etiquetas"><div id="results"></div>
<form id="editor"><label>Título<input name="titulo" required maxlength="200"></label><label>Módulo<input name="modulo" maxlength="200"></label><label>Responsable<input name="responsable" maxlength="200"></label>
<label class="only-info">Categoría<input name="categoria" maxlength="200" placeholder="Acuerdo, enlace, procedimiento, nota"></label><label class="only-info">Etiquetas<input name="etiquetas" maxlength="500"></label><label class="only-info">Fuente o enlace<input name="fuente" maxlength="2000"></label><label class="wide only-info">Información<textarea name="detalle" maxlength="20000"></textarea></label>
<label class="only-task">Fecha<input name="fecha" type="date"></label><label class="only-task">Estado<select name="estado"><option>Pendiente</option><option>En curso</option><option>Bloqueado</option><option>En revisión</option><option>Terminado</option></select></label><label class="only-task">Prioridad<select name="prioridad"><option>Media</option><option>Alta</option><option>Baja</option></select></label><label class="wide only-task">Evidencia<textarea name="evidencia" maxlength="20000"></textarea></label><label class="wide only-task">Notas<textarea name="notas" maxlength="20000"></textarea></label>
<div class="wide"><button class="primary" id="save">Guardar en Google Sheets</button> <span id="version"></span></div></form>
<h2>Trasladar datos existentes</h2><p>Importa el respaldo JSON de tareas descargado desde Administración de la cabina. Los IDs existentes se conservan; la importación se puede repetir sin duplicarlos.</p><input id="import-tasks" type="file" accept=".json" aria-label="Importar tareas de la cabina">
<h2>Respaldo de lotes Kobo</h2><p>Guarda el JSON completo y consúltalo desde otro equipo. No descarga automáticamente desde Kobo ni valida técnicamente sus datos.</p><input id="import-kobo" type="file" accept=".json" aria-label="Guardar respaldo Kobo"><div id="archives"></div>
<script>
const $=id=>document.getElementById(id),form=$('editor');let data={informacion:[],tareas:[],lotes:[]},kind='Informacion',editing=null,busy=false,dirty=false;
function msg(t){$('status').textContent=t}function rpc(fn,...args){return new Promise((resolve,reject)=>google.script.run.withSuccessHandler(resolve).withFailureHandler(reject)[fn](...args))}
function lock(v){busy=v;document.querySelectorAll('button,input,select,textarea').forEach(n=>n.disabled=v)}
function current(){return kind==='Informacion'?data.informacion:data.tareas}
function draw(){const q=$('query').value.toLocaleLowerCase();$('results').replaceChildren();current().filter(x=>Object.values(x).join(' ').toLocaleLowerCase().includes(q)).forEach(x=>{const a=document.createElement('article'),t=document.createElement('strong'),p=document.createElement('p'),b=document.createElement('button');t.textContent=x.titulo;p.textContent=[x.modulo,x.responsable,'Versión '+x.version,x.actualizado].filter(Boolean).join(' · ');b.textContent='Consultar / editar';b.onclick=()=>{if(dirty&&!confirm('Hay cambios sin guardar. ¿Descartarlos para abrir otro registro?'))return;edit(x)};a.append(t,p,b);$('results').append(a)});$('archives').replaceChildren();data.lotes.forEach(x=>{const b=document.createElement('button');b.textContent='Descargar lote '+x.fecha;b.onclick=async()=>{try{download(await rpc('centralArchiveRead',x.id),'Kobo_'+x.id+'.json')}catch(e){msg(e.message)}};$('archives').append(b)})}
function download(text,name){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function edit(x){editing=x?{...x}:{id:crypto.randomUUID(),version:0};form.reset();for(const el of form.elements)if(el.name&&x&&x[el.name]!=null)el.value=x[el.name];$('version').textContent=x?'Versión '+x.version:'Nuevo registro';dirty=false}
async function load(){const d=await rpc('centralList');data=d;draw();msg('Consulta actualizada desde Google Sheets: '+d.at)}
function switchKind(k){if(dirty&&!confirm('Hay cambios sin guardar. ¿Descartarlos para cambiar de apartado?'))return;kind=k;document.querySelectorAll('.only-info').forEach(n=>n.classList.toggle('hidden',k!=='Informacion'));document.querySelectorAll('.only-task').forEach(n=>n.classList.toggle('hidden',k!=='Tareas'));edit(null);draw()}
$('info').onclick=()=>switchKind('Informacion');$('tasks').onclick=()=>switchKind('Tareas');$('new').onclick=()=>{if(!dirty||confirm('¿Descartar cambios sin guardar?'))edit(null)};$('query').oninput=draw;form.oninput=()=>{dirty=true;msg('Cambios pendientes de guardar en Google Sheets.')};
$('refresh').onclick=async()=>{lock(true);try{await load()}catch(e){msg('No se pudo consultar: '+e.message)}finally{lock(false)}};
form.onsubmit=async e=>{e.preventDefault();if(busy)return;const payload={...editing};new FormData(form).forEach((v,k)=>payload[k]=v);lock(true);msg('Guardando en Google Sheets…');try{const r=await rpc('centralSave',kind,payload,editing.version);edit(r.record);await load();msg(r.warning||'Guardado confirmado en Google Sheets · versión '+r.record.version)}catch(e){msg('No se confirmó el guardado: '+e.message+' Conserva el formulario y revisa la consulta antes de reintentar.')}finally{lock(false)}};
$('import-tasks').onchange=async e=>{const f=e.target.files[0];if(!f)return;lock(true);let added=0,skipped=0;try{if(f.size>5000000)throw Error('Máximo 5 MB.');const d=JSON.parse(await f.text());if(d.schema!=='geopro-control-v1'||!Array.isArray(d.tasks)||d.tasks.length>1000)throw Error('Respaldo de cabina incompatible.');await load();const ids=new Set(data.tareas.map(x=>x.id));for(const t of d.tasks){if(ids.has(t.id)){skipped++;continue}await rpc('centralSave','Tareas',{id:t.id,titulo:t.title,modulo:t.module,responsable:t.owner,fecha:t.due,estado:t.status,prioridad:t.priority,evidencia:t.evidence,notas:t.notes},0);ids.add(t.id);added++;msg('Importadas '+added+' tareas…')}await load();msg(added+' tareas guardadas; '+skipped+' existentes conservadas. El archivo original conserva la bitácora local.')}catch(e){msg('Importación detenida: '+e.message+' Tareas ya guardadas: '+added+'. Puedes volver a importar el mismo archivo.')}finally{lock(false);e.target.value=''}};
$('import-kobo').onchange=async e=>{const f=e.target.files[0];if(!f)return;lock(true);try{if(f.size>5000000)throw Error('Máximo 5 MB.');const r=await rpc('centralArchive',await f.text());await load();msg(r.duplicate?'Este lote ya estaba respaldado.':'Respaldo Kobo confirmado en Google Sheets.')}catch(e){msg('No se confirmó el respaldo: '+e.message)}finally{lock(false);e.target.value=''}};
window.onbeforeunload=e=>{if(dirty){e.preventDefault();e.returnValue=''}};switchKind('Informacion');lock(true);load().catch(e=>msg('No se pudo consultar: '+e.message)).finally(()=>lock(false));
</script></body></html>`;
