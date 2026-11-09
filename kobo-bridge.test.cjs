const assert=require('node:assert/strict');const b=require('./kobo-bridge');
const c={_uuid:'ficticio-c','inicio_g/codigo_comunidad':'PRUEBA-C','inicio_g/comunidad':'Caso ficticio','inicio_g/modo':'prueba',clave_comunidad:'EC:prueba:C',acciones:[{accion:'Prueba'}]};
const g={_uuid:'ficticio-g','identificacion/id_proyecto/proyecto':'PROYECTO-PRUEBA','identificacion/id_proyecto/estacion':'E1',discontinuidades:[{dip:'30'}]};
let r=b.ingest(JSON.stringify({count:1,next:null,results:[c]}),'comunidad');assert.equal(r.added,1);assert.deepEqual(r.records[0].raw.acciones,c.acciones);assert.equal(r.records[0].review,'reportado');
r=b.ingest(JSON.stringify([c]),'comunidad',r.records);assert.equal(r.duplicates,1);assert.equal(r.records.length,1);
r=b.ingest(JSON.stringify([g]),'geomecanica',r.records);assert.equal(r.records.length,2);assert.deepEqual(r.records[1].raw.discontinuidades,g.discontinuidades);
r=b.ingest(JSON.stringify([{...c,'inicio_g/comunidad':'Cambio'}]),'comunidad',r.records);assert.equal(r.updated,1);assert.equal(r.records[0].previousVersions.length,1);assert.equal(r.records[0].review,'reportado');
for(const [text,src]of [[JSON.stringify([g]),'comunidad'],[JSON.stringify([c]),'geomecanica'],[JSON.stringify({count:2,next:'page2',results:[c]}),'comunidad'],[JSON.stringify([{...c,_uuid:undefined}]),'comunidad'],['null','comunidad']])assert.throws(()=>b.ingest(text,src));
assert.equal(b.stable({a:1,b:2}),b.stable({b:2,a:1}));console.log('Pruebas de recepción: origen, duplicados, versiones, repetibles y lotes incompletos aprobadas.');
