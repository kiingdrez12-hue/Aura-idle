// Ícones de equipamento em pixel art: 19 formas × 8 raridades distintas, usadas na mochila,
// nos espaços vazios, na janela do item e no chão (sprite do próprio item).
const path=require('path');
const EV=path.join(__dirname,'..','..','production','qa','evidence');
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 seed:{gold:1e6,lvl:30,stage:40,maxStage:40,best:40,iv:2,total:9,tut:99,asc:1},
 run:async p=>{const o={};
  o.gen=await p.evaluate(()=>{const urls=new Set();let n=0;SLOTS.forEach(sl=>sl.nm.forEach((_,vi)=>{for(let r=0;r<8;r++){urls.add(itemIcon(sl.k,vi,r,0).url);n++}}));return{n,uniq:urls.size}});
  o.empty=await p.evaluate(()=>{renderInv();return document.querySelectorAll('#eqg .slot.empty img.ico').length});
  await p.evaluate(()=>{for(let r=0;r<8;r++)for(let k=0;k<3;k++)S.items.push(makeItem(r,20));$('autoEq').click();for(let r=0;r<8;r++)dropItem(hero.position,r,5)});
  await p.click('.tab[data-t=inv]');await p.waitForTimeout(400);
  o.ui=await p.evaluate(()=>({eq:document.querySelectorAll('#eqg .slot img.ico').length,bag:document.querySelectorAll('#bag .slot img.ico').length,bagN:document.querySelectorAll('#bag .slot').length,emoji:[...document.querySelectorAll('#eqg .slot,#bag .slot')].some(b=>/[⚔🪖🛡🧤🥾📿💍]/u.test(b.textContent))}));
  o.ground=await p.evaluate(()=>drops.map(d=>({sprite:d.gem.isSprite===true,map:!!(d.gem.material.map&&d.gem.material.map.image),fx:!!d.fx,vis:d.gem.visible})));
  await p.waitForTimeout(600);await p.screenshot({path:path.join(EV,'2026-11-09-equipamentos-depois.png')});
  await p.evaluate(()=>openItem(S.items.find(i=>i.r===7)||S.items[0]));await p.waitForTimeout(300);
  o.modal=await p.evaluate(()=>!!document.querySelector('#iic img.icoL'));
  await p.screenshot({path:path.join(EV,'2026-11-09-equipamento-janela.png')});
  return o},
 check:o=>{
  ok(o.gen.n===152&&o.gen.uniq===152,'152 icones (19 formas x 8 raridades) todos diferentes');
  ok(o.empty===7,'espacos vazios mostram silhueta');
  ok(o.ui.eq===7&&o.ui.bag===o.ui.bagN&&o.ui.bagN>0&&!o.ui.emoji,'mochila e equipados sem emoji, com icones');
  ok(o.ground.length>=8&&o.ground.every(g=>g.sprite&&g.map&&g.fx&&g.vis),'itens no chao: sprite do proprio item sobre o brilho lootAura sem espada');
  ok(o.modal,'janela do item mostra o icone grande')}};
