# Dog Map · 私人旅行存档

v5：47 秒，1920×1080，30fps，原创配乐，无旁白。

成片：`renders/dog-map-pixel-journey-v5.mp4`；本地播放器：`watch.html`。
无文字像素封面：`covers/dog-map-cover-pixel-v2.png`；风格与裁切说明：`covers/README.md`。
v1–v4 成片均保留在 `renders/`，不要与新版混淆。

右侧 15 张真实照片统一放进 512×400 大相框：新照片覆盖在前，旧照片仅露出窄边，偏转限制在 0–2°。横竖照片使用主体取景展示，不拉伸、不改原文件；切换地点整叠退场，西湖片尾保留。右上图标与照片列对齐。
自行车恢复为全片连续的旅行符号，不代表每个地点的实际交通方式。金鸡湖标题保留「湖畔灯火，收进相册」。
开篇使用用户提供的太湖全景，衔接真实网站的 3D 镜头推进，最终收进南苏正文的网页框。结尾从西湖网页展开、回到太湖地图，保留品牌、网址和「下一站，继续。」。
首尾各 6 秒，正文仍为五段各 7 秒。南苏正文直接显示真实地图，不再先切到建筑插画。

## 编辑与重建

在本目录执行：

```powershell
npm run prepare
npm test
npm run check
npm run dev
npm run render
npm run verify
```

重拍网站截图：`node scripts/capture-product.mjs`（需要网络）。
重拍开篇镜头：先在仓库根目录运行 `npm run dev -- --host 127.0.0.1`，再运行 `node scripts/capture-bookends.mjs`。工具在浏览器响应中注入临时地图引用；不会改动网站源代码。固定素材已随项目保存，日常重渲染不需要重拍。
Studio：`http://localhost:3017/#project/dog-map-pixel-journey`。
渲染 MP4 与本地历史不提交 Git；保留截图等固定素材，可离线重渲染。
`npm run prepare` 需要父仓库的原地点素材；运行库使用 Node 22 包装器。

- 时间轴：`STORYBOARD.md`
- 活跃分镜：`compositions/frames/ride-01.html` 至 `ride-05.html`
- 布局、照片堆叠与连续骑行：`assets/ride.css`、`assets/photo-stack.js`、`assets/ride.js`
- 来源：`SOURCES.md`、`capture/website-interactions.json`、`capture/ride-assets.json`
- 建筑校核：`CAMPUS-REFERENCE.md`

正文网页截图来自实际线上网站；新增推进镜头来自本地同源网站，仅在采集时隐藏视角按钮与箭头，地理数据、3D 透视和图标均由原网站渲染。用户截图复制件保持原样。
原照片未改动，网站源代码未修改。未向外部视频平台上传视频。
