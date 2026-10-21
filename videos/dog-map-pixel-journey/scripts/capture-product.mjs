import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=resolve(root,'assets/web');mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
const records=[];
try{
  await page.goto('https://map.zylatent.com/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'打开地点：南京大学苏州校区',exact:true}).waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(8000);
  async function snap(name){
    await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight;}).map(i=>i.decode().catch(()=>{})));});
    await page.waitForTimeout(1800);
    await page.screenshot({path:resolve(out,`${name}.png`)});
    records.push({name,url:page.url(),title:await page.title(),viewport:'1920x1080',capturedAt:new Date().toISOString(),method:'Real production website, browser UI interaction only; no DOM restyling'});
  }
  await snap('home');
  await page.getByRole('button',{name:'打开地点：东渚夜市与街道',exact:true}).click();
  await page.locator('.detail-drawer').waitFor();
  await snap('market-detail');
  await page.getByRole('button',{name:'关闭详情',exact:true}).click();
  await page.getByRole('button',{name:'查看全部地点',exact:true}).click();
  await page.waitForTimeout(3000);
  await snap('all-places');
  await page.getByRole('button',{name:'打开地点：金鸡湖',exact:true}).click();
  await page.locator('.detail-drawer').waitFor();
  await snap('lake-detail');
  const preview=page.locator('.detail-drawer .media-preview-trigger').nth(8);
  await preview.click();
  await page.getByRole('dialog').waitFor();
  await snap('lake-photo');
  await page.getByRole('button',{name:'关闭图片预览',exact:true}).click();
  for(const [name,title] of [['huangshan-detail','黄山'],['west-lake-detail','西湖']]){
    await page.getByRole('button',{name:'关闭详情',exact:true}).click();
    await page.getByRole('button',{name:'查看全部地点',exact:true}).click();
    await page.waitForTimeout(2400);
    await page.getByRole('button',{name:'返回南苏主视角',exact:true}).click();
    await page.waitForTimeout(1200);
    const show=page.getByRole('button',{name:'显示地点箭头',exact:true});
    if(await show.isVisible())await show.click();
    await page.getByRole('button',{name:`跳转到地点：${title}`,exact:true}).click();
    await page.locator('.detail-drawer').waitFor();
    await page.waitForTimeout(1800);
    await page.getByRole('button',{name:'关闭详情',exact:true}).click();
    await page.getByRole('button',{name:'隐藏地点箭头',exact:true}).click();
    await page.getByRole('button',{name:`打开地点：${title}`,exact:true}).click();
    await page.locator('.detail-drawer').waitFor();
    await snap(name);
  }
  writeFileSync(resolve(root,'capture/website-interactions.json'),JSON.stringify(records,null,2));
  console.log(JSON.stringify(records,null,2));
}finally{await browser.close();}
