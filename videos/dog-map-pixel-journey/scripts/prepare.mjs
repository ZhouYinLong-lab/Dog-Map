import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const places=JSON.parse(readFileSync(resolve(root,'../../src/data/places.json'),'utf8'));
const data=places.map(p=>({id:p.id,name:p.title,lng:p.coordinates[0],lat:p.coordinates[1]}));
writeFileSync(resolve(root,'assets/places.json'),JSON.stringify(data,null,2));
writeFileSync(resolve(root,'assets/places.js'),`window.DOG_PLACES=${JSON.stringify(data)};\n`);

// Original score: 60 beats in 35 seconds, five 12-beat chapters.
// Soft band-limited pulse/plucked sine melody, triangle bass, chord bed.
const sr=48000,duration=35,n=sr*duration,L=new Float64Array(n),R=new Float64Array(n),beat=7/12;
const hz=m=>440*2**((m-69)/12);
function tone(start,len,midi,volume,kind='bell',pan=0){
  const f=hz(midi),offset=Math.round(start*sr),count=Math.min(Math.round(len*sr),n-offset);
  for(let i=0;i<count;i++){
    const t=i/sr,fade=Math.min(1,t/.012)*Math.min(1,(len-t)/.12),phase=2*Math.PI*f*t;
    let v;
    if(kind==='pad')v=(Math.sin(phase)+.2*Math.sin(phase*2.002))*.6*Math.min(1,t/.4)*Math.min(1,(len-t)/.7);
    else if(kind==='bass')v=(Math.sin(phase)-Math.sin(3*phase)/9+Math.sin(5*phase)/25)*Math.exp(-t*1.7)*fade;
    else v=(Math.sin(phase)+.25*Math.sin(2*phase)*Math.exp(-t*5)+.1*Math.sin(4*phase)*Math.exp(-t*10))*Math.exp(-t*3.3)*fade;
    L[offset+i]+=v*volume*(1-pan*.35);R[offset+i]+=v*volume*(1+pan*.35);
  }
}
const chords=[[52,56,59,66],[49,52,56,59],[45,52,57,59],[47,54,59,61],[52,56,59,64]];
for(let s=0;s<10;s++){const ch=chords[Math.min(4,Math.floor(s/2))];for(let j=0;j<4;j++)tone(s*3.5,4,ch[j],.032,'pad',(j-1.5)/2);for(let b=0;b<6;b++)tone(s*3.5+b*beat,.7,ch[0]-12,.07,'bass',0);}
const phrases=[
 [64,68,71,73,71,68,66,64,68,71,76,73],
 [68,71,73,76,73,71,68,66,64,66,68,71],
 [69,73,76,78,76,73,71,69,68,66,64,66],
 [71,73,78,76,73,71,66,68,71,73,76,78],
 [76,73,71,68,71,73,76,71,68,66,64,64]
];
for(let s=0;s<5;s++)for(let k=0;k<12;k++){const at=s*7+k*beat;tone(at,.85,phrases[s][k],s===2?.09:.105,'bell',Math.sin(k)*.5);if(k%3===0)tone(at+beat/2,.5,phrases[s][k]+12,.025,'bell',-.4);}
// Discrete bright save/bell notes at chapter events.
for(const at of [0,7,14,22.2,24.1,24.7,30]){tone(at,.55,83,.035,'bell',.5);tone(at+.14,.7,88,.024,'bell',-.5);}
// Warm short cross-channel echo, no feedback accumulation.
for(let i=n-1;i>=Math.round(.21*sr);i--){L[i]+=R[i-Math.round(.21*sr)]*.14;R[i]+=L[i-Math.round(.17*sr)]*.12;}
let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));
const out=Buffer.alloc(44+n*4);out.write('RIFF');out.writeUInt32LE(out.length-8,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(2,22);out.writeUInt32LE(sr,24);out.writeUInt32LE(sr*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(n*4,40);
for(let i=0;i<n;i++){const t=i/sr,fade=Math.min(1,t/.4)*Math.min(1,(duration-t)/1.8),gain=.68/peak*fade;out.writeInt16LE(Math.round(Math.max(-1,Math.min(1,L[i]*gain))*32767),44+i*4);out.writeInt16LE(Math.round(Math.max(-1,Math.min(1,R[i]*gain))*32767),46+i*4);}
writeFileSync(resolve(root,'assets/journey.wav'),out);
console.log(`Prepared ${data.length} real places; original stereo score ${duration}s / ${sr}Hz.`);
