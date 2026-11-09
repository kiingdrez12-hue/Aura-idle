const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={run:async p=>{
 const r=await p.evaluate(()=>{for(let i=0;i<200;i++)step(.05);
  const o={};ensureSeason();o.id=S.ss.id;o.wm=S.ss.wm.map(m=>m.t);o.ready0=ssReady();
  addSXP(2600);o.lv=ssLevel();o.ready=ssReady();
  return o});
 await p.click('#jorBtn');await p.waitForTimeout(400);
 const r2=await p.evaluate(()=>{const g0=S.gems,f0=S.frag,e0=S.eggs.slice();claimSeason();return{gems:S.gems-g0,frag:S.frag-f0,eggs:S.eggs,got:Object.keys(S.ss.got),ready:ssReady(),
  // simula fim do passe e virada de temporada
  }});
 await p.evaluate(()=>{S.ss.xp=SS_LV*SS_XPL+100;renderJornada()});await p.waitForTimeout(200);
 await p.screenshot({path:__dirname+'/out-ss_full.png'});
 const r3=await p.evaluate(()=>{const n=ssReady();claimSeason();const hasB=S.ubord.includes(ssBord(S.ss.id));S.ss.id-=1;ensureSeason();save();return{readyAtMax:n,border:hasB,newId:S.ss.id,xp:S.ss.xp,ubord:S.ubord}});
 await p.evaluate(()=>{S.ss.xp=2600;S.ss.got={};claimSeason();S.ss.xp=3400;renderJornada();document.getElementById('pgJor').scrollTop=0});await p.waitForTimeout(300);
 return {r,r2,r3}},
 check:o=>{ok(o.r.lv===5&&o.r.ready===5,'2600 XP = nivel 5');ok(o.r2.ready===0,'coletou tudo');ok(o.r3.readyAtMax===25&&o.r3.border,'borda no nivel 30');ok(o.r3.xp===0,'nova temporada zera XP')}};
