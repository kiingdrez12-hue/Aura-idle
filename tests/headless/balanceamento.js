// Curva da 1ª corrida: um jogador novo que compra a melhoria mais barata sempre que pode
// e equipa os melhores itens a cada 30s. Confere o ritmo da aura e o aviso de ascensão na parede.
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 run:async p=>p.evaluate(()=>{saveLock=true;const r={tier:{},dot:{},fails:{},stage:{}};let eqT=0,firstNudge=null;
  const buy=()=>{for(let k=0;k<50;k++){let best=null,bc=1e300;UP.forEach(u=>{if(!unlocked[u.k]||(u.max&&S.up[u.k]>=u.max))return;const c=costN(u,S.up[u.k],1);if(c<bc){bc=c;best=u}});if(!best||bc>S.gold)break;S.gold-=bc;S.up[best.k]++}};
  for(let m=1;m<=40;m++){for(let i=0;i<1200;i++){step(.05);if(i%20===0)buy();eqT+=.05;if(eqT>30){eqT=0;$('autoEq').onclick()}if(firstNudge===null&&(typeof ascNudge==='function'?ascNudge():$('dotAsc').classList.contains('on')))firstNudge=m}
   updAsc();$('pgAsc').classList.add('hidden');updAsc();
   if([6,10,20,40].includes(m)){r.tier[m]=S.tier;r.dot[m]=$('dotAsc').classList.contains('on');r.stage[m]=S.maxStage}}
  r.firstNudge=firstNudge;r.gainAtNudge=soulGain();return r}),
 check:r=>{
  // pior caso: este jogador compra tudo o que pode. Antes: Mitica aos 6 min e Ancestral aos 10.
  ok(r.tier[6]<=4,'aura no maximo Lendaria aos 6 min');
  ok(r.tier[10]>=3&&r.tier[10]<=5,'aura entre Epica e Mitica aos 10 min');
  ok(r.tier[20]<=5,'aura no maximo Mitica aos 20 min');
  ok(r.stage[6]>=30&&!r.dot[6],'estagio 30 ja liberou a ascensao aos 6 min, mas o ponto vermelho nao chama');
  ok(r.firstNudge!==null&&r.firstNudge>=12,'aviso de ascensao so aparece na parede (depois de 12 min)');
  ok(r.stage[20]>=80,'sem parede antes do estagio 80 nos primeiros 20 min')}};
