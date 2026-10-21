// One shared, seek-safe stack contract for every location. Source pixels stay untouched.
window.addRidePhotoStack=function(timeline,prefix,{exit=true}={}){
  const angles=[-5,4,-4];
  const arrivals=[.5,2.65,4.8];
  for(let i=0;i<3;i++){
    const photo=document.getElementById(`${prefix}-photo${i+1}`);
    const counter=document.getElementById(`${prefix}-counter${i+1}`);
    // Authored dimensions record source aspect ratio; do not depend on image decode order.
    const aspect=Number.parseFloat(photo.style.width)/Number.parseFloat(photo.style.height);
    const width=Math.min(450,400*aspect),height=width/aspect;
    Object.assign(photo.style,{
      width:`${width}px`,height:`${height}px`,
      // Bottom-edge spacing keeps old photos exposed even with mixed aspect ratios.
      left:`${252+i*14-width/2}px`,top:`${570-i*80-height}px`,zIndex:String(i+1)
    });
    counter.style.left='32px';counter.style.top='630px';counter.style.zIndex='4';
    // Never fade, dim, shrink or move an older photo when a new photo arrives.
    timeline.fromTo(`#${prefix}-photo${i+1}`,
      {opacity:0,x:24,y:-24,rotation:angles[i]+6},
      {opacity:1,x:0,y:0,rotation:angles[i],duration:.45,ease:'power2.out'},arrivals[i]);
    timeline.fromTo(`#${prefix}-counter${i+1}`,{opacity:0},{opacity:1,duration:.15},arrivals[i]+.25);
    if(i<2)timeline.to(`#${prefix}-counter${i+1}`,{opacity:0,duration:.1},arrivals[i+1]);
  }
  // Only the whole pile leaves on a location cut. The final memory pile holds to the end.
  if(exit)timeline.fromTo(`#${prefix}-stack`,{opacity:1,y:0},
    {opacity:0,y:24,duration:.3,ease:'power2.in'},6.7);
};
