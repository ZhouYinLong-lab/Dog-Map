/* Original deterministic pixel scenery. Logical 480×270, hard edges.
 * Direction: OhMyStyle rpg-maker-x-turner. No photo filters or blur. */
(() => {
  const P={night:'#11182B',ink:'#202A48',blue:'#536A9C',lavender:'#8B80A8',teal:'#527C78',forest:'#304B3F',amber:'#E4A24C',ochre:'#A86E3C',rose:'#B65F68',cream:'#E7D8B8',silver:'#B9C7D8',route:'#D95846'};
  const r=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const hash=(i,s=0)=>{let n=Math.imul((i+s*131)|0,374761393);n=n^(n>>>13);return ((Math.imul(n,1274126177)^(n>>>16))>>>0)/4294967295;};
  function line(c,x0,y0,x1,y1,col,w=1){
    x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
    const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let e=dx+dy;
    for(let i=0;i<1500;i++){r(c,x0,y0,w,w,col);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}
  }
  function poly(c,pts,col){
    const low=Math.max(0,Math.floor(Math.min(...pts.map(p=>p[1])))),high=Math.min(270,Math.ceil(Math.max(...pts.map(p=>p[1]))));
    for(let y=low;y<=high;y++){const xs=[];for(let j=0;j<pts.length;j++){const a=pts[j],b=pts[(j+1)%pts.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);for(let j=0;j+1<xs.length;j+=2)r(c,Math.ceil(xs[j]),y,Math.floor(xs[j+1])-Math.ceil(xs[j])+1,1,col);}
  }
  function disk(c,x,y,rad,col){for(let yy=-rad;yy<=rad;yy++){const xx=Math.floor(Math.sqrt(rad*rad-yy*yy));r(c,x-xx,y+yy,xx*2+1,1,col);}}
  function cloud(c,x,y,w,col,seed=0){
    for(let i=0;i<16;i++){const hh=3+hash(i,seed)*8;r(c,x+i*w/17,y-hh,w/7,hh,col);}
    r(c,x-8,y,w+18,2,col);
    for(let i=0;i<28;i++){const xx=x+hash(i,seed+7)*w,yy=y-1-hash(i,seed+11)*7;r(c,xx,yy,3+hash(i,3)*10,1,i%3?'#ADB1BD':'#C5BAB7');}
  }
  function sky(c,t,variant='dawn'){
    const a=variant==='night'?['#202A48','#354363','#536079','#8B80A8','#B8999E']:['#536A9C','#7187AA','#939DB6','#B5B0BF','#D4BDB2','#E7C9A4'];
    for(let j=0;j<a.length;j++)r(c,0,j*25,480,26,a[j]);
    for(let j=1;j<a.length;j++)for(let x=0;x<480;x++)for(let yy=-5;yy<5;yy++)if(hash(x+yy*480,j)<(yy+5)/10)r(c,x,j*25+yy,1,1,a[j]);
    disk(c,variant==='night'?405:368,variant==='night'?43:103,variant==='night'?8:18,P.cream);
    for(let i=0;i<10;i++)cloud(c,(hash(i,15)*560+Math.floor(t*.45*(i%2+1)))%550-40,13+hash(i,7)*103,35+hash(i,9)*75,i<4?a[1]:a[3],i+8);
    for(let i=0;i<8;i++)r(c,285+i*19,112+(i%3)*4,20,1,'#EAD8B7');
  }
  function tree(c,x,y,size,tone=0){
    const a=tone===2?['#788D8E','#8B9B94','#B3B59D']:tone===1?['#304B3F','#527C78','#729280']:['#182E35','#304B3F','#527C78'];
    r(c,x-1,y-size*.55,3,size*.55,'#4C4944');
    for(let i=0;i<20;i++){
      const xx=x+(hash(i,x)*2-1)*size*.38,yy=y-size*.42-hash(i,y)*size*.5,rad=Math.max(3,Math.floor(size*(.11+hash(i,4)*.08)));
      disk(c,xx,yy,rad,a[i%3]);
      for(let j=0;j<Math.floor(rad*3);j++){const tx=(hash(j,i+31)*2-1)*rad,ty=(hash(j,i+81)*2-1)*rad;if(tx*tx+ty*ty<rad*rad)r(c,xx+tx,yy+ty,1+hash(j,6)*2,1,j%3===0?a[2]:a[(i+1)%3]);}
    }
  }
  function cyclist(c,x,y,t,scale=1){
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
    for(const wx of [-7,7]){disk(c,wx,0,4,P.night);disk(c,wx,0,3,P.silver);disk(c,wx,0,2,P.ink);line(c,wx,-2,wx,2,P.cream);}
    line(c,-7,0,-2,-7,P.route);line(c,-2,-7,1,0,P.route);line(c,1,0,-7,0,P.route);line(c,1,0,6,-8,P.route);line(c,6,-8,7,0,P.route);
    r(c,4,-10,4,1,P.ink);r(c,-4,-9,5,1,P.ink);
    const f=Math.floor(t*6)%2;line(c,0,-10,f?-1:3,-4,P.night,2);line(c,f?-1:3,-4,2,0,P.night);
    r(c,-3,-16,5,7,P.rose);line(c,1,-15,5,-10,P.cream,2);r(c,-2,-21,5,5,P.cream);r(c,-3,-22,6,2,P.ink);r(c,-6,-16,3,6,P.ochre);c.restore();
  }
  function water(c,y,h,t,a=[P.blue,P.lavender,P.teal],sunX=355){
    r(c,0,y,480,h,a[0]);
    for(let i=0;i<550;i++){const yy=y+hash(i,20)*h,xx=hash(i,22)*480,light=Math.abs(xx-sunX)<15+(yy-y)*.8,col=light&&i%4===0?P.cream:a[1+i%2];r(c,xx+Math.floor(Math.sin(t*1.2+i)*2),yy,2+hash(i,9)*(3+(yy-y)*.15),1,col);}
  }
  function campus(c,t){
    sky(c,t);poly(c,[[0,137],[46,124],[80,132],[127,114],[183,131],[230,120],[300,140],[480,126],[480,184],[0,184]],'#8D9F9D');
    for(let i=0;i<35;i++)tree(c,i*17-5,160,22+hash(i,3)*18,2);r(c,0,164,480,106,'#708C77');
    poly(c,[[192,105],[325,119],[325,174],[192,164]],'#D9CCAE');poly(c,[[325,119],[359,104],[359,156],[325,174]],'#84969A');
    poly(c,[[186,100],[320,114],[360,99],[228,87]],'#EEE0BC');line(c,186,103,324,118,P.cream,3);
    for(let i=0;i<16;i++){const x=198+i*8,y=111+i*.85;r(c,x,y,4,35,'#53677B');r(c,x+4,y,2,39,'#EEE0BC');r(c,x,y+13,4,2,'#879BA0');}
    line(c,192,154,325,167,'#A59F8F',2);
    poly(c,[[330,52],[351,47],[351,154],[330,163]],'#F0DAB0');poly(c,[[351,47],[365,54],[365,148],[351,154]],'#9BA7A4');
    r(c,334,59,12,18,P.ink);r(c,336,62,8,15,'#435574');r(c,333,83,3,68,'#D1B98F');r(c,339,83,3,67,'#BBAF98');r(c,345,83,3,65,'#E8D7B6');
    for(let j=0;j<19;j++)line(c,353,60+j*4,362,64+j*4,'#647D8C');
    poly(c,[[384,123],[414,111],[438,124],[450,125],[435,132],[393,131],[378,128]],P.ink);
    poly(c,[[389,134],[433,134],[433,162],[389,162]],'#D6CBAB');for(let i=0;i<6;i++)r(c,394+i*6,139,3,21,'#556D73');
    poly(c,[[223,162],[361,176],[392,162],[253,150]],P.cream);poly(c,[[223,162],[361,176],[361,181],[223,167]],'#53677B');
    for(const x of [231,267,309,351]){r(c,x,171+(x-231)*.09,5,28,'#E8D9B6');r(c,x+5,172+(x-231)*.09,3,27,'#7B8F91');}
    water(c,199,45,t,['#627D8A','#91A4A3','#ADC2B5'],335);
    poly(c,[[211,197],[375,211],[423,198],[262,186]],'#B8BCAD');line(c,214,199,375,214,P.cream,2);
    poly(c,[[0,222],[80,214],[164,231],[247,215],[318,221],[217,248],[137,254],[65,236],[0,242]],'#D6C7A7');
    line(c,0,233,72,225,'#A99E8B');line(c,72,225,143,243,'#A99E8B');line(c,143,243,245,225,'#A99E8B');
    for(let i=0;i<120;i++)r(c,hash(i,37)*480,246+hash(i,38)*24,2,1,i%2?'#8A9A75':'#526F60');
    tree(c,45,217,78);tree(c,11,233,83);tree(c,452,222,70);tree(c,481,241,91);
    for(let i=0;i<20;i++)line(c,30+i*2,154+hash(i)*12,27+i*2,187+hash(i,4)*15,i%2?'#527C78':'#749282');
    const x=55+Math.min(t/7,1)*195,y=x<141?225+(x-55)*.2:242-(x-141)*.17;cyclist(c,x,y,t);
  }
  function market(c,t){
    sky(c,t,'night');r(c,0,145,480,125,'#4C5367');poly(c,[[270,139],[480,227],[480,270],[0,270],[0,223]],'#727482');
    for(let i=0;i<28;i++)line(c,0,150+i*i*.18,480,150+i*i*.18,'#5C6171');
    for(let i=0;i<14;i++)line(c,270,139,i*42-40,270,'#5C6171');
    for(let i=8;i>=0;i--){
      const s=1-i*.092,x=50+i*25,y=139+i*1.5,w=80*s,h=93*s;
      r(c,x,y,w,h,'#344455');r(c,x+4,y+12,w-8,h-14,'#A86E3C');r(c,x+8,y+21,w-15,h-33,i%2?'#D5964F':'#E4B66F');
      for(let j=0;j<4;j++)r(c,x+12+j*(w-20)/4,y+22,2,h-33,'#654F46');
      poly(c,[[x-4,y+10],[x+w+4,y+10],[x+w+10,y+23],[x-9,y+23]],i%2?'#8F5159':'#527C78');
      for(let j=0;j<5;j++)r(c,x+j*w/5,y+10,w/10,13,i%2?'#C88B79':'#7F9C8B');
      r(c,x,y+h-9,w,9,'#263847');r(c,x+6,y+4,w-12,5,P.cream);
      const xr=440-i*18;r(c,xr-w/2,y,w/2,h,'#344455');r(c,xr-w/2+4,y+21,w/2-7,h-35,P.ochre);
      poly(c,[[xr-w/2-3,y+10],[xr+4,y+10],[xr+9,y+23],[xr-w/2-8,y+23]],'#8F5159');
    }
    for(let k=3;k>=0;k--){
      const cx=270,cy=151-k*4,rx=174-k*36,ry=101-k*21;
      for(let a=0;a<180;a++){const q=a*Math.PI/180,q2=(a+1)*Math.PI/180;line(c,cx+Math.cos(q)*rx,cy-Math.sin(q)*ry,cx+Math.cos(q2)*rx,cy-Math.sin(q2)*ry,'#222F45',5);line(c,cx+Math.cos(q)*rx,cy-Math.sin(q)*ry-2,cx+Math.cos(q2)*rx,cy-Math.sin(q2)*ry-2,'#B9C7C1');}
      if(k===0)for(let a=10;a<170;a+=14){const q=a*Math.PI/180,q2=(a+13)*Math.PI/180;line(c,cx+Math.cos(q)*rx,cy-Math.sin(q)*ry,cx+Math.cos(q2)*(rx-9),cy-Math.sin(q2)*(ry-10),'#91A3A6');}
    }
    r(c,91,146,9,76,'#26394B');r(c,100,146,3,76,'#B9C7C1');r(c,439,146,10,82,'#26394B');r(c,439,146,2,82,'#B9C7C1');
    for(let k=0;k<5;k++){const y=90+k*15,x1=144+k*23,x2=401-k*23;line(c,x1,y,x2,y+6,P.ink);for(let j=0;j<7;j++){const x=x1+j*(x2-x1)/6,yy=y+j,lit=t>.3+j*.09+k*.14;disk(c,x,yy+3,2,lit?P.amber:'#6E675F');if(lit)r(c,x,yy+2,1,2,P.cream);}}
    for(let i=0;i<180;i++)if(i%3===0)r(c,80+hash(i,43)*370+Math.floor(Math.sin(t+i)*1.5),200+hash(i,44)*70,2+hash(i,7)*8,1,i%2?'#C09970':'#89918C');
    for(let j=0;j<8;j++){const x=170+j*25+Math.floor(Math.sin(t*.4+j)*2),y=190+(j%3)*9;r(c,x,y-12,3,4,P.cream);r(c,x-1,y-8,5,7,j%2?P.rose:P.teal);r(c,x-1,y-1,2,4,P.ink);r(c,x+2,y-1,2,4,P.ink);}
    tree(c,23,214,86);tree(c,476,218,65);cyclist(c,65+t*37,247,t,1);
  }
  function lake(c,t){
    sky(c,t);r(c,0,126,480,14,'#C7BBB2');
    for(let i=0;i<45;i++){const ht=6+hash(i,65)*22;r(c,i*12,150-ht,7+hash(i,4)*10,ht,'#8A94A7');}
    for(let i=0;i<20;i++){const ht=10+hash(i,63)*28;r(c,180+i*15,157-ht,8,ht,'#647D91');}
    poly(c,[[308,151],[308,98],[311,73],[318,60],[326,57],[335,62],[342,76],[345,100],[345,151],[335,151],[334,101],[331,85],[328,79],[324,78],[321,84],[318,102],[318,151]],'#D4D5C4');
    line(c,310,144,313,83,'#E7D8B8',2);line(c,338,144,336,81,'#A3B0B2',2);
    for(let y=79;y<150;y+=4){r(c,310,y,7,1,'#6E899B');r(c,337,y,7,1,'#6E899B');}
    poly(c,[[361,141],[375,132],[398,130],[423,135],[446,147],[446,156],[361,156]],'#536A9C');
    line(c,362,142,381,135,'#B9C7D8',2);line(c,381,135,409,137,'#B9C7D8',2);line(c,409,137,445,149,'#B9C7D8',2);
    for(let x=366;x<445;x+=4)r(c,x,148,1,5,P.amber);r(c,0,157,480,3,'#394D68');
    water(c,160,83,t,['#536A9C','#7F91B0','#A4A2BA'],346);
    for(let i=0;i<70;i++)r(c,304+hash(i,9)*45+Math.floor(Math.sin(t*.9+i)*2),160+hash(i,14)*59,3+hash(i,8)*5,1,i%3?P.silver:P.cream);
    poly(c,[[164,190],[177,190],[174,193],[168,193]],P.ink);line(c,170,189,170,179,P.ink);poly(c,[[169,180],[169,188],[163,188]],P.cream);
    poly(c,[[0,224],[94,220],[187,231],[293,243],[480,250],[480,270],[0,270]],'#B2B3AA');
    line(c,0,224,94,220,'#D5CEB3',2);line(c,94,220,292,243,'#D5CEB3',2);
    for(let i=0;i<18;i++){const x=i*29,y=220+Math.max(0,x-90)*.074;line(c,x,y-14,x,y,P.ink,2);if(i<17)line(c,x,y-13,x+29,y-11,P.ink,2);}
    tree(c,8,253,92);tree(c,476,275,82);cyclist(c,72+Math.min(t,4.4)*28,245,Math.min(t,4.4));
    for(let i=0;i<3;i++){const x=240+i*15+Math.floor(t*2),y=58+i*3,wing=Math.floor(t*3)%2?2:-2;line(c,x-3,y+wing,x,y,P.blue);line(c,x,y,x+3,y+wing,P.blue);}
  }
  function memory(c,t){
    r(c,0,0,480,270,P.night);for(let x=0;x<480;x+=12)for(let y=0;y<270;y+=12)r(c,x,y,1,1,'#34435B');
    for(let i=0;i<22;i++){const x=hash(i,90)*480,y=hash(i,91)*270;line(c,x,y,x+36,y+12,'#304550');line(c,x+36,y+12,x+45,y+44,'#304550');}
    for(let i=0;i<120*Math.min(1,t/1.4);i++)r(c,20+i*2.2,150+Math.sin(i*.04)*35,2,2,P.route);
    disk(c,240,145,6,P.amber);r(c,238,143,4,4,P.night);
  }
  function outro(c,t){
    r(c,0,0,480,270,P.night);
    for(let x=0;x<480;x+=8)for(let y=0;y<270;y+=8)if(hash(x+y*480,5)>.3)r(c,x,y,1,1,'#23374A');
    poly(c,[[291,0],[318,39],[305,67],[337,92],[327,127],[354,159],[338,200],[357,270],[480,270],[480,0]],'#253F4C');
    for(let i=0;i<13;i++)line(c,240+i*17,13,261+i*17,264,'#324E58');
    for(let i=0;i<9;i++)line(c,242,26+i*28,480,37+i*28,'#324E58');
    const pts=(window.DOG_PLACES||[]).filter(p=>['nju-gulou-campus','huangshan','west-lake','jinji-lake','nju-suzhou-campus'].includes(p.id)).map(p=>({...p,x:262+(p.lng-118.1)*76,y:45+(32.1-p.lat)*75}));
    const route=Math.min(1,t/3);
    for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],f=Math.max(0,Math.min(1,route*(pts.length-1)-(i-1)));if(f>0)line(c,a.x,a.y,a.x+(b.x-a.x)*f,a.y+(b.y-a.y)*f,P.route,2);}
    for(let i=0;i<pts.length;i++){const p=pts[i];if(t<i*.32)continue;disk(c,p.x,p.y,4,P.amber);disk(c,p.x,p.y,1,P.night);}
  }
  function illustrated(c,t,kind){
    c.clearRect(0,0,480,270);
    const isLake=kind==='lake',isMarket=kind==='market';
    const x=isLake?45+Math.min(t,4.7)*25:35+t*37;
    if(kind!=='campus'){
      const sprite=document.getElementById('rider-source');
      const riderTime=isLake?Math.min(t,4.7):t;
      if(sprite&&sprite.complete&&sprite.naturalWidth){
        c.imageSmoothingEnabled=false;
        const frame=Math.floor(riderTime*7)%4,sw=sprite.naturalWidth/4;
        c.drawImage(sprite,frame*sw,0,sw,sprite.naturalHeight,Math.round(x-24),(isMarket?252:250)-56,48,64);
      }else cyclist(c,x,isMarket?252:250,riderTime);
    }
    if(!isMarket)for(let i=0;i<35;i++){
      const phase=(Math.floor(t*3)+i)%7;
      if(phase<2)r(c,250+hash(i,73)*160,185+hash(i,74)*35,2+hash(i,5)*3,1,phase===0?'#E7D8B8':'#B9C7D8');
    }
  }
  window.DogPixel={palette:P,rect:r,line,poly,hash,tree,cyclist,sky,campus,market,lake,memory,outro,illustrated};
})();
