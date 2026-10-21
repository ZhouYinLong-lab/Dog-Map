// Cinematic film progress, not a geographic route or an assertion about transport.
window.drawRideProgress=function(time){
  const canvas=document.getElementById('ride-travel');if(!canvas)return;
  const c=canvas.getContext('2d');c.clearRect(0,0,480,40);
  const x=26+Math.min(47,Math.max(0,time))/47*464;
  c.fillStyle='#34435B';for(let px=16;px<464;px+=6)c.fillRect(px,31,3,1);
  c.fillStyle='#E4A24C';c.fillRect(16,31,Math.max(0,x-16),1);
  const sprite=document.getElementById('rider-source');
  if(sprite?.naturalWidth){
    c.imageSmoothingEnabled=false;
    const sw=sprite.naturalWidth/4,frame=Math.floor(time*7)%4;
    c.drawImage(sprite,frame*sw,0,sw,sprite.naturalHeight,Math.round(x-12),0,24,32);
  }
};
