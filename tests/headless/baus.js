// Baú não cai mais no chão: vira um cartão de notificação com o baú do pixelfx abrindo na cor da raridade,
// e a recompensa (ouro, fragmentos, itens) chega quando a tampa abre.
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 seed:{gold:0,lvl:45,stage:38,maxStage:38,best:38,souls:40,asc:3,iv:2,total:5,cls:'knight',frag:0,login:{last:'x',streak:1,claimed:true},up:{dmg:5,spd:0,crit:0,gold:5,aura:0,spirit:0,xp:0},gfx:1,gfxAuto:0},
 run:async p=>p.evaluate(()=>{
  // prepara: sem monstros nem baús de estágio pendentes
  enemies.forEach(e=>sc.remove(e.g));enemies=[];chests.forEach(c=>sc.remove(c.g));chests=[];const Q=typeof chestQ!=='undefined';if(Q){chestQ.length=0;chestCur=null}
  const n0=S.chestsN,f0=S.frag,g0=S.total,d0=drops.length+S.found;
  // age: um baú de cada tier
  for(let ti=0;ti<6;ti++)spawnChestType(ti);
  const noChao=chests.length;const cards=[];let maxQ=0;
  for(let i=0;i<900&&(!Q||chestQ.length||chestCur);i++){if(!Q&&i>60)break;step(.05);if(Q)maxQ=Math.max(maxQ,chestQ.length);
   const el=document.getElementById('chestCard');if(Q&&chestCur&&el&&!el.classList.contains('hidden')&&!cards.includes(chestCur.ti))cards.push(chestCur.ti)}
  for(let i=0;i<120;i++)step(.05);
  return {noChao,cards,chestsN:S.chestsN-n0,frag:S.frag-f0,gold:S.total-g0,itens:drops.length+S.found-d0,fila:Q?chestQ.length:-1,aberto:Q&&!!chestCur,
   cor:Q?getComputedStyle(document.getElementById('chestCard')).getPropertyValue('--cc').trim():'',nome:Q?document.getElementById('chestN').textContent:''}}),
 check:r=>{
  ok(r.noChao===0,'bau nao pode cair no chao');
  ok(r.cards.join()==='0,1,2,3,4,5','um cartao por bau, na ordem: '+r.cards.join());
  ok(r.chestsN===6,'6 baus contados como abertos');
  ok(r.frag>0&&r.gold>0,'bau da fragmentos e ouro');
  ok(r.itens>=1+2+2+3+3+4-2,'itens dos baus cairam');
  ok(r.fila===0&&!r.aberto,'fila esvaziou');
  ok(r.cor==='#fff3a0'&&/CELESTIAL/.test(r.nome),'ultimo cartao na cor e no nome do Bau Celestial')}};
