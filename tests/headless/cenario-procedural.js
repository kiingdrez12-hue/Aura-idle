// Cenário procedural: cada estágio tem bioma, nome, piso, céu, objetos e clima próprios, nunca repete o anterior, cada
// bloco de 10 estágios passa por todos os biomas; vencer o chefão troca o cenário; os inimigos são os bichos do pixelfx
// do bioma; e a câmera fica mais longe do herói do que ficava (a 13,5 unidades).
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 seed:{gold:1e6,lvl:30,stage:1,maxStage:1,best:1,iv:2,total:5,cls:'knight',login:{last:'x',streak:1,claimed:true},up:{dmg:80,spd:5,crit:0,gold:0,aura:0,spirit:0,xp:0},gfx:1,gfxAuto:0},
 run:async p=>p.evaluate(()=>{
  if(typeof biomeOf!=='function')return{has:false};
  const seq=[];for(let st=1;st<=60;st++)seq.push(biomeIdx(st));
  const hashTex=t=>{const c=t.image,d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=0;for(let i=0;i<d.length;i+=97)h=(h*31+d[i])>>>0;return h};
  const cen=[];for(let st=1;st<=4;st++){applyScene(st);cen.push({st,nome:$('world').textContent,piso:hashTex(stoneTex),chao:hashTex(grassTex),ceu:skyU.top.value.getHexString(),objs:decor.children.length,clima:ambK})}
  // vencer o chefão do estágio 1 troca o cenário
  S.stage=1;applyScene(1);enemies.forEach(e=>sc.remove(e.g));enemies=[];bossOn=true;const b=spawnEnemy('boss');kill(b);for(let i=0;i<20;i++)step(.05);
  const depois={stage:S.stage,sceneSt,nome:$('world').textContent,esperado:sceneName(S.stage)};
  // inimigos do bioma em pixel art
  const B=biomeOf(S.stage),ini=['slime','goblin','skeleton','boss'].map(t=>{const e=spawnEnemy(t);return{t,px:!!e.px,id:e.px&&e.px.id,ok:e.px&&(t==='boss'?e.px.id===B.boss:B.mobs.includes(e.px.id))}});
  // câmera depois de assentar
  for(let i=0;i<120;i++){step(.05);render(.05)}const dist=cam.position.distanceTo(hero.position);
  return{has:true,seq,cen,depois,ini,dist,n:BIOMES.length}}),
 check:r=>{
  ok(r.has,'cenario procedural (biomeOf) nao existe');
  for(let i=1;i<r.seq.length;i++)ok(r.seq[i]!==r.seq[i-1],'estagio '+(i+1)+' repete o bioma do anterior');
  for(let b=0;b<r.seq.length/r.n;b++)ok(new Set(r.seq.slice(b*r.n,b*r.n+r.n)).size===r.n,'bloco '+b+' passa por todos os biomas');
  ok(r.seq[0]===0,'estagio 1 comeca na campina');
  for(let i=1;i<r.cen.length;i++){const a=r.cen[i-1],c=r.cen[i];ok(a.nome!==c.nome&&a.piso!==c.piso&&a.chao!==c.chao&&a.ceu!==c.ceu,'estagio '+c.st+' muda nome, piso, chao e ceu')}
  r.cen.forEach(c=>ok(c.objs>=20,'estagio '+c.st+' tem objetos na paisagem ('+c.objs+')'));
  ok(r.depois.stage===2&&r.depois.sceneSt===2&&r.depois.nome===r.depois.esperado,'vencer o chefao troca o cenario: '+JSON.stringify(r.depois));
  r.ini.forEach(x=>ok(x.px&&x.ok,'inimigo '+x.t+' e um bicho do bioma em pixel art: '+JSON.stringify(x)));
  ok(r.dist>16,'camera mais longe do heroi (distancia '+r.dist.toFixed(1)+', era 13,5)')}};
