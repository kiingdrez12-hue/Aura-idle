// O herói não tem mais aura desenhada, em nenhum tier: nem o efeito do pixelfx (saiu do pacote), nem as peças 3D
// antigas (disco, anéis, tubo, espiral, coroa, asas, partículas). O tier continua no HUD e na cor dos golpes.
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 seed:{gold:0,lvl:200,stage:15,maxStage:15,best:15,iv:2,total:5,cls:'knight',tut:99,asc:1,auraLv:2,login:{last:'x',streak:1,claimed:true},gfx:1,gfxAuto:0},
 run:async p=>p.evaluate(()=>{
  const r=[];
  for(let i=0;i<10;i++){
   applyTier(i);for(let k=0;k<20;k++)step(.05);
   const pecas3d=[glowDisc,rOut,rIn,rBig,cyl,hel,crown,crownH,aPts,...vRings,...wings].filter(o=>o.visible).length;
   // partículas da aura: nenhuma acesa
   let pts=0;const c=aPts.geometry.attributes.color.array;for(let k=0;k<c.length;k++)if(c[k]>0)pts++;
   r.push({i,pecas3d,pts,hud:$('tier').textContent})}
  return {fx:!!(window.PixelFX&&PixelFX.FX.aura),spr:typeof AURA!=='undefined',painel:!!$('alg'),r}}),
 check:o=>{
  ok(!o.fx,'efeito aura fora do pacote do pixelfx');ok(!o.spr,'sprites da aura removidos');ok(!o.painel,'opcao Intensidade da aura removida da aba Heroi');
  o.r.forEach(x=>{ok(x.pecas3d===0,'tier '+x.i+': nenhuma peca 3D de aura visivel');ok(x.pts===0,'tier '+x.i+': nenhuma particula de aura');ok(x.hud.startsWith('AURA '),'tier '+x.i+' continua no HUD')})}};
