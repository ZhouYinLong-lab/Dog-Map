import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const helper=readFileSync(new URL('assets/photo-stack.js',root),'utf8');
for(let scene=1;scene<=5;scene++)test(`scene ${scene}: accumulate photos, preserve aspect, exit together`,()=>{
  const html=readFileSync(new URL(`compositions/frames/ride-0${scene}.html`,root),'utf8');
  const prefix=`ride${scene}`,nodes={},calls=[];
  for(const [,id,style] of html.matchAll(/<div id="([^"]+)"[^>]*style="([^"]+)"/g)){
    nodes[id]={id,style:Object.fromEntries(style.split(';').map(p=>p.split(':')))};
  }
  const aspects=[1,2,3].map(n=>parseFloat(nodes[`${prefix}-photo${n}`].style.width)/parseFloat(nodes[`${prefix}-photo${n}`].style.height));
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
    assert.ok(Math.abs(width/height-aspects[i])<1e-9,'Source aspect ratio changed');
    const angle=Math.abs(motion.to.rotation)*Math.PI/180;
    const halfW=(width*Math.cos(angle)+height*Math.sin(angle))/2;
    const halfH=(height*Math.cos(angle)+width*Math.sin(angle))/2;
    const cx=1346+parseFloat(style.left)+width/2,cy=260+parseFloat(style.top)+height/2;
    const box={left:cx-halfW,right:cx+halfW,top:cy-halfH,bottom:cy+halfH};
    assert.ok(box.left>1328&&box.right<1920,'Photo overlaps the website or canvas edge');
    assert.ok(box.top>248&&box.bottom<890,'Photo overlaps the icon or counter');
    boxes.push(box);
  }
  // A strip of every older photo remains exposed below the newer photographs.
  for(let i=0;i<2;i++)assert.ok(boxes[i].bottom>Math.max(...boxes.slice(i+1).map(b=>b.bottom))+20);
  const groupExit=calls.filter(c=>c.target===`#${prefix}-stack`);
  assert.equal(groupExit.length,scene<5?1:0);
  if(scene<5){assert.equal(groupExit[0].at,6.7);assert.equal(groupExit[0].to.opacity,0);}
});
