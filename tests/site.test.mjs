import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const pages=['index.html','recruit.html','works.html','houmen-kouji.html','doboku-kouji.html','saigai-fukkyu.html',...['iizuka','kama','miyawaka','nogata','tagawa'].map(n=>`area/${n}.html`),'column/houmen-kouji-kihon.html'];
test('all internal assets, page links and fragments resolve',()=>{
 for(const page of pages){const html=read(page);for(const m of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)){
 const url=new URL(m[1].replaceAll('&amp;','&'),`https://local.test/${page}`);if(url.origin!=='https://local.test')continue;
 let name=decodeURIComponent(url.pathname).slice(1)||'index.html';if(name.endsWith('/'))name+='index.html';assert.ok(fs.existsSync(path.join(root,name)),`${page}: ${m[1]}`);
 if(url.hash&&name.endsWith('.html'))assert.ok(read(name).includes(`id="${url.hash.slice(1)}"`),`${page}: missing ${url.hash}`);
 }}
});
test('confirmed identity and only worker recruitment appear',()=>{
 const home=read('index.html');for(const text of ['秋中久佳','福岡県飯塚市南尾338-3','0948-80-6993','福岡県を中心に'])assert.ok(home.includes(text));
 for(const name of ['index.html','recruit.html','tsubasa-kogyo/index.html'])assert.doesNotMatch(read(name),/完全週休|重機オペ|現場監督|営業・管理|月給\s*\d|年間休日/);
 for(const name of ['index.html','recruit.html'])assert.match(read(name),/法面工事の作業員/);
});
test('compressed 3D asset and local decoder have a bounded payload',()=>{
 const b=fs.readFileSync(path.join(root,'assets/models/tsubasa-terrain.glb'));assert.equal(b.toString('ascii',0,4),'glTF');assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);assert.ok(b.length<1600000);
 const json=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)));assert.ok(json.extensionsRequired.includes('KHR_draco_mesh_compression'));
 for(const f of ['assets/vendor/draco/draco_decoder.wasm','assets/vendor/draco/draco_wasm_wrapper.js','images/terrain-poster.webp'])assert.ok(fs.statSync(path.join(root,f)).size>1000);
 for(const name of ['GLTFLoader.js','DRACOLoader.js','BufferGeometryUtils.js'])assert.doesNotMatch(read(`assets/vendor/${name}`),/from ['"]three['"]/);
});
test('metadata and fallback are present without JavaScript',()=>{
 const html=read('index.html');assert.match(html,/<html lang="ja">/);assert.match(html,/rel="canonical" href="https:\/\/tsubasa-kogyo-fukuoka.com\//);assert.match(html,/terrain-poster.webp/);assert.match(html,/tel:0948806993/);assert.match(read('assets/terrain.js'),/prefers-reduced-motion/);
});

test('published HTML is valid UTF-8 and contains no duplicated ids or garbled characters',()=>{
 for(const name of pages){const bytes=fs.readFileSync(path.join(root,name));const html=new TextDecoder('utf-8',{fatal:true}).decode(bytes);assert.doesNotMatch(html,/\ufffd|内容を確認の上、内容を確認/);const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,name);}
});
