import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const code=fs.readFileSync(new URL('../assets/home.js',import.meta.url),'utf8');
function setup(fetchImpl){
 const elements=new Map();
 function el(selector){if(elements.has(selector))return elements.get(selector);const classes=new Set();const element={hidden:false,disabled:false,textContent:'',style:{},attrs:{'aria-expanded':'false','aria-pressed':'false'},listeners:{},classList:{toggle(c,on){if(on)classes.add(c);else classes.delete(c)},remove(c){classes.delete(c)},contains(c){return classes.has(c)}},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},addEventListener(k,v){this.listeners[k]=v},querySelector:el,reportValidity:()=>true,focus(){this.focused=true}};elements.set(selector,element);return element;}
 const document={querySelector:el,body:el('body'),listeners:{},addEventListener(k,v){this.listeners[k]=v}};
 const form=el('#contactForm');form.action='https://formspree.io/f/mjgalqlv';
 vm.runInNewContext(code,{document,fetch:fetchImpl,FormData:class{},AbortController,setTimeout,clearTimeout,Error});return {el,document,submit:()=>form.listeners.submit({preventDefault(){}})};
}
test('only confirmed successful response shows thanks',async()=>{const t=setup(async()=>({ok:true,json:async()=>({ok:true})}));await t.submit();assert.equal(t.el('#contactForm').hidden,true);assert.equal(t.el('#formThanks').style.display,'block');assert.equal(t.el('#formThanks').focused,true);});
for(const [name,fetcher] of [['HTTP rejection',async()=>({ok:false})],['network failure',async()=>{throw Error('offline')}],['unconfirmed response',async()=>({ok:true,json:async()=>({})})],['malformed response',async()=>({ok:true,json:async()=>{throw Error('invalid JSON')}})]])test(name+' retains form and allows retry',async()=>{const t=setup(fetcher);await t.submit();assert.equal(t.el('#contactForm').hidden,false);assert.match(t.el('#formStatus').textContent,/0948-80-6993/);assert.equal(t.el('button[type="submit"]').disabled,false);assert.notEqual(t.el('#formThanks').style.display,'block');});
test('invalid form sends no request',async()=>{let calls=0;const t=setup(async()=>{calls++});t.el('#contactForm').reportValidity=()=>false;await t.submit();assert.equal(calls,0)});
test('pending submission disables button',async()=>{let resolve;const t=setup(()=>new Promise(r=>resolve=r));const request=t.submit();assert.equal(t.el('button[type="submit"]').disabled,true);resolve({ok:false});await request;assert.equal(t.el('button[type="submit"]').disabled,false)});
test('mobile menu opens and Escape restores focus',()=>{const t=setup();t.el('.menu-toggle').listeners.click();assert.equal(t.el('.menu-toggle').attrs['aria-expanded'],'true');assert.equal(t.el('#main-menu').classList.contains('is-open'),true);t.document.listeners.keydown({key:'Escape'});assert.equal(t.el('.menu-toggle').attrs['aria-expanded'],'false');assert.equal(t.el('.menu-toggle').focused,true)});
test('motion can be paused and restarted',()=>{const t=setup();t.el('#motion-toggle').listeners.click();assert.equal(t.el('body').classList.contains('motion-paused'),true);t.el('#motion-toggle').listeners.click();assert.equal(t.el('body').classList.contains('motion-paused'),false)});
