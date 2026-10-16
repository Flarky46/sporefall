import * as THREE from './vendor/three.module.min.js';
const G=window.__game, $=s=>document.querySelector(s);
const canvas=$('#world');
const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});
let pr=Math.min(devicePixelRatio||1,1.5);renderer.setPixelRatio(pr);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x07050d);scene.fog=new THREE.FogExp2(0x0b0716,0.045);
const cam=new THREE.PerspectiveCamera(70,1,0.1,80);cam.position.set(0,1.6,0);
scene.add(new THREE.HemisphereLight(0x6a4bb0,0x0a1a08,0.9));
const glow=new THREE.PointLight(0xc070ff,30,18,1.5);glow.position.set(0,4.5,-7);scene.add(glow);
const RND=(()=>{let a=1234567;return()=>((a=(a*16807)%2147483647)/2147483647)})();
// ground: low-poly disc with glowing speckles
{const g=new THREE.CircleGeometry(40,48,0,Math.PI*2);g.rotateX(-Math.PI/2);
 scene.add(new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0x14201a})));
 const n=900,pos=new Float32Array(n*3),col=new Float32Array(n*3),c=new THREE.Color();
 for(let i=0;i<n;i++){const r=1+RND()*30,a=RND()*6.283;pos.set([Math.cos(a)*r,0.02,Math.sin(a)*r],i*3);c.setHSL(0.3+RND()*0.5,1,0.4+RND()*0.3);col.set([c.r,c.g,c.b],i*3)}
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));pg.setAttribute('color',new THREE.BufferAttribute(col,3));
 scene.add(new THREE.Points(pg,new THREE.PointsMaterial({size:0.05,vertexColors:true,fog:true})));
 // background trees
 const tg=new THREE.ConeGeometry(1.2,7,6);tg.translate(0,3.5,0);const tm=new THREE.InstancedMesh(tg,new THREE.MeshLambertMaterial({color:0x0c1410}),70),m=new THREE.Matrix4();
 for(let i=0;i<70;i++){const a=RND()*6.283,r=16+RND()*14,s=0.7+RND();m.makeScale(s,s*(0.8+RND()*0.6),s).setPosition(Math.cos(a)*r,0,Math.sin(a)*r);tm.setMatrixAt(i,m)}scene.add(tm);}
// giant mushroom
const shroom=new THREE.Group();shroom.position.set(0,0,-10);scene.add(shroom);
const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.7,2.4,10),new THREE.MeshLambertMaterial({color:0xe8dcc0,emissive:0x302418}));stem.position.y=1.2;
const capG=new THREE.SphereGeometry(1.9,14,8,0,Math.PI*2,0,Math.PI/2);capG.scale(1,0.75,1);
const capM=new THREE.MeshLambertMaterial({color:0xe04070,emissive:0x802050});const cap=new THREE.Mesh(capG,capM);cap.position.y=2.3;
shroom.add(stem,cap);
{const sg=new THREE.IcosahedronGeometry(0.18,0),sm=new THREE.MeshBasicMaterial({color:0xfff0ff});
 for(let i=0;i<14;i++){const t=RND()*1.2+0.2,a=RND()*6.283,d=new THREE.Mesh(sg,sm);d.position.set(Math.sin(t)*Math.cos(a)*1.9,2.3+Math.cos(t)*1.42,Math.sin(t)*Math.sin(a)*1.9);cap.parent.add(d)}}
