const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 seed:{gold:0,lvl:30,stage:25,maxStage:25,best:25,souls:5,asc:1,iv:2,up:{dmg:40,spd:10,crit:10,gold:20,aura:10,spirit:5,xp:5}},
 run:async p=>p.evaluate(()=>{for(let i=0;i<100;i++)step(.05);ensureWB();const r=[];
  for(let k=0;k<3;k++){S.wb.tries=3;const st=S.stage;enterWB();let minHp=1e99,maxRatio=0;for(let i=0;i<620;i++){step(.05);const e=enemies.find(x=>x.wb);if(e){minHp=Math.min(minHp,e.hp);maxRatio=Math.max(maxRatio,e.hp/e.max)}}r.push({stageDuring:S.stage-st,tier:wbTier(),minHp:minHp>0,maxRatio:+maxRatio.toFixed(2)})}
  // faixa máxima: dano acima do topo continua estável
  S.wb.pts=wbNeed(10)*1.3;S.wb.tries=3;const st=S.stage;enterWB();for(let i=0;i<300;i++)step(.05);const e=enemies.find(x=>x.wb);r.push({maxTierStageDelta:S.stage-st,hpOk:e.hp>0&&e.hp<=e.max});
  return r}),
 check:r=>{r.slice(0,3).forEach(x=>{ok(x.stageDuring===0,'chefe mundial nao pode avancar estagio');ok(x.minHp,'vida do chefe > 0')});ok(r[3].hpOk&&r[3].maxTierStageDelta===0,'faixa maxima estavel')}};
