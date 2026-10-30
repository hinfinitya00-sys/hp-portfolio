import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { DRACOLoader } from './vendor/DRACOLoader.js';
const stage=document.querySelector('#terrain-stage');
const canvas=document.querySelector('#terrain-canvas');
const motion=document.querySelector('#motion-toggle');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch{stage.dataset.render='fallback';}
if(renderer){
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(34,1,.1,80);const model=new THREE.Group();model.scale.z=-1;scene.add(model);
 scene.add(new THREE.HemisphereLight(0xe5edf2,0x6e7156,1.9));
 const sun=new THREE.DirectionalLight(0xfff4df,3.2);sun.position.set(-6,11,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9});sun.shadow.normalBias=.04;scene.add(sun);
 const rim=new THREE.DirectionalLight(0xffffff,2);rim.position.set(4,6,-7);scene.add(rim);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.14}));ground.rotation.x=-Math.PI/2;ground.position.y=-.02;ground.receiveShadow=true;scene.add(ground);
 const manager=new THREE.LoadingManager();let modelLoaded=false;const decoder=new DRACOLoader(manager);decoder.setDecoderPath(new URL('assets/vendor/draco/',document.baseURI).href);decoder.setDecoderConfig({type:'wasm'});decoder.setWorkerLimit(1);
 const loader=new GLTFLoader(manager);loader.setDRACOLoader(decoder);
 const textureLoader=new THREE.TextureLoader(manager),textures=[];
 function surface(file,color=false){const t=textureLoader.load(new URL('./textures/'+file,import.meta.url).href,()=>{if(ready)render()});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());if(color)t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t}
 const concreteColor=surface('rough-color.webp',true),concreteNormal=surface('rough-normal.webp'),groundColor=surface('grass-color.webp',true),groundNormal=surface('grass-normal.webp');
 let ready=false,visible=true,raf=0,phase=0,last=0,px=0,py=0,scroll=0,disposed=false;
 function render(){if(!disposed)renderer.render(scene,camera)}
 function frame(t){raf=0;if(disposed||!ready||!visible||document.hidden||reduced.matches||motion.getAttribute('aria-pressed')==='true')return;const dt=Math.min((t-last)/1000,.05);last=t;phase+=dt;const orbit=Math.sin(phase*.14)*.23+px*.16+scroll*.10;camera.position.set(Math.sin(.42+orbit)*22,10+py*.4,Math.cos(.42+orbit)*22);camera.lookAt(0,3.1,.8);render();raf=requestAnimationFrame(frame)}
 function update(){cancelAnimationFrame(raf);raf=0;if(disposed||!ready)return;if(visible&&!document.hidden&&!reduced.matches&&motion.getAttribute('aria-pressed')!=='true'){last=performance.now();raf=requestAnimationFrame(frame)}else render()}
 function resize(){if(disposed)return;const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();camera.position.set(9,10,20);if(w/h<.9)camera.position.multiplyScalar(1.18);camera.lookAt(0,3.1,.8);render()}
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update()},{rootMargin:'80px'});observer.observe(stage);
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);
 function onMove(e){if(e.pointerType==='touch'||reduced.matches)return;const b=stage.getBoundingClientRect();px=(e.clientX-b.left)/b.width-.5;py=(e.clientY-b.top)/b.height-.5}
 stage.addEventListener('pointermove',onMove);stage.addEventListener('pointerleave',()=>{px=0;py=0});
 function onScroll(){if(!visible)return;scroll=Math.min(window.scrollY/document.querySelector('#hero').offsetHeight,1)}
 window.addEventListener('scroll',onScroll,{passive:true});motion.addEventListener('click',update);reduced.addEventListener('change',update);document.addEventListener('visibilitychange',update);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;cancelAnimationFrame(raf);stage.dataset.render='fallback';motion.hidden=true});
 loader.load(new URL('./models/tsubasa-terrain.glb',import.meta.url).href,gltf=>{if(disposed)return;gltf.scene.traverse(obj=>{if(obj.isMesh){obj.castShadow=true;obj.receiveShadow=true;obj.material.roughness=.96;const p=obj.geometry.attributes.position,uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){uv[i*2]=p.getX(i)*.65;uv[i*2+1]=(p.getY(i)+p.getZ(i))*.65}obj.geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 const name=obj.material.name;if(name.includes('Concrete')){obj.material.vertexColors=false;obj.material.color.set(0xffffff);obj.material.map=concreteColor;obj.material.normalMap=concreteNormal;obj.material.normalScale.set(.22,.22)}
 else if(name.includes('VegetatedSlope')){obj.material.vertexColors=false;obj.material.color.set(0xffffff);obj.material.map=groundColor;obj.material.normalMap=groundNormal;obj.material.normalScale.set(.8,.8)}
 else if(name.includes('Foliage')){obj.material.side=THREE.DoubleSide;obj.material.roughness=1}
 else if(name.includes('GalvanizedSteel')){obj.material.metalness=.45;obj.material.roughness=.55}
}});model.add(gltf.scene);modelLoaded=true;resize()},undefined,()=>{stage.dataset.render='fallback';motion.hidden=true});
 manager.onLoad=()=>{if(disposed||!modelLoaded)return;ready=true;resize();stage.dataset.render='ready';motion.hidden=false;update()};
 resize();
 window.addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();resizeObserver.disconnect();window.removeEventListener('scroll',onScroll);document.removeEventListener('visibilitychange',update);reduced.removeEventListener('change',update);scene.traverse(obj=>{obj.geometry?.dispose();if(obj.material){const materials=Array.isArray(obj.material)?obj.material:[obj.material];materials.forEach(m=>m.dispose())}});textures.forEach(t=>t.dispose());decoder.dispose();renderer.dispose()},{once:true});
 window.addEventListener('pageshow',event=>{if(event.persisted&&disposed){stage.dataset.render='fallback';motion.hidden=true}});
}