const hitbox=new THREE.Mesh(new THREE.CylinderGeometry(2.1,1,3.8,8),new THREE.MeshBasicMaterial({visible:false}));hitbox.position.y=1.9;shroom.add(hitbox);
let squash=0;
// producers: instanced, capped
const CAP=48;
const mk=(geo,color,emi)=>new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color,emissive:emi}),CAP);
const geos=[
 (()=>{const g=new THREE.CylinderGeometry(0.03,0.05,0.9,4);g.translate(0,0.45,0);return mk(g,0x88ffcc,0x22aa77)})(),
 (()=>{const g=new THREE.IcosahedronGeometry(0.22,0);g.translate(0,0.22,0);return mk(g,0x77dd55,0x225511)})(),
 (()=>{const g=new THREE.ConeGeometry(0.35,0.5,7);g.translate(0,0.6,0);return mk(g,0xff6688,0x661122)})(),
 (()=>{const g=new THREE.CylinderGeometry(0.25,0.25,1.6,6);g.rotateZ(Math.PI/2);g.translate(0,0.25,0);return mk(g,0x6b4a2b,0x1a0f05)})(),
 (()=>{const g=new THREE.TorusGeometry(0.8,0.07,4,16);g.rotateX(Math.PI/2);g.translate(0,0.05,0);return mk(g,0xffe066,0x886600)})(),
 (()=>{const g=new THREE.IcosahedronGeometry(0.5,0);g.translate(0,0.5,0);return mk(g,0x66aaff,0x113366)})(),
 (()=>{const g=new THREE.ConeGeometry(0.6,2.4,6);g.translate(0,1.2,0);return mk(g,0x2f8a4a,0x0a3015)})(),
 (()=>{const g=new THREE.IcosahedronGeometry(0.9,1);g.translate(0,2.2,0);return mk(g,0x88ffff,0x2299aa)})(),
];
const slots=geos.map((im,k)=>{im.count=0;im.frustumCulled=false;scene.add(im);const arr=[];
 for(let i=0;i<CAP;i++){let a,r,x,z;do{a=RND()*6.283;r=2.5+k*0.9+RND()*(4+k*1.2);x=Math.cos(a)*r;z=Math.sin(a)*r}while(Math.hypot(x,z+10)<3);
  arr.push({x,z,ry:RND()*6.283,s:0.75+RND()*0.5,g:0})}return arr});
const M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),V=new THREE.Vector3(),SC=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
function updProducers(dt,t){const gens=G.S.gens;geos.forEach((im,k)=>{const want=Math.min(CAP,gens[k]>0?Math.ceil(Math.sqrt(gens[k])*3):0),n=Math.min(CAP,Math.max(want,gens[k]>0?1:0));
 const cnt=Math.min(n,gens[k]);let dirty=im.count!==cnt;im.count=cnt;
 for(let i=0;i<cnt;i++){const s=slots[k][i];if(s.g<1){s.g=Math.min(1,s.g+dt*2.5);dirty=true}
  if(dirty||k==7||k==4){const e=s.g<1?1-Math.pow(1-s.g,3)*(1+2*(1-s.g)):1;const bob=k==7?Math.sin(t+i)*0.15:0;
   Q.setFromAxisAngle(UP,s.ry+(k==4?t*0.3:0));M4.compose(V.set(s.x,bob,s.z),Q,SC.setScalar(s.s*Math.max(0.01,e)));im.setMatrixAt(i,M4);dirty=true}}
 for(let i=cnt;i<CAP;i++)slots[k][i].g=0;
 if(dirty)im.instanceMatrix.needsUpdate=true})}
// particles pool
const PN=160,ppos=new Float32Array(PN*3),pvel=new Float32Array(PN*3),plife=new Float32Array(PN);
const pgeo=new THREE.BufferGeometry();pgeo.setAttribute('position',new THREE.BufferAttribute(ppos,3));
const pts=new THREE.Points(pgeo,new THREE.PointsMaterial({color:0xd8a0ff,size:0.12,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));pts.frustumCulled=false;scene.add(pts);
let pi=0;function burst(p,n,col){for(let j=0;j<n;j++){const i=pi++%PN;ppos.set([p.x,p.y,p.z],i*3);pvel.set([(Math.random()-.5)*4,Math.random()*4+1,(Math.random()-.5)*4],i*3);plife[i]=1}
 if(col)pts.material.color.setHex(col)}
function updParticles(dt){for(let i=0;i<PN;i++){if(plife[i]<=0){ppos[i*3+1]=-99;continue}plife[i]-=dt*1.2;pvel[i*3+1]-=6*dt;for(let a=0;a<3;a++)ppos[i*3+a]+=pvel[i*3+a]*dt}pgeo.attributes.position.needsUpdate=true}
// truffle
const truffle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.35,0),new THREE.MeshBasicMaterial({color:0xffd84d}));truffle.visible=false;scene.add(truffle);
const tglow=new THREE.PointLight(0xffd84d,0,6,1.5);truffle.add(tglow);let truffleT=0;
function spawnTruffle(){const yaw=look.yaw+(Math.random()-.5)*1.6,r=3+Math.random()*4;truffle.position.set(-Math.sin(yaw)*r,0.6,-Math.cos(yaw)*r);truffle.visible=true;truffleT=12;tglow.intensity=4}
// look controls
const look={yaw:0,pitch:-0.22};let gyro=false,gyroBase=null;
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
let down=null;
canvas.addEventListener('pointerdown',e=>{down={id:e.pointerId,x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,m:0};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!down||down.id!==e.pointerId)return;const dx=e.clientX-down.lx,dy=e.clientY-down.ly;down.lx=e.clientX;down.ly=e.clientY;down.m+=Math.abs(dx)+Math.abs(dy);
 if(down.m>10){look.yaw+=dx*0.005;look.pitch=Math.max(-1,Math.min(0.8,look.pitch+dy*0.004))}});
