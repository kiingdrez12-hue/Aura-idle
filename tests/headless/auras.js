// Cada tier de aura tem um efeito próprio em volta do corpo do herói, e nada é desenhado no chão.
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 seed:{gold:0,lvl:200,stage:15,maxStage:15,best:15,iv:2,total:5,cls:'knight',login:{last:'x',streak:1,claimed:true},gfx:1,gfxAuto:0},
 run:async p=>p.evaluate(()=>{
  const r=[];const has=typeof AURA!=='undefined';
  for(let i=0;i<10;i++){
   applyTier(i);for(let k=0;k<12;k++)step(.05);
   const pecas3d=[glowDisc,rOut,rIn,rBig,cyl,hel,crown,...vRings,...wings].filter(o=>o.visible).length;
   if(!has){r.push({i,pecas3d});continue}
   AURA.acc=1;auraDraw();
   const [b,f]=AURA.parts,oy=PixelFX.FX.aura.meta.origin[1],w=b.img.width,h=b.img.height;
   let px=0,chao=0,sum=0;
   for(const q of [b,f]){const d=q.img.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=d[(y*w+x)*4+3];if(!a)continue;px++;if(y>oy+3)chao++;sum=(sum*31+x*7+y*13+d[(y*w+x)*4])>>>0}}
   r.push({i,estilo:AURA.fx.options.style,pecas3d,px,chao,sum})}
  return {has,r}}),
 check:o=>{
  ok(o.has,'aura propria por tier (AURA) nao existe');
  o.r.forEach(x=>{ok(x.estilo===x.i,'tier '+x.i+' usa o estilo '+x.i);ok(x.pecas3d===0,'tier '+x.i+': pecas 3D do chao/tubo escondidas');ok(x.px>40,'tier '+x.i+' desenha a aura');ok(x.chao===0,'tier '+x.i+': nada abaixo dos pes')});
  ok(new Set(o.r.map(x=>x.sum)).size===10,'cada tier com um desenho diferente')}};
