'use strict';
const $=s=>document.querySelector(s);
const SUF=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc','UDc','DDc','TDc','QaDc','QiDc','SxDc','SpDc','OcDc','NoDc','Vg'];
function fmt(n){if(!isFinite(n))return '∞';if(n<1000)return n<10&&n%1?n.toFixed(1):Math.floor(n).toString();const e=Math.floor(Math.log10(n)/3);if(e<SUF.length)return (n/10**(e*3)).toFixed(2)+SUF[e];return n.toExponential(2).replace('+','');}
const GENS=[['Hypha','🧵',15,0.1],['Spore Pod','🫛',100,1],['Mushroom Cap','🍄',1100,8],['Rotting Log','🪵',12000,47],['Fairy Ring','⭕',130000,260],['Root Web','🕸️',1.4e6,1400],['Forest Floor','🌲',2e7,7800],['Gaia Network','🌍',3.3e8,44000]];
const MS=[10,25,50,100,150,200,300,400];
// skill tree nodes: id,name,desc,cost,req(any),x,y,eff
const N=[
['r0','Awakening','Production ×1.5',1,[],0,0,{prod:1.5}],
// Feral (up-left)
['t1','Thick Stalk','Tap power ×2',1,['r0'],-110,-60,{tap:2}],
['t2','Sharp Hyphae','+5% crit chance',2,['t1'],-200,-110,{crit:.05}],
['t3','Spore Burst','Crits deal +5× more',3,['t2'],-290,-60,{critx:5}],
['t4','Echo Tap','Taps add 1% of your /s',3,['t2'],-210,-210,{tapPct:.01}],
['t5','Mycelial Fist','Tap power ×3',5,['t4'],-300,-260,{tap:3}],
['t6','Twitch Reflex','Auto-tap 2×/sec',4,['t3'],-390,-110,{auto:2}],
['t7','Keen Edge','+10% crit chance',6,['t5'],-400,-330,{crit:.1}],
['t8','Resonance','Taps add 3% of your /s',8,['t6','t7'],-480,-220,{tapPct:.03}],
['t9','Fungal Drummer','Auto-tap +5/sec',10,['t8'],-570,-160,{auto:5}],
['t10','Primal Bloom','Tap power ×5',15,['t8'],-560,-310,{tap:5}],
['tc','★ Frenzy Bloom','CAPSTONE: taps add 10% of /s, crits ×10',25,['t9','t10'],-660,-250,{tapPct:.1,critx:10},1],
// Network (right)
['i1','Deep Roots','Production ×2',1,['r0'],120,-40,{prod:2}],
['i2','Fast Spread','Hypha & Spore Pod ×3',2,['i1'],220,-90,{g0:3,g1:3}],
['i3','Thrift','Costs −5%',3,['i1'],220,20,{cost:.95}],
['i4','Long Sleep','Offline cap 4h → 12h',3,['i2'],320,-150,{offH:8}],
['i5','Dense Mesh','Production ×2',5,['i3'],320,70,{prod:2}],
['i6','Dreaming Network','Offline earnings 50% → 100%',5,['i4'],420,-200,{offE:.5}],
['i7','Bulk Growth','Costs −10%',8,['i5'],420,110,{cost:.9}],
['i8','Ancestral Pattern','Milestones give ×3 instead of ×2',8,['i5','i6'],460,-40,{ms:1}],
['i9','Old Growth','Tiers 5–8 ×3',10,['i8'],560,-110,{g4:3,g5:3,g6:3,g7:3}],
['i10','Overgrowth','Production ×3',15,['i8','i7'],560,40,{prod:3}],
['ic','★ Ancient Network','CAPSTONE: +1% production per producer owned',25,['i9','i10'],670,-30,{perGen:.01},1],
// Rot (down)
['d1','Truffle Nose','Truffles appear 40% more often',1,['r0'],-30,120,{tfreq:1.4}],
['d2','Golden Rot','Truffle rewards ×2',2,['d1'],-110,200,{tmul:2}],
['d3','Spore Sacs','Spores gained +25%',3,['d1'],50,210,{spore:1.25}],
['d4','Leftovers','Start each run with 1K Nutrients',2,['d2'],-200,260,{start:1000}],
['d5','Wild Frenzy','Frenzy lasts 60s instead of 30s',5,['d2'],-110,320,{fdur:30}],
['d6','Spore Cloud','Spores gained +50%',6,['d3'],60,330,{spore:1.5}],
['d7','Hoarder','Unspent spores +1% more each',8,['d6'],150,400,{bank:.01}],
['d8','Seed Bank','Start each run with 10 Hyphae',6,['d4'],-260,370,{seed:10}],
['d9','Truffle King','Truffle rewards ×3',10,['d5','d8'],-200,450,{tmul:3}],
['d10','Sporestorm','Spores gained ×2',15,['d7'],60,480,{spore:2}],
['dc','★ Rotkeeper','CAPSTONE: spores ×3, unspent spores +3% more each',25,['d9','d10'],-70,560,{spore:3,bank:.03},1],
// Bridges
['x1','Symbiosis','Tap ×2 and production ×1.5',4,['t3','i3'],-80,-170,{tap:2,prod:1.5}],
['x2','Compost','Costs −5%, Truffles 25% more often',4,['i3','d3'],200,220,{cost:.95,tfreq:1.25}],
['x3','Lucky Strike','+5% crit, Truffle rewards ×1.5',4,['t3','d4'],-300,120,{crit:.05,tmul:1.5}],
];
const NODE={};N.forEach(n=>NODE[n[0]]={id:n[0],name:n[1],desc:n[2],cost:n[3],req:n[4],x:n[5],y:n[6],eff:n[7],cap:!!n[8]});

