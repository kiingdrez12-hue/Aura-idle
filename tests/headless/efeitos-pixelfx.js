// Todo efeito do pacote vendor/pixelfx.js aparece no jogo: cada situação é disparada de propósito
// e o teste confere que cada efeito foi criado e desenhou pixels visíveis.
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 seed:{gold:1e9,lvl:4,stage:9,maxStage:9,best:9,souls:40,asc:3,iv:2,total:5,cls:'knight',ucls:['knight','mage','archer','paladin'],login:{last:'x',streak:1,claimed:true},up:{dmg:60,spd:10,crit:10,gold:5,aura:10,spirit:0,xp:0},gfx:1,gfxAuto:0},
 run:async p=>p.evaluate(()=>{
  const all=Object.keys(PixelFX.FX),seen={},drew={};
  const idOf=e=>all.find(k=>PixelFX.FX[k].meta===e.fx.meta);
  const _pfx=pfx;pfx=function(id,...a){const e=_pfx(id,...a);if(e)seen[id]=(seen[id]||0)+1;return e};
  // desenha e anota quem pintou algum pixel visível
  const draw=()=>{PFX.forEach(e=>e.acc=1);pfxDraw();PFX.forEach(e=>{const d=e.img.data;for(let i=3;i<d.length;i+=16)if(d[i]>0){drew[idOf(e)]=1;break}})};
  const run=n=>{for(let i=0;i<n;i++){step(.05);if(i%3===0)draw()}};
  const clear=()=>{PFX.splice(0).forEach(pfxKill)};
  const near=()=>{let e=enemies.find(x=>!x.dead&&!x.boss);if(!e)e=spawnEnemy('slime');e.g.position.set(hero.position.x+1,0,hero.position.z);target=e;return e};
  const rnd=Math.random;
  for(const k of ['knight','mage','archer','paladin']){
   S.cls=k;buildHero();applyTier(tierIdx);
   // golpe normal e crítico
   for(const c of [false,true]){clear();Math.random=()=>c?0:.99;near();atkT=0;attack();Math.random=rnd;run(30)}
   // especial
   clear();near();special();run(70)}
  // fúria
  clear();S.fk=FN()-1;const e1=near();kill(e1);run(30);
  // monstro, elite e chefão
  clear();kill(near());run(20);
  clear();const el=spawnEnemy('slime',true);kill(el);run(20);
  clear();S.kills=10;bossOn=false;run(10);const b=enemies.find(x=>x.boss&&!x.dead);if(b)kill(b);run(30);
  // subir de nível e nova aura
  clear();addXp(xpNeed(S.lvl)*1.01);run(20);
  clear();S.tier=0;addXp(xpNeed(S.lvl)*1.01);tierUp(1);run(30);
  // item raro no chão e coletado
  clear();dropItem(hero.position,4,S.stage);run(120);
  // baú: abre no cartão de notificação, fora da cena (não passa por pfx)
  clear();spawnChestType(2);for(let i=0;i<40;i++){step(.05);if(chestCur){chestCur.acc=1;chestDraw()}if(chestCur&&!seen.chestOpen){seen.chestOpen=1}
   const d=$('chestCv').getContext('2d').getImageData(0,0,96,72).data;for(let k=3;k<d.length;k+=16)if(d[k]>0){drew.chestOpen=1;break}}
  // aura do herói: efeito próprio fora do pfx, nas duas camadas
  applyTier(3);for(let i=0;i<6;i++)step(.05);AURA.acc=1;auraDraw();seen.aura=1;
  for(const q of AURA.parts){const d=q.img.data;for(let k=3;k<d.length;k+=16)if(d[k]>0){drew.aura=1;break}}
  // habilidades: cada herói lança as 4 (efeitos novos do pacote: uppercut, heavyCleave, groundSlam, fireball, ...)
  S.lvl=60;for(const k of ['knight','mage','archer','paladin']){S.cls=k;buildHero();for(let i=0;i<4;i++){clear();skCd=[0,0,0,0];skQ.length=0;const t=near();t.hp=1e12;t.max=1e12;target=t;skCast(i,true);run(16)}}
  // monstros: os bichos do pixelfx vestem os inimigos de cada cenário (todos os biomas, os três tipos e o chefão)
  for(let st=1;st<=BIOMES.length;st++){S.stage=st;for(const ty of ['slime','goblin','skeleton','boss']){const e=spawnEnemy(ty);if(!e.px)continue;const id=MOBS[e.px.id].fx;seen[id]=1;
   for(let i=0;i<4;i++)mobUpd(e,i/MOB_FPS);const cv=e.px.sh.tex[0].image,d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;for(let k=3;k<d.length;k+=16)if(d[k]>0){drew[id]=1;break}
   sc.remove(e.g);enemies.splice(enemies.indexOf(e),1)}}
  // herói em pixel art: também fora do pfx, um sprite próprio nos pés
  if(HERO2D.fx){seen.hero=1;HERO2D.acc=1;heroDraw(.05);const d=HERO2D.part.img.data;for(let k=3;k<d.length;k+=16)if(d[k]>0){drew.hero=1;break}}
  pfx=_pfx;
  return {all,seen,drew,naoCriados:all.filter(k=>!seen[k]),semPixels:all.filter(k=>!drew[k])}}),
 check:r=>{ok(r.naoCriados.length===0,'efeitos nunca criados: '+r.naoCriados.join(', '));ok(r.semPixels.length===0,'efeitos sem pixels visiveis: '+r.semPixels.join(', '))}};
