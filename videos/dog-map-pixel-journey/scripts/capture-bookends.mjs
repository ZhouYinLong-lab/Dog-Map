import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync,copyFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=resolve(root,'assets/bookends');
mkdirSync(out,{recursive:true});
const sourceIndex=process.argv.indexOf('--source');
const source=sourceIndex<0?resolve(out,'user-map.png'):resolve(process.argv[sourceIndex+1]);
if(source!==resolve(out,'user-map.png'))copyFileSync(source,resolve(out,'user-map.png'));
copyFileSync(resolve(root,'../../public/favicon-candidates-v4/01-bold-map-pin.png'),resolve(out,'brand.png'));
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
try {
  // Capture-only instrumentation: the application source on disk is untouched.
  await page.route('**/src/components/MapView.tsx*',async route=>{
    const response=await route.fetch();
    const body=(await response.text()).replace('mapRef.current = map;', 'window.__filmMap = map; mapRef.current = map;');
    await route.fulfill({response,body});
  });
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__filmMap?.isStyleLoaded(),{timeout:60000});
  await page.getByRole('button',{name:'打开地点：南京大学苏州校区',exact:true}).waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(5000);
  await page.addStyleTag({content:'.map-actions,.map-offscreen-guides,.github-link{visibility:hidden!important}'});
  // The live map uses its original 3D projection and original marker code.
  const poses=await page.evaluate(()=>{
    const map=window.__filmMap,school=[120.387037,31.351239];
    map.jumpTo({zoom:13.3,pitch:58,bearing:0});
    const p=map.project(school);map.panBy([p.x-1603,p.y-431],{duration:0});
    const start={center:map.getCenter().toArray(),zoom:map.getZoom(),pitch:map.getPitch(),bearing:0};
    map.jumpTo({center:school,zoom:13.65,pitch:58,bearing:0});
    const end={center:map.getCenter().toArray(),zoom:map.getZoom(),pitch:map.getPitch(),bearing:0};
    map.jumpTo(start);return {start,end};
  });
  await page.waitForTimeout(2000);
  await page.screenshot({path:resolve(out,'wide.png')});
  console.log(JSON.stringify(poses));
  if(process.argv.includes('--probe')) process.exitCode=0;
  else {
    const frames=resolve(root,'.hyperframes/bookend-map-frames');mkdirSync(frames,{recursive:true});
    for(let frame=0;frame<144;frame++){
      const t=frame/30,u=Math.max(0,Math.min(1,(t-.6)/3.2)),e=u*u*(3-2*u);
      await page.evaluate(({poses,e})=>{
        const mix=(a,b)=>a+(b-a)*e;
        window.__filmMap.jumpTo({center:poses.start.center.map((v,i)=>mix(v,poses.end.center[i])),zoom:mix(poses.start.zoom,poses.end.zoom),pitch:58,bearing:0});
      },{poses,e});
      await page.evaluate(()=>new Promise(resolve=>{window.__filmMap.once('idle',resolve);window.__filmMap.triggerRepaint();}));
      await page.screenshot({path:resolve(frames,`${String(frame).padStart(4,'0')}.png`)});
      if(frame%30===0)console.log(`Captured ${frame}/144`);
    }
    copyFileSync(resolve(frames,'0143.png'),resolve(out,'campus.png'));
    const encoded=spawnSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-framerate','30','-i',resolve(frames,'%04d.png'),'-c:v','libx264','-crf','16','-preset','fast','-pix_fmt','yuv420p',resolve(out,'map-push.mp4')],{encoding:'utf8'});
    if(encoded.status!==0)throw new Error(encoded.stderr);
    writeFileSync(resolve(root,'capture/bookends.json'),JSON.stringify({source:'User supplied map screenshot, copied unchanged',sourceSha256:createHash('sha256').update(readFileSync(source)).digest('hex'),capture:'Local production-source website; capture-only map handle, hidden action buttons; original geography/3D/markers preserved',poses,frames:144,fps:30,duration:4.8},null,2));
  }
} finally {await browser.close();}
