// Teste headless do Aura Idle.
// Instalação (uma vez, nesta pasta): npm i three@0.128.0 playwright
// Uso: node run.js <cenario.js> [saida.png]  ·  ou: node run.js all
// Troca as URLs da CDN pelo three local, abre o jogo a 390x844 e roda o cenário.
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const H=__dirname,ROOT=path.join(__dirname,'..','..');
let html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8')
 .replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','node_modules/three/build/three.min.js')
 .replaceAll('https://cdn.jsdelivr.net/npm/three@0.128.0/','node_modules/three/')
 .replace('src="vendor/pixelfx.js"','src="../../vendor/pixelfx.js"')
 .replace('src="vendor/aura-sounds.js"','src="../../vendor/aura-sounds.js"');
fs.writeFileSync(path.join(H,'game.html'),html);
async function one(file,shot){
 const scen=require(path.resolve(file));
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:390,height:844}});
 const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
 if(scen.pre)await p.addInitScript(scen.pre,scen.preArg);
 await p.goto('file://'+path.join(H,'game.html'));await p.waitForTimeout(1500);
 // save inicial: grava uma vez e recarrega (sem init script, que pode rodar de novo a cada reload)
 if(scen.seed){await p.evaluate(sd=>{saveLock=true;localStorage.clear();localStorage.setItem('auraIdleSave1',JSON.stringify(sd))},scen.seed);await p.reload();await p.waitForTimeout(1500)}
 const out=await scen.run(p);
 try{if(scen.check)scen.check(out)}catch(e){errs.push(e.message)}
 if(shot)await p.screenshot({path:shot});
 console.log(JSON.stringify(out));console.log('ERRORS:',errs.length?errs:'none');
 await b.close();return errs.length}
(async()=>{let bad=0;if(process.argv[2]==='all'){for(const f of fs.readdirSync(H).filter(f=>f.endsWith('.js')&&f!=='run.js')){console.log('==',f);bad+=await one(path.join(H,f))}}else bad=await one(process.argv[2],process.argv[3]);process.exit(bad?1:0)})();
