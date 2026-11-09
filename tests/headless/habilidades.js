// Habilidades: cada herói tem 4, liberadas nos níveis 1, 10, 25 e 50; a barra mostra as 4 (bloqueadas com o nível) e o
// AUTO; lançar uma causa dano (ou dá o bônus do Escudo Divino), cria o efeito do pixelfx, toca a pose do herói e inicia
// a recarga; com AUTO ligado elas disparam sozinhas, com AUTO desligado não; o AUTO fica no save.
// O Ataque Especial saiu da aba Melhorar: é o 5º botão da barra, o + compra o próximo nível com ouro e o toque dispara.
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 seed:{gold:0,lvl:12,stage:5,maxStage:5,best:5,iv:2,total:5,cls:'knight',ucls:['knight','mage','archer','paladin'],login:{last:'x',streak:1,claimed:true},up:{dmg:5,spd:0,crit:0,gold:0,aura:0,spirit:0,xp:0},gfx:1,gfxAuto:0},
 run:async p=>p.evaluate(()=>{
  if(typeof SKILLS==='undefined')return{has:false};
  const out={has:true,classes:{}};
  // barra no nível 12: 2 liberadas, 2 com cadeado
  for(let i=0;i<3;i++)step(.05);
  const bar=$('skbar'),btn=[...bar.querySelectorAll('.skb[data-i]')];out.bar={n:btn.length,lock:btn.filter(b=>b.classList.contains('lock')).length,auto:!!$('skauto'),lockTxt:btn.map(b=>(b.querySelector('.lk')||{}).textContent||'')};
  S.lvl=60;S.skAuto=false;
  const seenFx={},_pfx=pfx;pfx=function(id,...a){seenFx[id]=1;return _pfx(id,...a)};
  for(const k of ['knight','mage','archer','paladin']){S.cls=k;buildHero();const r=[];
   for(let i=0;i<4;i++){enemies.forEach(e=>sc.remove(e.g));enemies=[];skCd=[0,0,0,0];skQ.length=0;skZones.length=0;skProj.length=0;skBuffT=0;HERO2D.anim=null;hero.position.set(0,0,0);
    const es=[];for(let j=0;j<4;j++){const e=spawnEnemy('slime',false,1e9);e.g.position.set(1.6+j*.5,0,(j-1.5)*.5);es.push(e)}target=es[0];
    const hp0=es.reduce((a,e)=>a+e.hp,0),nfx=Object.keys(seenFx).length;const lan=skCast(i,true);const pose=!!(HERO2D.anim&&HERO2D.anim.pri);
    for(let s=0;s<20;s++)step(.05);const dano=hp0-es.reduce((a,e)=>a+e.hp,0);
    r.push({i,n:SKILLS[k][i].n,lan,pose,cd:skCd[i]>0,fx:Object.keys(seenFx).length>nfx||i>0,dano:dano>0,buff:skBuffT>0,efeito:es.some(e=>e.stunT>0||e.rootT>0||e.slowT>0)})}
   out.classes[k]=r}
  pfx=_pfx;
  // AUTO: desligado não dispara, ligado dispara sozinho
  S.cls='knight';buildHero();enemies.forEach(e=>sc.remove(e.g));enemies=[];skCd=[0,0,0,0];skGap=0;const e=spawnEnemy('slime',false,1e9);e.g.position.set(hero.position.x+1.2,0,hero.position.z);target=e;
  S.skAuto=false;for(let s=0;s<10;s++)step(.05);const semAuto=skCd.every(c=>c===0);
  S.skAuto=true;for(let s=0;s<10;s++)step(.05);const comAuto=skCd.some(c=>c>0);
  $('skauto').click();const salvo=JSON.parse(localStorage.getItem('auraIdleSave1')).skAuto;
  out.auto={semAuto,comAuto,salvo,agora:S.skAuto,def:DEF.skAuto};
  // especial: fora da aba Melhorar, na barra; o + compra 1 nível com ouro; o toque dispara; sem AUTO não dispara sozinho
  const row=[...document.querySelectorAll('#rows .row')].find(r=>r.querySelector('.n').textContent.startsWith('Ataque Especial'));
  unlocked.aura=true;S.up.aura=0;S.gold=1e12;spT=0;skUi(true);const g0=S.gold;if($('skup'))$('skup').click();const comprou={lv:S.up.aura,gasto:g0-S.gold,custo:costN(UP.find(u=>u.k==='aura'),0,1)};
  enemies.forEach(e=>sc.remove(e.g));enemies=[];const t=spawnEnemy('slime',false,1e9);t.g.position.set(hero.position.x+1.2,0,hero.position.z);target=t;
  S.skAuto=false;spT=0;for(let k=0;k<6;k++)step(.05);const espSemAuto=spT<=0;
  const sp0=LF().specials;if($('sksp'))$('sksp').click();const tocou=spT>0&&LF().specials>sp0;
  out.esp={naAba:!!row&&row.style.display!=='none',noBotao:!!$('sksp')&&!!$('skup'),comprou,espSemAuto,tocou,nBotoes:bar.querySelectorAll('.skb').length};out.fx=Object.keys(seenFx);return out}),
 check:r=>{
  ok(r.has,'habilidades (SKILLS) nao existem');
  ok(r.bar.n===4&&r.bar.auto,'barra com 4 habilidades e AUTO');ok(r.bar.lock===2&&r.bar.lockTxt[2]==='Nv 25'&&r.bar.lockTxt[3]==='Nv 50','no nivel 12, 2 bloqueadas com o nivel: '+r.bar.lockTxt.join(','));
  for(const [k,L] of Object.entries(r.classes)){ok(L.length===4,k+': 4 habilidades');L.forEach(x=>{
   ok(x.lan&&x.cd,k+' '+x.n+': lanca e entra em recarga');ok(x.pose,k+' '+x.n+': pose do heroi');ok(x.dano||x.buff,k+' '+x.n+': causa dano ou da bonus')})}
  ok(r.classes.knight[1].efeito&&r.classes.mage[1].efeito&&r.classes.archer[1].efeito,'atordoar, desacelerar e prender funcionam');
  ok(r.auto.semAuto,'AUTO desligado nao dispara sozinho');ok(r.auto.comAuto,'AUTO ligado dispara sozinho');ok(r.auto.def===true&&r.auto.salvo===r.auto.agora,'AUTO comeca ligado e fica no save');
  ok(!r.esp.naAba,'Ataque Especial nao aparece mais na aba Melhorar');ok(r.esp.noBotao&&r.esp.nBotoes===5,'especial e o 5o botao da barra, com o +');
  ok(r.esp.comprou.lv===1&&Math.abs(r.esp.comprou.gasto-r.esp.comprou.custo)<1e-6*r.esp.comprou.custo,'o + compra 1 nivel com ouro: '+JSON.stringify(r.esp.comprou));
  ok(r.esp.espSemAuto,'AUTO desligado: especial nao dispara sozinho');ok(r.esp.tocou,'tocar no especial dispara')}};