let S;
function fresh(){return{nut:0,run:0,total:0,gens:Array(8).fill(0),spores:0,sporesTotal:0,tree:{},taps:0,prestiges:0,last:Date.now(),frenzyEnd:0,mode:'1',started:Date.now()}}
function E(){ // aggregate effects
 const e={prod:1,tap:1,crit:0,critx:2,tapPct:0,auto:0,cost:1,offH:4,offE:.5,ms:0,perGen:0,tfreq:1,tmul:1,spore:1,start:0,seed:0,bank:.02,fdur:30,g:Array(8).fill(1)};
 for(const id in S.tree){if(!S.tree[id])continue;const f=NODE[id].eff;for(const k in f){const v=f[k];
  if(k[0]=='g'&&k.length==2)e.g[+k[1]]*=v;else if(['prod','tap','cost','tfreq','tmul','spore'].includes(k))e[k]*=v;else e[k]+=v;}}
 return e;}
let FX;
function genRate(i){const n=S.gens[i];let m=1;MS.forEach(t=>{if(n>=t)m*=FX.ms?3:2});return GENS[i][3]*n*m*FX.g[i];}
function globalMult(){const owned=S.gens.reduce((a,b)=>a+b,0);return FX.prod*(1+S.spores*FX.bank)*(1+owned*FX.perGen)*(Date.now()<S.frenzyEnd?7:1);}
function rate(){let r=0;for(let i=0;i<8;i++)r+=genRate(i);return r*globalMult();}
function cost(i,k){const b=GENS[i][2]*FX.cost,n=S.gens[i];return b*1.15**n*(1.15**k-1)/.15;}
function maxBuy(i){const b=GENS[i][2]*FX.cost*1.15**S.gens[i];return Math.max(0,Math.floor(Math.log(S.nut*.15/b+1)/Math.log(1.15)));}
function tapVal(){return (1*FX.tap+rate()*FX.tapPct)*(Date.now()<S.frenzyEnd?7:1)}
function sporeGain(){return Math.floor(Math.sqrt(S.run/1e6)*FX.spore)}
function spentSp(){let s=0;for(const id in S.tree)if(S.tree[id])s+=NODE[id].cost;return s}
function gain(x){S.nut+=x;S.run+=x;S.total+=x}

// ---- tapping
function doTap(px,py,auto){let v=tapVal(),c=Math.random()<FX.crit;if(c)v*=FX.critx;gain(v);S.taps++;
 if(!auto){if(navigator.vibrate&&c)navigator.vibrate(15);}
 if(window.S3D)S3D.hit(c,auto);pop(px,py,'+'+fmt(v),c);}
