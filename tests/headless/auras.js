// Cada tier de aura tem um emblema circular próprio atrás do herói, na altura do quadril (o anel pode passar um
// pouco dos pés, como um brasão atrás dele, mas não se espalha pelo chão).
// Também: as partículas que giravam nos pés e a luz rente ao chão saem, e o corpo da aura tem a altura do herói na tela
// (antes a aura contornava um boneco 2D quase duas vezes maior que o herói visto de cima e ficava deslocada).
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 seed:{gold:0,lvl:200,stage:15,maxStage:15,best:15,iv:2,total:5,cls:'knight',login:{last:'x',streak:1,claimed:true},gfx:1,gfxAuto:0},
 run:async p=>p.evaluate(()=>{
  const r=[];const has=typeof AURA!=='undefined';
  for(let i=0;i<10;i++){
   applyTier(i);for(let k=0;k<12;k++)step(.05);
   const pecas3d=[glowDisc,rOut,rIn,rBig,cyl,hel,crown,aPts,...vRings,...wings].filter(o=>o.visible).length,luz=+pL.position.y.toFixed(2);
   if(!has){r.push({i,pecas3d});continue}
   if(typeof heroDraw==='function')heroDraw(0);
   AURA.acc=1;auraDraw();
   // altura do corpo da aura na tela (BODY_TOP px do sprite) contra a altura do herói 3D na tela
   const [b0]=AURA.parts,M=PixelFX.FX.aura,bt=M.BODY_TOP||44,vd=b0.spr.position.clone().applyMatrix4(cam.matrixWorldInverse).z*-1;
   const auraH=b0.spr.scale.y*bt/M.meta.size[1]/(2*Math.tan(cam.fov*Math.PI/360)*vd);
   // com o herói em pixel art, compara com a altura do corpo dele no sprite (HERO_PX px); sem ele, com o herói 3D
   let heroH;if(typeof HERO2D!=='undefined'&&HERO2D.fx){const q=HERO2D.part.spr,vq=q.position.clone().applyMatrix4(cam.matrixWorldInverse).z*-1;heroH=q.scale.y*HERO_PX/PixelFX.FX.hero.meta.size[1]/(2*Math.tan(cam.fov*Math.PI/360)*vq)}
   else{const bb=new THREE.Box3().setFromObject(hero),pf=hero.position.clone().project(cam).y,ph=new THREE.Vector3(hero.position.x,bb.max.y,hero.position.z).project(cam).y;heroH=(ph-pf)/2}
   const prop=+(auraH/heroH).toFixed(2);
   const [b,f]=AURA.parts,oy=PixelFX.FX.aura.meta.origin[1],w=b.img.width,h=b.img.height;
   let px=0,chao=0,sum=0;
   for(const q of [b,f]){const d=q.img.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=d[(y*w+x)*4+3];if(!a)continue;px++;if(y>oy+20)chao++;sum=(sum*31+x*7+y*13+d[(y*w+x)*4])>>>0}}
   r.push({i,estilo:AURA.fx.options.style,pecas3d,luz,prop,px,chao,sum})}
  return {has,r}}),
 check:o=>{
  ok(o.has,'aura propria por tier (AURA) nao existe');
  o.r.forEach(x=>{ok(x.estilo===x.i,'tier '+x.i+' usa o estilo '+x.i);ok(x.pecas3d===0,'tier '+x.i+': pecas 3D do chao/tubo escondidas');ok(x.px>40,'tier '+x.i+' desenha a aura');ok(x.chao===0,'tier '+x.i+': emblema nao se espalha pelo chao');
   ok(x.luz>=1,'tier '+x.i+': luz da aura no peito, nao rente ao chao (y='+x.luz+')');ok(x.prop>.7&&x.prop<1.1,'tier '+x.i+': corpo da aura do tamanho do heroi na tela (proporcao '+x.prop+')')});
  ok(new Set(o.r.map(x=>x.sum)).size===10,'cada tier com um desenho diferente')}};
