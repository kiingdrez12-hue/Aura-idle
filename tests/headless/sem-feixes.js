// Itens e baús não podem levantar colunas de luz para cima: abre baús de todas as raridades, derruba itens
// de todas as raridades e procura na cena qualquer cilindro de luz alto (3+ unidades) que esteja visível.
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 seed:{gold:1e9,lvl:45,stage:38,maxStage:38,best:38,souls:40,asc:3,iv:2,total:5,cls:'knight',login:{last:'x',streak:1,claimed:true},up:{dmg:5,spd:0,crit:0,gold:5,aura:0,spirit:0,xp:0},gfx:1,gfxAuto:0},
 run:async p=>p.evaluate(()=>{
  const beams=()=>{const out=[];sc.traverse(o=>{if(!o.isMesh||!o.geometry||o.geometry.type!=='CylinderGeometry')return;
   const h=o.geometry.parameters.height*o.scale.y;let v=o.visible;for(let q=o.parent;q&&v;q=q.parent)v=q.visible;
   if(v&&h>=3&&o.material.transparent&&o.material.opacity>.05)out.push(+h.toFixed(1))});return out};
  const found=[];
  // baús de todas as raridades
  enemies.forEach(e=>sc.remove(e.g));enemies=[];
  for(let ti=0;ti<6;ti++)spawnChestType(ti);
  for(let i=0;i<600&&(chestQ.length||chestCur);i++){step(.05);if(i%4===0)found.push(...beams())}
  // itens de todas as raridades no chão
  for(let r=0;r<8;r++)dropItem(hero.position,r,S.stage);for(let i=0;i<10;i++){step(.05);found.push(...beams())}
  // efeitos do pixelfx que são colunas de luz caindo ou subindo: nenhum pode aparecer em especial, nível ou aura nova
  const COLUNAS=['smite','holyPillar','lootBeam','magicCircle'],usados=[];const _pfx=pfx;pfx=function(id,...a){if(COLUNAS.includes(id))usados.push(id);return _pfx(id,...a)};
  for(const k of ['knight','mage','archer','paladin']){S.cls=k;buildHero();const e=spawnEnemy('slime');e.g.position.set(hero.position.x+1,0,hero.position.z);special();for(let i=0;i<30;i++)step(.05)}
  addXp(xpNeed(S.lvl)*1.01);tierUp(Math.min(9,S.tier+1));for(let i=0;i<20;i++)step(.05);pfx=_pfx;
  return {found,usados}}),
 check:r=>{ok(r.found.length===0,'colunas de luz visiveis: '+r.found.slice(0,10).join(', '));ok(r.usados.length===0,'efeitos de coluna de luz no heroi: '+[...new Set(r.usados)].join(', '))}};
