// Dicas guiadas dos primeiros minutos: jogo novo, passa pelos 5 passos na ordem
// (melhoria, aba Itens, equipar, chefão, ascensão) e confere gemas e destaque.
// Também confere que um save antigo que já ascendeu não vê dicas.
const path=require('path');
const EV=path.join(__dirname,'..','..','production','qa','evidence');
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
const st=p=>p.evaluate(()=>{tutTick();const f=$('tutFinger');return{tut:S.tut,bar:!$('tutBar').classList.contains('hidden'),txt:$('tutT').textContent,hi:tutEl?(tutEl.id||tutEl.dataset.t||tutEl.className):null,finger:f.style.display==='block',gems:S.gems}});
module.exports={
 run:async p=>{const o={};
  o.s0=await st(p);
  await p.evaluate(()=>{S.gold=50;updPanel()});await p.waitForTimeout(200);o.s0b=await st(p);
  await p.screenshot({path:path.join(EV,'2026-11-09-dica-1-melhoria.png')});
  await p.evaluate(()=>rowEls.dmg.b.click());o.s1=await st(p);
  await p.evaluate(()=>{S.items.push(makeItem(1,1));invDirty=true});o.s1b=await st(p);
  await p.screenshot({path:path.join(EV,'2026-11-09-dica-2-itens.png')});
  await p.click('.tab[data-t=inv]');o.s2=await st(p);
  await p.click('#autoEq');o.s3=await st(p);
  await p.evaluate(()=>{S.kills=10;S.up.dmg=0;step(.05)});await p.waitForTimeout(200);o.s3b=await st(p);
  await p.screenshot({path:path.join(EV,'2026-11-09-dica-4-chefao.png')});
  await p.evaluate(()=>{S.bosses=1});o.s4=await st(p);
  await p.evaluate(()=>{S.maxStage=35});o.s4b=await st(p);
  await p.click('.tab[data-t=asc]');o.s4c=await st(p);
  await p.screenshot({path:path.join(EV,'2026-11-09-dica-5-ascensao.png')});
  await p.evaluate(()=>{S.asc=1});o.s5=await st(p);
  // save antigo (sem campo tut) que já ascendeu: dicas desligadas
  o.old=await p.evaluate(()=>{saveLock=true;const d=JSON.parse(JSON.stringify(S));delete d.tut;d.asc=2;localStorage.setItem('auraIdleSave1',JSON.stringify(d))});
  await p.reload();await p.waitForTimeout(1500);o.old=await st(p);
  return o},
 check:o=>{
  ok(o.s0.tut===0&&o.s0.bar&&o.s0.hi==='buy','passo 1 visivel no botao de compra');
  ok(o.s0b.txt.startsWith('Toque no botão dourado'),'texto muda quando ha ouro');
  ok(o.s1.tut===1&&!o.s1.bar&&o.s1.gems===o.s0.gems+15,'passo 1 concluido com +15 gemas e passo 2 espera item');
  ok(o.s1b.bar&&o.s1b.hi==='inv'&&o.s1b.finger,'passo 2 aponta aba Itens');
  ok(o.s2.tut===2&&o.s2.hi==='autoEq','passo 3 aponta Equipar melhores');
  ok(o.s3.tut===3&&o.s3.gems===o.s0.gems+45,'passo 3 concluido');
  ok(o.s3b.bar&&o.s3b.hi==='bossl','passo 4 aponta o cronometro do chefao');
  ok(o.s4.tut===4&&!o.s4.bar,'passo 5 espera almas');
  ok(o.s4b.bar&&o.s4b.hi==='asc','passo 5 aponta aba Ascensao');
  ok(o.s4c.hi==='ascB','passo 5 aponta botao de ascender');
  ok(o.s5.tut===5&&!o.s5.bar&&!o.s5.finger&&o.s5.hi===null&&o.s5.gems===o.s0.gems+75,'dicas concluidas');
  ok(o.old.tut===99&&!o.old.bar,'save antigo que ja ascendeu nao ve dicas')}};
