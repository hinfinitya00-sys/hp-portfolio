'use strict';
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-menu');
toggle.hidden = false;
function closeMenu(){menu.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='メニュー ＋';}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';menu.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'閉じる −':'メニュー ＋';});
menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('#nav'))closeMenu();});
const motion = document.querySelector('#motion-toggle');

motion.addEventListener('click',()=>{const paused=motion.getAttribute('aria-pressed')!=='true';document.body.classList.toggle('motion-paused',paused);motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'動きを再生する ▷':'動きを止める Ⅱ';});
const form=document.querySelector('#contactForm');
form.addEventListener('submit',async e=>{
 e.preventDefault();
 if(!form.reportValidity())return;
 const button=form.querySelector('button[type="submit"]');
 const status=document.querySelector('#formStatus');
 button.disabled=true;button.textContent='送信中…';status.textContent='';
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'},signal:controller.signal});
  if(!response.ok)throw new Error('Submission rejected');
  const result=await response.json();
  if(result.ok!==true)throw new Error('Submission not confirmed');
  form.hidden=true;const thanks=document.querySelector('#formThanks');thanks.style.display='block';thanks.focus();
 }catch(error){status.textContent='送信を確認できませんでした。入力内容は残っています。再度お試しいただくか、0948-80-6993へお電話ください。';}
 finally{clearTimeout(timeout);button.disabled=false;button.textContent='お問い合わせを送信する ↗';}
});
