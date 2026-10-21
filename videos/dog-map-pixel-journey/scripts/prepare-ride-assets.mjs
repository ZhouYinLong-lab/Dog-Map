import {readFileSync,copyFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const repo=resolve(root,'../..');
const places=JSON.parse(readFileSync(resolve(repo,'src/data/places.json'),'utf8'));
const selections=[['nju-suzhou-campus',[0,4,7]],['dongzhu-night-market',[3,0,4]],['jinji-lake',[8,2,1]],['huangshan',[0,2,4]],['west-lake',[0,2,4]]];
const dest=resolve(root,'assets/ride');mkdirSync(dest,{recursive:true});const records=[];
for(const [id,indices] of selections){
  const place=places.find(p=>p.id===id);
  const entries=[['icon',place.markerImage],...indices.map((n,i)=>[`photo-${i+1}`,place.media[n].src])];
  for(const [label,url] of entries){
    const src=resolve(repo,'public',url.replace(/^\//,''));const target=`assets/ride/${id}-${label}.webp`;
    copyFileSync(src,resolve(root,target));
    records.push({place:id,source:`public${url}`,target,sha256:createHash('sha256').update(readFileSync(src)).digest('hex')});
  }
}
writeFileSync(resolve(root,'capture/ride-assets.json'),JSON.stringify(records,null,2));
console.log(`Copied ${records.length} original assets without changes.`);
