// Exportar, importar (com código errado, alterado e certo), backup, restaurar e apagar.
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 pre:()=>{if(!sessionStorage.getItem('fase')){sessionStorage.setItem('fase','1');localStorage.clear();localStorage.setItem('auraIdleSave1',JSON.stringify({gold:5,lvl:42,stage:61,maxStage:61,best:77,asc:3,souls:9,name:'Zé Ação',iv:2,total:5,login:{last:'x',streak:1,claimed:true}}))}},
 run:async p=>{const o={};const closeAll=()=>p.evaluate(()=>document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden')));
  await closeAll();await p.click('.tab[data-t=prof]');await p.waitForTimeout(300);
  // exportar
  await p.click('#svExp');await p.waitForTimeout(200);o.code=await p.$eval('#svtx',e=>e.value);
  await p.evaluate(()=>document.getElementById('pgProf').scrollTop=9999);await p.screenshot({path:__dirname+'/out-save-exportar.png'});
  o.dec=await p.evaluate(c=>{const d=decodeCode(c);return{ok:d.ok,lvl:d.data&&d.data.lvl,name:d.data&&d.data.name}},o.code);
  // código alterado / lixo
  o.bad1=await p.evaluate(c=>decodeCode(c.slice(0,-8)+'AAAAAAAA').msg,o.code);
  o.bad2=await p.evaluate(()=>decodeCode('oi tudo bem').msg);
  // importar outro progresso (nível 7)
  const other=await p.evaluate(()=>{const d=JSON.parse(JSON.stringify(S));d.lvl=7;d.name='Outro';const j=JSON.stringify(d);return 'AURA1-'+fnv(j)+'-'+b64e(j)});
  await p.click('#svcl');await p.click('#svImp');await p.fill('#svtx','lixo');o.btnBad=await p.$eval('#svb1',b=>b.disabled);
  await p.fill('#svtx',other);o.btnOk=await p.$eval('#svb1',b=>b.disabled);o.info=await p.$eval('#svi',e=>e.textContent);
  await p.screenshot({path:__dirname+'/out-save-importar.png'});
  await Promise.all([p.waitForNavigation(),p.click('#svb1')]);await p.waitForTimeout(1500);
  o.afterImport=await p.evaluate(()=>({lvl:S.lvl,name:S.name,bak:JSON.parse(readBak().d).lvl}));
  // restaurar backup (volta ao nível 42; o 7 vira backup)
  await closeAll();await p.click('.tab[data-t=prof]');await p.click('#svRes');await Promise.all([p.waitForNavigation(),p.click('#svb1')]);await p.waitForTimeout(1500);
  o.afterRestore=await p.evaluate(()=>({lvl:S.lvl,name:S.name,bak:JSON.parse(readBak().d).lvl}));
  // apagar: precisa digitar APAGAR
  await closeAll();await p.click('.tab[data-t=prof]');await p.click('#svDel');await p.fill('#svtx','apaga');o.delBtn1=await p.$eval('#svb1',b=>b.disabled);await p.fill('#svtx','apagar');o.delBtn2=await p.$eval('#svb1',b=>b.disabled);
  await Promise.all([p.waitForNavigation(),p.click('#svb1')]);await p.waitForTimeout(1500);
  o.afterDel=await p.evaluate(()=>({lvl:S.lvl,stage:S.stage,bak:JSON.parse(readBak().d).lvl}));
  // save corrompido: não some, vai para _corrupt
  await p.evaluate(()=>{saveLock=true;localStorage.setItem('auraIdleSave1','{"quebrado":');});await p.reload();await p.waitForTimeout(1500);
  o.corrupt=await p.evaluate(()=>({lvl:S.lvl,kept:localStorage.getItem('auraIdleSave1_corrupt')}));
  return o},
 check:o=>{ok(o.code.startsWith('AURA1-'),'formato do codigo');ok(o.dec.ok&&o.dec.lvl===42&&o.dec.name==='Zé Ação','codigo volta igual, com acentos');
  ok(/alterado/.test(o.bad1),'detecta codigo alterado');ok(/não parece/.test(o.bad2),'detecta lixo');ok(o.btnBad===true&&o.btnOk===false,'botao so libera com codigo valido');
  ok(o.afterImport.lvl===7&&o.afterImport.bak===42,'importa e guarda o anterior no backup');ok(o.afterRestore.lvl===42&&o.afterRestore.bak===7,'restaurar troca com o backup');
  ok(o.delBtn1===true&&o.delBtn2===false,'apagar so com APAGAR');ok(o.afterDel.lvl===1&&o.afterDel.bak===42,'apaga e guarda backup');ok(o.corrupt.kept==='{"quebrado":','save corrompido preservado')}};
