const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 seed:{gold:0,lvl:30,stage:25,maxStage:25,best:25,souls:5,asc:1,iv:2,autobuy:true,up:{dmg:40,spd:10,crit:10,gold:20,aura:10,spirit:5,xp:5}},
 run:async p=>p.evaluate(()=>{for(let i=0;i<100;i++)step(.05);ensureWB();const r=[];
  // 7 dias x 3 lutas, com ~3 min de jogo normal entre os dias
  for(let d=0;d<7;d++){for(let k=0;k<3;k++){S.wb.tries=3;enterWB();for(let i=0;i<620;i++)step(.05)}for(let i=0;i<3600;i++)step(.05);r.push(wbTier())}
  return {tiers:r,stage:S.stage}}),
 check:r=>{ok(r.tiers[0]<10,'faixa 10 nao pode sair no 1o dia');ok(r.tiers[6]===10,'faixa 10 alcancavel em 7 dias')}};
