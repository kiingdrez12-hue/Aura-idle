// Salva, recarrega a página e confere se os campos novos voltam iguais; depois abre todas as abas.
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
const norm=v=>v&&typeof v==='object'?Array.isArray(v)?v.map(norm):Object.keys(v).sort().reduce((o,k)=>(o[k]=norm(v[k]),o),{}):v;
const eq=(a,b)=>JSON.stringify(norm(a))===JSON.stringify(norm(b));
module.exports={
  seed:{gold:1e6,lvl:45,stage:60,maxStage:60,best:80,souls:40,asc:3,iv:2,total:5,frag:900,gems:500,eggs:[2,1,0],login:{last:'x',streak:1,claimed:true},pets:{fox:{lv:12,st:1,sh:1},slime:{lv:10}},petActive:'fox',rel:{dmg:3,start:2},ess:25},
 run:async p=>{const o={};
  o.before=await p.evaluate(()=>{for(let i=0;i<200;i++)step(.05);ensureSeason();ensureWB();addSXP(1300);S.wb.pts=7.5;S.ss.wm[0].c=true;save();saveLock=true;const D=JSON.parse(localStorage.getItem('auraIdleSave1'));return JSON.stringify({ss:D.ss,wb:D.wb,rel:D.rel,ess:D.ess,pets:D.pets,asc:D.ascStart})});
  await p.reload();await p.waitForTimeout(1500);
  o.after=await p.evaluate(()=>JSON.stringify({ss:S.ss,wb:S.wb,rel:S.rel,ess:S.ess,pets:S.pets,asc:S.ascStart}));
  o.tabs=[];for(const t of ['up','inv','pet','jor','tal','hero','prof','asc']){await p.evaluate(()=>document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden')));await p.click(`.tab[data-t=${t}]`);await p.waitForTimeout(350);
   const w=await p.evaluate(()=>{const pg=document.querySelector('.pg:not(.hidden)');return{id:pg.id,scrollW:document.documentElement.scrollWidth,pgW:pg.scrollWidth,cw:pg.clientWidth}});o.tabs.push(w);await p.screenshot({path:__dirname+`/out-aba-${t}.png`})}
  return o},
 check:o=>{const a=JSON.parse(o.before),b=JSON.parse(o.after);ok(eq(a.ss,b.ss),'passe salvo');ok(a.wb.pts===b.wb.pts&&a.wb.tries===b.wb.tries,'chefe salvo');ok(eq(a.rel,b.rel)&&a.ess===b.ess,'reliquias salvas');ok(eq(a.pets,b.pets),'mascotes salvos');
  o.tabs.forEach(t=>{ok(t.scrollW<=390,'sem rolagem horizontal na pagina: '+t.id);ok(t.pgW<=t.cw+1,'conteudo cabe na largura: '+t.id)})}};