canvas.addEventListener('pointerup',e=>{if(!down||down.id!==e.pointerId)return;const d=down;down=null;if(d.m>10)return;
 ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,cam);
 if(truffle.visible&&ray.intersectObject(truffle).length){truffle.visible=false;tglow.intensity=0;burst(truffle.position,40,0xffd84d);G.collectTruffle();return}
 const h=ray.intersectObject(hitbox);if(h.length){G.doTap(e.clientX,e.clientY);burst(h[0].point,10)}});
canvas.addEventListener('pointercancel',()=>down=null);
function onOri(e){if(e.alpha==null)return;if(!gyroBase)gyroBase={a:e.alpha,b:e.beta,yaw:look.yaw,p:look.pitch};
 let da=e.alpha-gyroBase.a;if(da>180)da-=360;if(da<-180)da+=360;look.yaw=gyroBase.yaw+da*Math.PI/180;look.pitch=Math.max(-1,Math.min(0.8,gyroBase.p+(e.beta-gyroBase.b)*Math.PI/180))}
$('#gyro').onclick=async()=>{if(!gyro){try{if(window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission&&await DeviceOrientationEvent.requestPermission()!=='granted')return}catch(e){return}
 gyro=true;gyroBase=null;addEventListener('deviceorientation',onOri)}else{gyro=false;removeEventListener('deviceorientation',onOri)}$('#gyro').textContent='Gyro look: '+(gyro?'ON':'OFF')};
let qMode=0;$('#quality').onclick=()=>{qMode=(qMode+1)%3;pr=[Math.min(devicePixelRatio||1,1.5),0.75,Math.min(devicePixelRatio||1,2)][qMode];renderer.setPixelRatio(pr);resize();$('#quality').textContent='Quality: '+['Auto','Low','High'][qMode]};
// sheet behaviour
const sheet=$('#sheet');$('#handle').onclick=()=>sheet.classList.toggle('mini');
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{sheet.classList.remove('mini');sheet.classList.toggle('tall',b.dataset.t=='tree');setTimeout(()=>window.dispatchEvent(new Event('resize')),300)}));
function resize(){renderer.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
const sv=new THREE.Vector3();
window.S3D={hit(c,auto){squash=c?1:0.6;if(auto)burst(sv.set(0,2.8,-10),3)},spawnTruffle,shroomScreen(){sv.set(0,2.2,-10).project(cam);return{x:(sv.x+1)/2*innerWidth,y:(1-sv.y)/2*innerHeight}}};
const clock=new THREE.Clock();let fr=0;
renderer.setAnimationLoop(()=>{const dt=Math.min(0.05,clock.getDelta()),t=clock.elapsedTime;
 cam.rotation.set(look.pitch,look.yaw,0,'YXZ');
 squash=Math.max(0,squash-dt*5);const s=Math.sin(squash*Math.PI);shroom.scale.set(1+s*0.12,1-s*0.15,1+s*0.12);
 const frz=Date.now()<G.S.frenzyEnd;capM.emissive.setHex(frz?0xc08020:0x802050);glow.intensity=(frz?50:28)+Math.sin(t*2)*4;
 if(truffle.visible){truffle.rotation.y+=dt*3;truffle.position.y=0.6+Math.sin(t*4)*0.15;truffleT-=dt;if(truffleT<=0){truffle.visible=false;tglow.intensity=0}}
 updProducers(dt,t);updParticles(dt);renderer.render(scene,cam);fr++});
window.__s3d={scene,cam,geos,truffle,get frames(){return fr}};
