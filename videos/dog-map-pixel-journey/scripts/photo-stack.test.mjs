import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const helper=readFileSync(new URL('assets/photo-stack.js',root),'utf8');
for(let scene=1;scene<=5;scene++)test(`scene ${scene}: equal-size restrained stack, newest on top`,()=>{
  const html=readFileSync(new URL(`compositions/frames/ride-0${scene}.html`,root),'utf8');
  const prefix=`ride${scene}`,nodes={},calls=[];
  for(const [,id,style] of html.matchAll(/<div id="([^"]+)"[^>]*style="([^"]+)"/g)){
    nodes[id]={id,style:Object.fromEntries(style.split(';').map(p=>p.split(':')))};
  }
  assert.ok(html.includes(`id="${prefix}-stack" class="ride-photo-stack"`));
  const timeline={
    fromTo(target,from,to,at){calls.push({target:target.id||target,from,to,at});return this;},
    to(target,to,at){calls.push({target:target.id||target,to,at});return this;}
  };
  const context=vm.createContext({window:{__timelines:{}},document:{getElementById:id=>nodes[id]},gsap:{timeline:()=>timeline}});
  vm.runInContext(helper,context);
  vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
  const boxes=[];
  for(let i=0;i<3;i++){
    const id=`${prefix}-photo${i+1}`,style=nodes[id].style;
    const motions=calls.filter(c=>c.target===id||c.target===`#${id}`);
    assert.equal(motions.length,1,'Old photos must never get a replacement/exit tween');
    const motion=motions[0];
    assert.equal(motion.to.opacity,1);
    assert.equal(motion.at,[.5,2.65,4.8][i]);
    assert.equal(+style.zIndex,i+1,'Later photos must be painted on top');
    const width=parseFloat(style.width),height=parseFloat(style.height);
    assert.equal(width,512,'Every photo needs the full right-column width');
    assert.equal(height,400,'Panoramas must not collapse into thin strips');
    assert.ok(Math.abs(motion.to.rotation)<=2,'Keep the album aligned, not scattered');
    assert.equal(motion.from.rotation,motion.to.rotation,'No spin or swinging on entry');
    const angle=Math.abs(motion.to.rotation)*Math.PI/180;
    const halfW=(width*Math.cos(angle)+height*Math.sin(angle))/2;
    const halfH=(height*Math.cos(angle)+width*Math.sin(angle))/2;
    const cx=1346+parseFloat(style.left)+width/2,cy=260+parseFloat(style.top)+height/2;
    const box={left:cx-halfW,right:cx+halfW,top:cy-halfH,bottom:cy+halfH};
    assert.ok(box.left>1328&&box.right<1920,'Photo overlaps the website or canvas edge');
    assert.ok(box.top>260&&box.bottom<820,'Photo overlaps the icon or counter');
    boxes.push(box);
  }
  // Only narrow, ordered edges remain behind the foreground photo.
  for(let i=0;i<2;i++){
    const exposed=boxes[i].bottom-boxes[i+1].bottom;
    assert.ok(exposed>=12&&exposed<=28,'Back cards must show narrow, consistent edges');
  }
  assert.ok(Math.max(...boxes.map(b=>b.bottom))-Math.min(...boxes.map(b=>b.top))<455,'Stack spread is excessive');
  const groupExit=calls.filter(c=>c.target===`#${prefix}-stack`);
  assert.equal(groupExit.length,scene<5?1:0);
  if(scene<5){assert.equal(groupExit[0].at,6.7);assert.equal(groupExit[0].to.opacity,0);}
});

test('Display reframing preserves proportions without editing source pixels',()=>{
  const css=readFileSync(new URL('assets/ride.css',root),'utf8');
  assert.match(css,/\.ride-photo img\{[^}]*object-fit:cover/);
  assert.match(css,/object-position:var\(--photo-focus,50% 50%\)/);
});

test('Jinji Lake has no cycling claim and no cyclist, including reverse seeks',()=>{
  const scene=readFileSync(new URL('compositions/frames/ride-03.html',root),'utf8');
  assert.match(scene,/湖畔灯火，收进相册/);
  assert.doesNotMatch(scene,/骑行|骑车|步行/);
  let sprites=0,markers=0;
  const ctx={clearRect(){},fillRect(x,y,w,h){if(w===3&&h===3)markers++;},drawImage(){sprites++;}};
  const context=vm.createContext({window:{},document:{getElementById:id=>id==='ride-travel'?{getContext:()=>ctx}:{naturalWidth:96,naturalHeight:32}}});
  vm.runInContext(readFileSync(new URL('assets/ride.js',root),'utf8'),context);
  for(const time of [0,13.99,14,14.01,17.5,20.999,21,28,35,17.5,13,14]){
    sprites=0;markers=0;
    context.window.drawRideProgress(time);
    const jinji=time>=14&&time<21;
    assert.equal(sprites,jinji?0:1,`Wrong travel symbol at ${time}s`);
    assert.equal(markers,jinji?1:0,`Missing neutral progress marker at ${time}s`);
  }
});
