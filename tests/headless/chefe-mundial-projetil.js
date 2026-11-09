// Bug: um espírito em voo contra o chefão normal ainda o acertava depois que o jogador entrava
// no Chefe Mundial (ou na Torre), e o estágio avançava no meio da luta.
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 seed:{gold:0,lvl:30,stage:25,maxStage:25,best:25,souls:5,asc:1,iv:2,up:{dmg:40,spd:10,crit:10,gold:20,aura:10,spirit:5,xp:5}},
 run:async p=>p.evaluate(()=>{
  // prepara: chefão normal quase morto e um espírito a caminho dele
  for(let i=0;i<20;i++)step(.05);ensureWB();S.wb.tries=3;
  const boss=spawnEnemy('boss');bossOn=true;bossT=30;boss.hp=1;
  const pr=projs.find(x=>!x.on);pr.on=true;pr.t=.5;pr.from.copy(hero.position);pr.tgt=boss;pr.d=1e9;pr.s.visible=true;
  const st=S.stage;
  // age: entra no Chefe Mundial enquanto o espírito voa
  enterWB();for(let i=0;i<40;i++)step(.05);
  return {stageDelta:S.stage-st,bossesWB:enemies.filter(e=>e.wb).length}}),
 check:r=>{ok(r.stageDelta===0,'espirito em voo nao pode matar o chefao antigo e avancar o estagio');ok(r.bossesWB===1,'chefe mundial em campo')}};
