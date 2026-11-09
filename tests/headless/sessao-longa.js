// Jogador robô desde um save novo: compra melhorias, coleta Jornada, choca ovos,
// luta contra o chefe mundial, coleta o passe e ascende. 60 min de jogo simulado.
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 run:async p=>p.evaluate(()=>{const log=[],T0=performance.now();let firstAsc=null;
  const clickAll=sel=>document.querySelectorAll(sel).forEach(b=>b.click());
  for(let sec=1;sec<=3600;sec++){
   for(let i=0;i<20;i++)step(.05);
   updPanel();const b=document.querySelector('#rows .buy.ok');if(b)b.click();
   if(sec%30===0){document.getElementById('hmodal').classList.add('hidden');document.getElementById('modal').classList.add('hidden');
    renderJornada();clickAll('#lbtn .buy.ok');clickAll('#mlist .buy.ok');clickAll('#wlist .buy.ok');clickAll('#sscard .buy.ok');
    if(!tower.on){const wb=document.querySelector('#wbcard .wbrow .buy.ok');if(wb)wb.click()}
    clickAll('#achl .buy.ok');
    S.eggs.forEach((n,i)=>{for(let k=0;k<n;k++)hatch(i)});document.getElementById('hmodal').classList.add('hidden');
    renderPets();clickAll('#pactb .buy.ok');
    if(!tower.on&&soulGain()>0&&S.maxStage>=Math.max(40,(S.ascStart||1)+20)){updAsc();const a0=S.asc;document.getElementById('ascB').click();if(S.asc>a0&&firstAsc==null)firstAsc=sec/60;document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden'))}
    relSig='';renderRel();clickAll('#rell .buy.ok');
   }
   if(sec%300===0)log.push({min:sec/60,stage:S.stage,max:S.maxStage,lvl:S.lvl,asc:S.asc,ss:ssLevel(),wb:wbTier(),pets:Object.keys(S.pets).length,ess:S.ess,rel:Object.values(S.rel).reduce((a,b)=>a+b,0)});
  }
  save();return{firstAsc,log,realSec:Math.round((performance.now()-T0)/1000),save:JSON.stringify(S).length}})
 ,check:o=>{ok(o.firstAsc!=null,'deve ascender pelo menos 1x em 60 min');ok(o.log.at(-1).ss>0,'passe deve subir');ok(o.log.at(-1).wb>0,'chefe mundial deve dar faixas')}};