let popN=0;function pop(x,y,t,c){if(popN>25)return;popN++;const d=document.createElement('div');d.className='pop'+(c?' crit':'');d.textContent=t;
 d.style.left=(x-20+(Math.random()*30-15))+'px';d.style.top=(y-20)+'px';document.body.appendChild(d);setTimeout(()=>{d.remove();popN--},900);}

// ---- gens UI
function buildGens(){const g=$('#gens');g.innerHTML='';GENS.forEach((G,i)=>{const d=document.createElement('div');d.className='gen';d.id='g'+i;
 d.innerHTML=`<div class="ic">${G[1]}</div><div class="info"><div class="nm">${G[0]}</div><div class="sub"></div><div class="bar"><i></i></div></div><div class="cnt"></div>`;
 d.addEventListener('pointerdown',e=>{e.preventDefault();buy(i)});g.appendChild(d);});}
function buyCount(i){return S.mode=='max'?Math.max(1,maxBuy(i)):+S.mode}
function buy(i){const k=buyCount(i),c=cost(i,k);if(S.nut<c||!unlocked(i))return;S.nut-=c;S.gens[i]+=k;const d=$('#g'+i);d.classList.remove('bought');void d.offsetWidth;d.classList.add('bought');if(navigator.vibrate)navigator.vibrate(5);}
function unlocked(i){return i==0||S.gens[i-1]>0||S.gens[i]>0}
document.querySelectorAll('#buymode button').forEach(b=>b.onclick=()=>{S.mode=b.dataset.m;document.querySelectorAll('#buymode button').forEach(x=>x.classList.toggle('on',x==b))});
function drawGens(){const gm=globalMult();GENS.forEach((G,i)=>{const d=$('#g'+i),k=buyCount(i),c=cost(i,k),ul=unlocked(i);
 d.classList.toggle('lock',!ul);d.classList.toggle('can',ul&&S.nut>=c);
 const n=S.gens[i],next=MS.find(t=>t>n)||n,prev=[0,...MS].filter(t=>t<=n).pop();
 d.querySelector('.sub').textContent=ul?`Buy ${k}: ${fmt(c)} · ${fmt(genRate(i)*gm)}/s`:'???';
 d.querySelector('.cnt').textContent=n;d.querySelector('.bar i').style.width=(next>prev?(n-prev)/(next-prev)*100:100)+'%';});}

// ---- tabs
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));
 document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.id=='tab-'+b.dataset.t));if(b.dataset.t=='tree')drawTree();});

// ---- skill tree
const svg=$('#tree');let view={x:0,y:0,s:.8},sel=null;
function canBuy(n){if(S.tree[n.id])return false;if(n.req.length&&!n.req.some(r=>S.tree[r]))return false;if(n.cap&&N.some(m=>m[8]&&S.tree[m[0]]))return false;return true}
function drawTree(){const w=svg.clientWidth||360,h=svg.clientHeight||600;let s=`<g transform="translate(${w/2+view.x},${h/2+view.y}) scale(${view.s})">`;
 Object.values(NODE).forEach(n=>n.req.forEach(r=>{const p=NODE[r];s+=`<line x1="${p.x}" y1="${p.y}" x2="${n.x}" y2="${n.y}" stroke="${S.tree[n.id]&&S.tree[r]?'#b28cff':'#3b2f57'}" stroke-width="4"/>`}));
 Object.values(NODE).forEach(n=>{const own=S.tree[n.id],ok=canBuy(n),aff=ok&&S.spores>=n.cost,col=n.id[0]=='t'?'#ff8a5c':n.id[0]=='i'?'#5cd0ff':n.id[0]=='d'?'#9be26a':n.id[0]=='x'?'#ffd84d':'#e6c3ff';
  const r=n.cap?30:22;s+=`<g data-id="${n.id}" class="nd"><circle cx="${n.x}" cy="${n.y}" r="${r+10}" fill="transparent"/><circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${own?col:'#1a1428'}" stroke="${own?'#fff':aff?col:ok?'#776':'#333'}" stroke-width="${sel==n.id?6:3}" opacity="${own||ok?1:.45}"/>`+
  `<text x="${n.x}" y="${n.y+5}" text-anchor="middle" font-size="${n.cap?18:14}" fill="${own?'#111':'#ddd'}" font-weight="700">${own?'✓':n.cost}</text></g>`});
 svg.innerHTML=s+'</g>';$('#treesp').textContent=`🌀 ${fmt(S.spores)} Spores`;}
