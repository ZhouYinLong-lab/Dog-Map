// One consistently sized album stack. CSS reframes only the display, never source files.
window.addRidePhotoStack=function(timeline,prefix,{exit=true}={}){
  const angles=[-2,-1,0];
  const arrivals=[.5,2.65,4.8];
  for(let i=0;i<3;i++){
    const photo=document.getElementById(`${prefix}-photo${i+1}`);
    const counter=document.getElementById(`${prefix}-counter${i+1}`);
    // A panorama and a portrait occupy the same visual area: no thin strips or tiny cards.
    Object.assign(photo.style,{
      width:'512px',height:'400px',
      left:`${16+i*8}px`,top:`${120-i*16}px`,zIndex:String(i+1)
    });
    counter.style.left='32px';counter.style.top='560px';counter.style.zIndex='4';
    // Never fade, dim, shrink or move an older photo when a new photo arrives.
    timeline.fromTo(`#${prefix}-photo${i+1}`,
      {opacity:0,x:0,y:20,rotation:angles[i]},
      {opacity:1,x:0,y:0,rotation:angles[i],duration:.4,ease:'power2.out'},arrivals[i]);
    timeline.fromTo(`#${prefix}-counter${i+1}`,{opacity:0},{opacity:1,duration:.15},arrivals[i]+.25);
    if(i<2)timeline.to(`#${prefix}-counter${i+1}`,{opacity:0,duration:.1},arrivals[i+1]);
  }
  // Only the whole pile leaves on a location cut. The final memory pile holds to the end.
  if(exit)timeline.fromTo(`#${prefix}-stack`,{opacity:1,y:0},
    {opacity:0,y:24,duration:.3,ease:'power2.in'},6.7);
};
