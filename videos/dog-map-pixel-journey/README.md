# Dog Map · 私人旅行存档

v3：35 秒，1920×1080，30fps，原创配乐，无旁白。

成片：`renders/dog-map-pixel-journey-v3.mp4`；本地播放器：`watch.html`。
v1、v2 成片均保留在 `renders/`，不要与新版混淆。

连续骑行贯穿五个地点。右侧 15 张真实照片按地点逐张堆叠：后来的压在前面的上面，旧照片不淡出、不缩小，错位倾斜露出画面；切换地点整叠退场，西湖片尾保留。右上角图标独立展示。
约 29 秒完全展示真实网页；南苏开场按官方天枢楼实景特征纠正；不再使用片尾虚构地图。

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
Studio：`http://localhost:3017/#project/dog-map-pixel-journey`。
渲染 MP4 与本地历史不提交 Git；保留截图等固定素材，可离线重渲染。
`npm run prepare` 需要父仓库的原地点素材；运行库使用 Node 22 包装器。

- 时间轴：`STORYBOARD.md`
- 活跃分镜：`compositions/frames/ride-01.html` 至 `ride-05.html`
- 布局、照片堆叠与连续骑行：`assets/ride.css`、`assets/photo-stack.js`、`assets/ride.js`
- 来源：`SOURCES.md`、`capture/website-interactions.json`、`capture/ride-assets.json`
- 建筑校核：`CAMPUS-REFERENCE.md`

网页截图来自实际线上网站，未重画、伪造或改写 UI。
原照片未改动，网站源代码未修改。未向外部视频平台上传视频。