function showNode(id){sel=id;const n=NODE[id],own=S.tree[id],ok=canBuy(n),el=$('#nodeinfo');el.classList.remove('hide');
 let why=own?'Owned':!ok?(n.cap&&N.some(m=>m[8]&&S.tree[m[0]])?'You can only own one capstone':'Requires a connected node'):`Cost: ${n.cost} Spores`;
 el.innerHTML=`<b>${n.name}</b><div>${n.desc}</div><div class="dim">${why}</div>`+(ok?`<button id="nb" ${S.spores>=n.cost?'':'disabled'}>Unlock (${n.cost})</button>`:'')+`<button id="nc">Close</button>`;
 if(ok)$('#nb').onclick=()=>{if(S.spores<n.cost)return;S.spores-=n.cost;S.tree[id]=1;FX=E();toast('Unlocked '+n.name);showNode(id);drawTree()};
 $('#nc').onclick=()=>{sel=null;el.classList.add('hide');drawTree()};drawTree();}
// pan/zoom
const ptrs=new Map();let pinch0=null,moved=0,downId=null;
svg.addEventListener('pointerdown',e=>{svg.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=0;const g=e.target.closest('.nd');downId=g?g.dataset.id:null;
 if(ptrs.size==2){const [a,b]=[...ptrs.values()];pinch0={d:Math.hypot(a.x-b.x,a.y-b.y),s:view.s}}});
svg.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;const p=ptrs.get(e.pointerId),dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
 if(ptrs.size==2&&pinch0){const [a,b]=[...ptrs.values()];view.s=Math.min(2.5,Math.max(.3,pinch0.s*Math.hypot(a.x-b.x,a.y-b.y)/pinch0.d));moved=99}
 else{view.x+=dx;view.y+=dy;moved+=Math.abs(dx)+Math.abs(dy)}drawTree();});
const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch0=null;if(moved<8&&downId)showNode(downId);downId=null};
svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',up);
svg.addEventListener('wheel',e=>{e.preventDefault();view.s=Math.min(2.5,Math.max(.3,view.s*(e.deltaY<0?1.1:.9)));drawTree()},{passive:false});
$('#center').onclick=()=>{view={x:0,y:0,s:.8};drawTree()};
$('#respec').onclick=()=>{const sp=spentSp();if(!sp)return toast('Nothing to refund');if(!confirm(`Refund all ${sp} Spores?`))return;S.spores+=sp;S.tree={};FX=E();sel=null;$('#nodeinfo').classList.add('hide');drawTree();toast('Tree reset')};

// ---- prestige
function newRun(){S.nut=FX.start;S.run=0;S.gens=Array(8).fill(0);S.gens[0]=FX.seed;S.frenzyEnd=0}
$('#prestige').onclick=()=>{const g=sporeGain();if(g<1)return;if(!confirm(`Sporulate for ${g} Spores? Your Nutrients and producers will reset.`))return;
 S.spores+=g;S.sporesTotal+=g;S.prestiges++;newRun();save();toast(`+${g} Spores! Spend them in the Tree 🕸️`)};

// ---- truffles
let nextTruffle=Date.now()+30000;
function spawnTruffle(){if(window.S3D)return S3D.spawnTruffle();const t=$('#truffle');t.style.left=(20+Math.random()*(innerWidth-110))+'px';t.style.top=(140+Math.random()*(innerHeight-300))+'px';t.classList.remove('hide');
 clearTimeout(t._h);t._h=setTimeout(()=>t.classList.add('hide'),12000);}
$('#truffle').addEventListener('pointerdown',e=>{e.preventDefault();$('#truffle').classList.add('hide');collectTruffle()});
function collectTruffle(){
 if(Math.random()<.35){S.frenzyEnd=Date.now()+FX.fdur*1000;toast(`FRENZY! ×7 for ${FX.fdur}s`)}else{const v=Math.max(50,rate()*60*FX.tmul+S.nut*.05);gain(v);toast('Truffle! +'+fmt(v))}
 if(navigator.vibrate)navigator.vibrate([20,30,20]);}

