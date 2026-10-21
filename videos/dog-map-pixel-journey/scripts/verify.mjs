import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const index=readFileSync(resolve(root,'index.html'),'utf8');
const files=['index.html','compositions/frames/opening.html','compositions/frames/closing.html',...[1,2,3,4,5].map(i=>`compositions/frames/ride-0${i}.html`)];
for(const file of files){
  const html=readFileSync(resolve(root,file),'utf8');
  for(const m of html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g))assert.ok(existsSync(resolve(root,m[1])),`${file}: missing ${m[1]}`);
  assert.ok(!/<(?:script|img|audio|video)[^>]+src="https?:/.test(html),`${file}: runtime network dependency`);
}
assert.match(index,/id="film"[^>]+data-duration="47"/);
for(let i=1;i<=5;i++)assert.match(index,new RegExp(`data-composition-id="scene-0${i}"[^>]+data-start="${6+(i-1)*7}"[^>]+data-duration="7"`));
assert.match(index,/data-composition-id="opening"[^>]+data-start="0"[^>]+data-duration="6"/);
assert.match(index,/data-composition-id="closing"[^>]+data-start="41"[^>]+data-duration="6"/);
const photoPairs=[['huangshan.webp','huangshan/huangshan-01.webp'],['west-lake.webp','west-lake/west-lake-01.webp'],['jinji-lake.webp','jinji-lake/jinji-lake-09.webp'],['campus-photo.webp','nju-suzhou-campus/IMG20260824095359.webp']];
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
for(const [copy,source] of photoPairs)assert.equal(sha(resolve(root,'assets',copy)),sha(resolve(root,'../../public/media',source)),`Photo changed: ${copy}`);
const assets=JSON.parse(readFileSync(resolve(root,'capture/ride-assets.json'),'utf8'));
for(const asset of assets)assert.equal(sha(resolve(root,asset.target)),sha(resolve(root,'../..',asset.source)),`Ride asset changed: ${asset.target}`);
assert.ok(files.every(f=>!readFileSync(resolve(root,f),'utf8').includes('DogPixel.outro')),'Synthetic map reintroduced');
const path=resolve(root,process.argv[2]||'renders/dog-map-pixel-journey-v5.mp4');
assert.ok(existsSync(path),`Render missing: ${path}`);
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-of','json',path],{encoding:'utf8'}));
const video=probe.streams.find(s=>s.codec_type==='video'),audio=probe.streams.find(s=>s.codec_type==='audio');
assert.equal(video.width,1920);assert.equal(video.height,1080);assert.equal(video.r_frame_rate,'30/1');assert.equal(+video.nb_read_frames,1410);
assert.ok(Math.abs(+probe.format.duration-47)<.1);assert.ok(audio,'Missing audio');assert.equal(audio.channels,2);
// Capture stderr without treating ffmpeg's normal informational stream as an error.
import {spawnSync} from 'node:child_process';
const result=spawnSync('ffmpeg',['-hide_banner','-i',path,'-vf','blackdetect=d=0.1:pix_th=0.05','-af','volumedetect','-f','null','NUL'],{encoding:'utf8'});
assert.equal(result.status,0);const diagnostic=result.stderr;assert.ok(!/black_start:/.test(diagnostic),'Unexpected black segment >= 100ms');
const report={video:{width:video.width,height:video.height,fps:video.r_frame_rate,frames:+video.nb_read_frames,duration:+probe.format.duration,codec:video.codec_name,pixelFormat:video.pix_fmt},audio:{codec:audio.codec_name,channels:audio.channels,sampleRate:audio.sample_rate},originalPhotos:'SHA-256 identical',blackSegmentsOver100ms:0,audioMeasurements:diagnostic.split('\n').filter(l=>/mean_volume|max_volume/.test(l)).map(l=>l.replace(/^\[[^\]]+\]\s*/,''))};
mkdirSync(resolve(root,'renders'),{recursive:true});writeFileSync(resolve(root,'renders/verification.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
