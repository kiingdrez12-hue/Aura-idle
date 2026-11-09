// Os heróis são desenhados em pixel art (tools/pixelfx/fx/hero.js) no lugar do modelo 3D: cada classe com a sua roupa,
// o 3D escondido, o sprite com pixels, golpe e especial tocando uma animação, andar mudando a pose, virar espelhando o
// desenho, e o retrato do perfil vindo do mesmo desenho.
const ok=(c,m)=>{if(!c)throw new Error('FALHOU: '+m)};
module.exports={
 seed:{gold:0,lvl:20,stage:5,maxStage:5,best:5,iv:2,total:5,cls:'knight',ucls:['knight','mage','archer','paladin'],login:{last:'x',streak:1,claimed:true},up:{dmg:5,spd:0,crit:0,gold:0,aura:3,spirit:0,xp:0},gfx:1,gfxAuto:0},
 run:async p=>p.evaluate(()=>{
  const has=typeof HERO2D!=='undefined';if(!has)return{has};
  const pix=()=>{HERO2D.acc=0;heroDraw(1/HERO2D_HZ);const d=HERO2D.part.img.data;let n=0,h=0;for(let i=3;i<d.length;i+=4)if(d[i]){n++;h=(h*31+i+d[i-3])>>>0}return{n,h}};
  const out=[];
  for(const k of ['knight','mage','archer','paladin']){
   S.cls=k;buildHero();enemies.forEach(e=>sc.remove(e.g));enemies=[];target=null;HERO2D.anim=null;HERO2D.moving=false;
   const vis3d=hero.children.filter(o=>o.visible).length,parado=pix();
   // golpe
   const e=spawnEnemy('slime');e.g.position.set(hero.position.x+1.2,0,hero.position.z);target=e;attack();const anim=!!HERO2D.anim;
   for(let i=0;i<2;i++){HERO2D.acc=0;heroDraw(1/HERO2D_HZ)}const golpe=pix();HERO2D.anim=null;
   // especial
   special();const esp=!!HERO2D.anim;HERO2D.anim=null;
   // andando
   HERO2D.moving=true;walk=1.2;const andando=pix();HERO2D.moving=false;
   // virar: olhar para os dois lados da tela espelha o desenho
   face=Math.PI/2;pix();const f1=HERO2D.flip;face=-Math.PI/2;pix();const f2=HERO2D.flip;
   out.push({k,cls:HERO2D.fx.options.cls,vis3d,spr:HERO2D.part.spr.visible,parado,golpe,andando,anim,esp,vira:f1!==f2})}
  for(const k in portCache)delete portCache[k];const b=heroBust(),d=b.getContext('2d').getImageData(0,0,b.width,b.height).data;let rp=0;for(let i=3;i<d.length;i+=4)if(d[i])rp++;
  return{has,out,retrato:rp}}),
 check:r=>{
  ok(r.has,'heroi em pixel art (HERO2D) nao existe');
  const hs=new Set();
  r.out.forEach(x=>{ok(x.cls===x.k,x.k+': roupa da classe');ok(x.vis3d===0,x.k+': modelo 3D escondido');ok(x.spr&&x.parado.n>150,x.k+': sprite desenhado ('+x.parado.n+' px)');
   ok(x.anim,x.k+': golpe toca animacao');ok(x.esp,x.k+': especial toca animacao');ok(x.golpe.h!==x.parado.h,x.k+': pose do golpe diferente da parada');
   ok(x.andando.h!==x.parado.h,x.k+': pose andando diferente da parada');ok(x.vira,x.k+': virar espelha o desenho');hs.add(x.parado.h)});
  ok(hs.size===4,'cada classe com um desenho diferente');ok(r.retrato>2000,'retrato do perfil em pixel art')}};
