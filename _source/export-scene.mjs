import fs from 'node:fs';
import * as THREE from '../assets/vendor/three.module.min.js';
import {buildScene} from './terrain-procedural-source.js';
const scene=buildScene(THREE);
scene.updateMatrixWorld(true);
const buckets=new Map();
scene.traverse(object=>{
 if(!object.isMesh||object.material.isShadowMaterial)return;
 const m=object.material;let bucket=buckets.get(m.uuid);
 if(!bucket){bucket={name:m.name||'Detail',roughness:m.roughness,color:[m.color.r,m.color.g,m.color.b],positions:[],colors:[]};buckets.set(m.uuid,bucket)}
 const g=object.geometry.index?object.geometry.toNonIndexed():object.geometry;const pos=g.attributes.position,col=g.attributes.color;
 for(let inst=0;inst<(object.isInstancedMesh?object.count:1);inst++){
 const matrix=object.matrixWorld.clone();if(object.isInstancedMesh){const local=new THREE.Matrix4();object.getMatrixAt(inst,local);matrix.multiply(local)}
 for(let i=0;i<pos.count;i++){const v=new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(matrix);bucket.positions.push(v.x,v.z,v.y);if(col)bucket.colors.push(col.getX(i),col.getY(i),col.getZ(i));else bucket.colors.push(...bucket.color)}
 }
});
fs.writeFileSync(new URL('./terrain-source.json',import.meta.url),JSON.stringify([...buckets.values()]));
console.log('Exported',buckets.size,'material groups');
