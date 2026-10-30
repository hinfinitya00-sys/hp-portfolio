import {test,expect} from '@playwright/test';
async function watchDraws(page){await page.addInitScript(()=>{window.__testDraws=0;for(const C of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){if(!C)continue;for(const key of ['drawElements','drawArrays']){const original=C.prototype[key];C.prototype[key]=function(...args){window.__testDraws++;return original.apply(this,args)}}}})}
async function expectStill(page){await page.waitForTimeout(100);const count=await page.evaluate(()=>window.__testDraws);expect(count).toBeGreaterThan(0);await page.waitForTimeout(300);expect(await page.evaluate(()=>window.__testDraws)).toBe(count)}
test('homepage: text, 3D, recruitment and no horizontal overflow',async({page},info)=>{
 await watchDraws(page);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.locator('#terrain-stage')).toHaveAttribute('data-render','ready');
 await expect(page.getByRole('heading',{level:1})).toHaveText('仲間と、もっと先へ。');
 await expect(page.locator('.info-table')).toContainText('秋中久佳（あきなか ひさよし）');
 expect(await page.locator('body').innerText()).not.toMatch(/\ufffd|完全週休|重機オペ|現場監督/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('home.png'),fullPage:true});
 await page.locator('#motion-toggle').click();await expect(page.locator('#motion-toggle')).toHaveAttribute('aria-pressed','true');
 await expectStill(page);
 if(await page.locator('.menu-toggle').isVisible()){await page.locator('.menu-toggle').click();await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded','true');await page.locator('.menu-toggle').press('Escape');await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded','false');await page.locator('.menu-toggle').click();}
 await page.getByRole('link',{name:'仲間を募集中'}).click();await expect(page).toHaveURL(/#join$/);await expect(page.locator('#join')).toContainText('法面工事の作業員');
 await page.getByRole('link',{name:'仕事の話を聞いてみる'}).click();await expect(page).toHaveURL(/#contact$/);await page.locator('.form-submit').click();await expect(page.locator('#fname')).toBeFocused();
 expect(errors).toEqual([]);
});
test('recruitment landing and service pages preserve valid text/layout',async({page},info)=>{
 for(const route of ['/recruit.html','/houmen-kouji.html','/doboku-kouji.html','/saigai-fukkyu.html']){const response=await page.goto(route);expect(response.status()).toBe(200);await expect(page.locator('h1')).toBeVisible();expect(await page.locator('body').innerText()).not.toMatch(/\ufffd/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);if(route==='/recruit.html')await page.screenshot({path:info.outputPath('recruit.png'),fullPage:true});}
});
test('form failure preserves input; confirmed success shows thanks',async({page})=>{
 await page.route('https://formspree.io/**',route=>route.fulfill({status:503,contentType:'application/json',body:'{}'}));await page.goto('/#contact');await page.getByLabel('お名前 必須').fill('表示テスト');await page.getByLabel('電話番号 必須').fill('0000000000');await page.getByLabel('お問い合わせ内容 必須').fill('ローカルで通信を置き換えるテスト');await page.locator('.form-submit').click();await expect(page.locator('#formStatus')).toContainText('送信を確認できませんでした');await expect(page.locator('#fname')).toHaveValue('表示テスト');
 await page.route('https://formspree.io/**',route=>route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}));await page.locator('.form-submit').click();await expect(page.locator('#formThanks')).toBeVisible();await expect(page.locator('#formThanks')).toContainText('内容を確認のうえ、ご連絡いたします。');await expect(page.locator('#contactForm')).toBeHidden();
});
test('3D load failure keeps the poster and contact available',async({page})=>{
 await page.route('**/tsubasa-terrain.glb',r=>r.abort());await page.goto('/');await expect(page.locator('#terrain-stage')).toHaveAttribute('data-render','fallback');await expect(page.locator('.terrain-fallback img')).toBeVisible();await expect(page.locator('#motion-toggle')).toBeHidden();await expect(page.locator('#phoneFab')).toHaveAttribute('href','tel:0948806993');
});
test('reduced motion keeps a stable 3D view',async({page})=>{
 await watchDraws(page);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page.locator('#terrain-stage')).toHaveAttribute('data-render','ready');await expect(page.locator('#motion-toggle')).toBeHidden();await expectStill(page);
});
test('small screens and tablets have no clipped horizontal layout',async({page})=>{
 for(const width of [320,375,768,1024,1920]){await page.setViewportSize({width,height:900});await page.goto('/');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.getByRole('heading',{level:1})).toBeVisible();}
});

test('without JavaScript the text, poster and contact links remain available',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:process.env.SITE_URL||'http://127.0.0.1:4199'});const page=await context.newPage();await page.goto('/');await expect(page.locator('.terrain-fallback img')).toBeVisible();await expect(page.getByRole('heading',{level:1})).toBeVisible();await expect(page.locator('a[href="tel:0948806993"]').first()).toBeVisible();await context.close();
});
