(function(root){
'use strict';
const present=v=>v!==''&&v!==null&&v!==undefined;
const num=v=>present(v)&&Number.isFinite(Number(v))?Number(v):null;
function fs(value,limit){const v=num(value),m=num(limit);if(v===null||v<0)return {state:'pending',text:'Resultado pendiente'};if(v<1)return {state:'alert',text:'FS < 1: resistencia inferior a demanda'};if(m===null||m<1)return {state:'pending',text:'Criterio pendiente'};return v<m?{state:'alert',text:'Inferior al mínimo declarado'}:{state:'ok',text:'Cumple el mínimo declarado'};}
function evaluate(d){
const missing=[];const require=(k,label)=>{if(!present(d[k])||String(d[k]).trim().length===0)missing.push(label)};
[['evaluador','Recolector'],['organizacion_levantador','Organización'],['contacto','Contacto'],['fecha_evaluacion','Fecha de campo'],['rol_participante','Rol'],['sitio','Sitio'],['fenomeno','Fenómeno'],['observaciones','Observaciones'],['personas_expuestas','Personas expuestas'],['personas_prioritarias_estimadas','Personas prioritarias']].forEach(x=>require(...x));
if(d.fenomeno==='otro')require('fenomeno_otro','Descripción del fenómeno');
const expert=d.analisis==='si';const supervised=d.rol_participante==='universitario'||d.levantamiento_supervisado==='si'||(d.rol_participante==='voluntario'&&expert);
if(d.modalidad_captura==='transcripcion')[['digitador_nombre','Digitador'],['digitador_contacto','Contacto del digitador'],['fuente_ficha_original','Ficha original']].forEach(x=>require(...x));
if(supervised)[['supervisor_nombre','Supervisor'],['supervisor_contacto','Contacto del supervisor'],['supervisor_competencia','Competencia del supervisor']].forEach(x=>require(...x));
if(expert)[['analista_nombre','Responsable técnico'],['analista_competencia','Competencia técnica'],['fuente_datos_tecnicos','Fuente técnica']].forEach(x=>require(...x));
const errors=[];for(const [k,min,max] of [['latitud',-90,90],['longitud',-180,180],['personas_expuestas',0,Infinity],['personas_prioritarias_estimadas',0,Infinity]]){const n=num(d[k]);if(present(d[k])&&(n===null||n<min||n>max))errors.push('Revise '+k);}
for(const k of ['personas_expuestas','personas_prioritarias_estimadas'])if(num(d[k])!==null&&!Number.isInteger(num(d[k])))errors.push('Use un entero en '+k);
if(num(d.personas_expuestas)!==null&&num(d.personas_prioritarias_estimadas)!==null&&Number(d.personas_prioritarias_estimadas)>Number(d.personas_expuestas))errors.push('Las personas prioritarias superan el total expuesto');
const fsResults=[];if(expert&&d.calcular_fs==='si'){
[['fs_metodo','Método FS'],['fs_contexto_criterio','Contexto FS'],['fs_fuente_criterio','Fuente del criterio FS']].forEach(x=>require(...x));
if(!d.fs_tipo_analisis)missing.push('Tipo de análisis FS');
for(const [kind,label] of [['estatico','Estático'],['pseudo','Pseudoestático']])if(d.fs_tipo_analisis==='ambos'||d.fs_tipo_analisis===(kind==='pseudo'?'pseudoestatico':'estatico')){
require('fs_'+kind,'FS '+label);require('fs_limite_'+kind,'Mínimo '+label);const result=fs(d['fs_'+kind],d['fs_limite_'+kind]);fsResults.push({label,...result});if(result.state==='pending')missing.push('Resultado/criterio FS '+label);
if(present(d['fs_'+kind])&&(num(d['fs_'+kind])===null||num(d['fs_'+kind])<0))errors.push('FS '+label+' inválido');if(present(d['fs_limite_'+kind])&&(num(d['fs_limite_'+kind])===null||num(d['fs_limite_'+kind])<1))errors.push('Mínimo FS '+label+' inválido');
}}
let smr=null;if(expert&&d.calcular_smr==='si'){require('smr_valor','SMR externo');require('smr_tipo_rotura','Mecanismo SMR');const n=num(d.smr_valor);if(n!==null&&n>=0&&n<=100)smr={value:n,clase:n>=81?'I':n>=61?'II':n>=41?'III':n>=21?'IV':'V'};else if(present(d.smr_valor))errors.push('SMR debe estar entre 0 y 100');}
return {missing:[...new Set(missing)],errors,supervised,expert,fsResults,smr,alert:fsResults.some(x=>x.state==='alert')};
}
const api={fs,evaluate};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SmartRisk=api;
})(typeof window!=='undefined'?window:this);