// ---- misc UI
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),1800)}
function modal(html){$('#modalc').innerHTML=html+'<br><button id="mok" class="cta">Nice!</button>';$('#modal').classList.remove('hide');$('#mok').onclick=()=>$('#modal').classList.add('hide')}
function drawTop(){$('#nut').textContent=fmt(S.nut);$('#rate').textContent=fmt(rate())+' nutrients/s';
 $('#spores').textContent=S.spores||S.sporesTotal?`🌀 ${fmt(S.spores)} Spores (+${fmt(S.spores*FX.bank*100)}% prod)`:'';
 const fr=S.frenzyEnd-Date.now();$('#frenzy').textContent=fr>0?`FRENZY ×7 · ${Math.ceil(fr/1000)}s`:'';
 const g=sporeGain();$('#pgain').textContent=fmt(g);$('#prestige').disabled=g<1;$('#bankpct').textContent='+'+fmt(FX.bank*100)+'%';
 const need=((g+1)/FX.spore)**2*1e6;$('#pnext').textContent=`Run Nutrients: ${fmt(S.run)} · next Spore at ${fmt(need)}`;}
function drawStats(){$('#stats').innerHTML=`Total nutrients: ${fmt(S.total)}<br>Taps: ${fmt(S.taps)}<br>Sporulations: ${S.prestiges}<br>Lifetime spores: ${fmt(S.sporesTotal)}<br>Tap power: ${fmt(tapVal())} · Crit ${Math.round(FX.crit*100)}% ×${FX.critx}<br>Offline: ${FX.offH}h cap at ${FX.offE*100}%`}

// ---- save/load
const KEY='sporefall-v1';
function save(){S.last=Date.now();localStorage.setItem(KEY,JSON.stringify(S))}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d){S=Object.assign(fresh(),d);return true}}catch(e){}S=fresh();return false}
$('#exp').onclick=()=>{save();$('#savebox').value=btoa(JSON.stringify(S));$('#savebox').select();toast('Copy the text below')};
$('#imp').onclick=()=>{try{const d=JSON.parse(atob($('#savebox').value.trim()));localStorage.setItem(KEY,JSON.stringify(d));location.reload()}catch(e){toast('Invalid save')}};
$('#wipe').onclick=()=>{if(confirm('Erase ALL progress?')){localStorage.removeItem(KEY);S=fresh();FX=E();location.reload()}};
function offline(){const dt=Math.min((Date.now()-S.last)/1000,FX.offH*3600);if(dt<30)return;const f=S.frenzyEnd;S.frenzyEnd=0;const g=rate()*dt*FX.offE;S.frenzyEnd=f;if(g>0){gain(g);
 modal(`<h2>Welcome back!</h2><p>Your network grew while you were away (${Math.floor(dt/60)} min).</p><p class="big">+${fmt(g)}</p>`)}}

// ---- loop
const had=load();FX=E();buildGens();offline();
let lastT=performance.now(),autoAcc=0,uiAcc=0,saveAcc=0;
function loop(t){const dt=Math.min(1,(t-lastT)/1000);lastT=t;gain(rate()*dt);
 if(FX.auto){autoAcc+=dt*FX.auto;const sp=window.S3D?S3D.shroomScreen():{x:innerWidth/2,y:innerHeight/3};while(autoAcc>=1){autoAcc--;doTap(sp.x,sp.y,1)}}
 if(Date.now()>nextTruffle){spawnTruffle();nextTruffle=Date.now()+(60000+Math.random()*90000)/FX.tfreq}
 uiAcc+=dt;if(uiAcc>.1){uiAcc=0;drawTop();drawGens();if($('#tab-more').classList.contains('on'))drawStats()}
 saveAcc+=dt;if(saveAcc>10){saveAcc=0;save()}requestAnimationFrame(loop)}
requestAnimationFrame(loop);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();else{load();FX=E();offline()}});
addEventListener('pagehide',save);
if(!had)setTimeout(()=>toast('Tap the mushroom! 🍄'),500);
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
window.__game={get S(){return S},save,load,E:()=>FX=E(),doTap,collectTruffle,buy};
