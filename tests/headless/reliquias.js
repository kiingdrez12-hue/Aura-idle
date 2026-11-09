const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 pre:()=>{localStorage.setItem('auraIdleSave1',JSON.stringify({gold:0,lvl:40,stage:45,maxStage:45,best:60,souls:30,asc:2,iv:2,autobuy:true}))},
 run:async p=>p.evaluate(()=>{const res=[];S.rel={start:3};const g=soulGain();document.getElementById('ascB').click();res.push({g,st:S.stage,as:S.ascStart});
  for(let k=0;k<6;k++){for(let i=0;i<1000;i++)step(.05);res.push({st:S.stage,kills:S.kills,en:enemies.length,boss:bossOn,gold:Math.round(S.gold),dmg:Math.round(dmg())})}
  return res}),
 check:r=>{ok(r[0].st===16&&r[0].as===16,'botas: comeca no estagio 16');ok(r[6].st>r[0].st,'progride depois de ascender')}};
