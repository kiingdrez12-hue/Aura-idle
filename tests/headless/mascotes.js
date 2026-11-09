const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 seed:{gold:0,lvl:30,stage:25,maxStage:25,best:25,total:5,login:{last:'x',streak:1,claimed:true},frag:5000,pets:{fox:{lv:10},slime:{lv:4}},petActive:'fox',eggs:[0,0,0]},
 run:async p=>{const o={};
 o.a=await p.evaluate(()=>{const fox=PETS.find(x=>x.k==='fox');const v0=petVal(fox,'dmg',10);
  // repetidos no nível máximo viram cópias
  for(let i=0;i<2;i++){S._dupe='';const had=S.pets.fox;if(had.lv<PET_MAXLV('fox'))had.lv++;else had.sh=(had.sh||0)+1}
  const can=petCanEvo('fox');S.pets.fox.sh=2;const can2=petCanEvo('fox');
  return{v0:+v0.toFixed(1),max:PET_MAXLV('fox'),sh:S.pets.fox.sh,can,can2}});
 await p.click('.tab[data-t=pet]');await p.waitForTimeout(400);
 o.b=await p.evaluate(()=>{const btns=[...document.querySelectorAll('#pactb .buy')];btns[1].click();const fox=PETS.find(x=>x.k==='fox');const r={st:S.pets.fox.st,max:PET_MAXLV('fox'),v1:+petVal(fox,'dmg',10).toFixed(1)};
  const f0=S.frag;document.querySelector('#pactb .buy').click();r.lv=S.pets.fox.lv;r.fragSpent=f0-S.frag;
  // ovo: repetido no máximo -> cópia
  S.pets.slime.lv=10;S.eggs[0]=40;for(let i=0;i<40;i++)hatch(0);document.getElementById('hmodal').classList.add('hidden');r.pets=JSON.stringify(S.pets);return r});
 await p.waitForTimeout(300);await p.evaluate(()=>{S.pets.fox.lv=14;S.pets.fox.sh=3;S.pets.fox.st=2;calcIT();buildPet();petDirty=true;renderPets()});await p.waitForTimeout(500);if(process.env.GRID)await p.evaluate(()=>{S.pets.slime.sh=2;renderPets();document.getElementById('pgPet').scrollTop=400});await p.waitForTimeout(300);
 return o},
 check:o=>{ok(o.a.max===10&&o.a.can2,'evolui no nivel 10 com 2 copias');ok(o.b.st===1&&o.b.max===15&&o.b.v1>o.a.v0,'estrela sobe nivel maximo e atributos');ok(o.b.fragSpent>0,'treino gasta fragmentos')}};
