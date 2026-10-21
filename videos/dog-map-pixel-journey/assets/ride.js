// Cinematic film progress, not a geographic route or an assertion about transport.
// Jinji Lake (14–21s) was not a cycling visit: keep progress but never draw a cyclist.
window.isCyclingChapter=function(time){return time<14||time>=21;};
window.drawRideProgress=function(time){
  const canvas=document.getElementById('ride-travel');if(!canvas)return;
  const c=canvas.getContext('2d');c.clearRect(0,0,480,40);
  const x=26+Math.min(35,Math.max(0,time))/35*420;
  c.fillStyle='#34435B';for(let px=16;px<464;px+=6)c.fillRect(px,31,3,1);
  c.fillStyle='#E4A24C';c.fillRect(16,31,Math.max(0,x-16),1);
  if(!window.isCyclingChapter(time)){
    c.fillStyle='#E7D8B8';c.fillRect(Math.round(x)-1,30,3,3);
    return;
  }
  const sprite=document.getElementById('rider-source');
  if(sprite?.naturalWidth){
    c.imageSmoothingEnabled=false;
    const sw=sprite.naturalWidth/4,frame=Math.floor(time*7)%4;
    c.drawImage(sprite,frame*sw,0,sw,sprite.naturalHeight,Math.round(x-12),0,24,32);
  }
};
