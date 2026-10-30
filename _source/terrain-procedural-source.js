// Original completed-slope illustration. Dimensions are artistic, not construction drawings.
export function buildScene(THREE){
 const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group);
 let seed=479;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 const material=(name,color)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.94,vertexColors:true});m.name=name;return m};
 const soil=material('VegetatedSlope',0x798253),concrete=material('Concrete',0xc1c0b6),asphalt=material('Asphalt',0x4c5050),steel=material('GalvanizedSteel',0xb1b7b5),dark=material('DrainInterior',0x40443c),white=material('RoadMarking',0xe3dfc9),foliage=material('Foliage',0x405b32);
 const noise=(x,z)=>Math.sin(x*2.7+z*1.3)*.017+Math.cos(x*8-z*5)*.009+Math.sin(x*22+z*19)*.004;
 const height=(x,z)=>{let y=z< -2.6?7.2+(-z-2.6)*.25:z<0?7.2-(z+2.6)*1.08:z<.55?4.392:Math.max(.20,4.392-(z-.55)*1.18);const edge=Math.max(0,Math.abs(x)-6);y+=edge*.30*Math.max(0,4-z)/5;return y+noise(x,z)*(z<4?2:0)+.10*Math.sin(x*.5)*Math.max(0,4-z)/5};
 function add(g,m,name){const mesh=new THREE.Mesh(g,m);mesh.name=name||m.name;const a=g.attributes.position,c=[];for(let i=0;i<a.count;i++){const v=.89+random()*.17;c.push(v*m.color.r,v*m.color.g,v*m.color.b)}g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));group.add(mesh);return mesh}
 function box(x,y,z,w,h,d,m){const mesh=add(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);return mesh}
 function beam(a,b,w,m){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),v=vb.clone().sub(va);const mesh=add(new THREE.BoxGeometry(w,v.length(),w),m);mesh.position.copy(va.add(vb).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return mesh}
 const pos=[],col=[],idx=[],nx=160,nz=112;
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=-10+i/nx*20,z=-5+j/nz*9.1;pos.push(x,height(x,z),z);const patch=.72+.15*Math.sin(x*4.2+z*3)+.10*Math.cos(x*14-z*11)+random()*.15;const color=new THREE.Color(0x71804c).lerp(new THREE.Color(0x8d8065),Math.max(0,Math.sin(x*2+z*5)*.5));color.multiplyScalar(patch);col.push(color.r,color.g,color.b);if(i<nx&&j<nz){const a=j*(nx+1)+i;idx.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();group.add(new THREE.Mesh(g,soil));
 // Finished sprayed concrete frames with substantial, continuous rectangular sections.
 for(const [lo,hi,half] of [[-2.45,-.10,4.8],[.70,3.82,6]]){
  for(let x=-half;x<=half+.01;x+=1.2)for(let z=lo;z<hi-.01;z+=.10){const zz=Math.min(z+.10,hi);beam([x,height(x,z)+.06,z],[x,height(x,zz)+.06,zz],.18,concrete)}
  for(let z=lo;z<=hi+.01;z+=(hi-lo)/4)for(let x=-half;x<half-.01;x+=.20)beam([x,height(x,z)+.07,z],[x+.20,height(x+.20,z)+.07,z],.18,concrete);
 }
 // Interceptor channel at the crest, toe channel and grates beside the completed carriageway.
 for(const z of [-2.60,.27,4.08]){const y=height(0,z);box(0,y+.02,z,13,.06,.24,dark);box(0,y+.055,z-.15,13,.12,.07,concrete);box(0,y+.055,z+.15,13,.12,.07,concrete)}
 for(let x=-5.3;x<5.4;x+=.48){box(x,.29,4.08,.42,.025,.21,steel);for(let k=0;k<5;k++)box(x-.16+k*.08,.306,4.08,.025,.009,.17,dark)}
 box(0,.12,5.25,20,.15,2.05,asphalt);
 box(0,.202,4.45,20,.008,.045,white);box(0,.202,6.03,20,.008,.045,white);
 for(let x=-5.4;x<5.3;x+=1.4)box(x,.203,5.25,.65,.008,.045,white);
 // Low verge and galvanised safety rail on the outer road edge.
 box(0,.10,6.30,20,.18,.22,concrete);
 for(let x=-5.3;x<=5.3;x+=.9)box(x,.41,6.30,.045,.6,.045,steel);
 box(0,.64,6.30,20,.13,.045,steel);box(0,.60,6.27,20,.035,.035,steel);
 // Individual leaf sprays make an irregular tree line, avoiding solid spherical crowns.
 const leafGeo=new THREE.PlaneGeometry(.075,.16);const trunk=material('Bark',0x555241);
 for(let tree=0;tree<48;tree++){
 const x=(random()-.5)*18,z=-4.8+random()*1.8,base=height(x,z),h=.7+random()*1.1;
 beam([x,base,z],[x,base+h,z],.025,trunk);
 for(let i=0;i<100;i++){const angle=random()*Math.PI*2,r=Math.sqrt(random())*.50;const leaf=add(leafGeo.clone(),foliage);leaf.position.set(x+Math.cos(angle)*r,base+h-.5+random()*.75,z+Math.sin(angle)*r);leaf.rotation.set(random()*3,random()*6,random()*3);leaf.scale.setScalar(.65+random()*1.3)}
 }
 // Fine tufts within cells, kept below concrete beams.
 for(let i=0;i<2800;i++){const x=(random()-.5)*17,z=-4.8+random()*8.8;if(Math.abs(x-Math.round(x))<.12||Math.abs((z+.2)/.68-Math.round((z+.2)/.68))<.15)continue;const tuft=add(new THREE.PlaneGeometry(.025+random()*.04,.04+random()*.07),foliage);tuft.position.set(x,height(x,z)+.028,z);tuft.rotation.set(-.4,random()*6,0)}
 group.rotation.y=-.18;
 return scene;
}
