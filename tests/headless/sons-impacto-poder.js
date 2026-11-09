// Sons do SoundWeaver, pausa de impacto, vinheta, Poder de Combate e recompensa da volta.
const path=require('path');
const EV=path.join(__dirname,'..','..','production','qa','evidence');
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 seed:{gold:5000,lvl:12,stage:14,maxStage:14,best:14,iv:2,total:9000,gps:40,tut:99,last:0},
 run:async p=>{const o={};
  await p.mouse.click(195,300);await p.waitForTimeout(1500); // gesto: cria o AudioContext e decodifica os sons
  o.snd=await p.evaluate(()=>({pack:Object.keys(window.AURA_SND||{}).length,dec:Object.keys(SB).length,play:snd('buy')}));
  o.pw=await p.evaluate(()=>{updPower();const a=power(),txt=$('pwrv').textContent;S.gold=1e7;for(let i=0;i<10;i++)buy(UP[0]);updPower();return{a,b:power(),txt,up:$('pwrup').classList.contains('go'),upTxt:$('pwrup').textContent}});
  o.hs=await p.evaluate(()=>{hitStop(.2);return{hs:hsT,grade:!!gradePass}});
  await p.waitForTimeout(800);o.hs.after=await p.evaluate(()=>hsT);
  await p.screenshot({path:path.join(EV,'2026-11-09-poder-hud.png')});
  o.off=await p.evaluate(()=>{const r=offRewards(7200);const f0=S.frag,x0=S.xp+S.lvl*1e9,g0=S.gold;offline(7200);return{r,f0,x0,g0,txt:$('mp').textContent,vis:!$('modal').classList.contains('hidden')}});
  await p.screenshot({path:path.join(EV,'2026-11-09-volta-recompensas.png')});
  await p.click('#mb');await p.waitForTimeout(1200);
  o.after=await p.evaluate(()=>({f:S.frag,x:S.xp+S.lvl*1e9,g:S.gold,chestCard:!$('chestCard').classList.contains('hidden')||chests.length>0||(typeof chestQ!=='undefined'&&chestQ.length>0)}));
  return o},
 check:o=>{
  ok(o.snd.pack===9&&o.snd.dec===9&&o.snd.play===true,'9 sons embutidos e decodificados');
  ok(o.pw.a>0&&o.pw.txt!=='0','poder aparece no HUD');
  ok(o.pw.b>o.pw.a*1.3&&o.pw.up&&o.pw.upTxt.startsWith('▲ +'),'poder sobe ao comprar Lâmina e mostra +X');
  ok(o.hs.hs>=.2&&o.hs.after<=0&&o.hs.grade,'pausa de impacto termina e vinheta existe');
  ok(o.off.vis&&o.off.r.chest===1&&o.off.r.frag>0&&o.off.r.xp>0&&/fragmentos/.test(o.off.txt)&&/Baú de Prata/.test(o.off.txt),'modal da volta lista XP, fragmentos e baú');
  ok(o.after.f>=o.off.f0+o.off.r.frag&&o.after.x>o.off.x0&&o.after.g>o.off.g0&&o.after.chestCard,'coletar dá ouro, XP, fragmentos e baú')}};
