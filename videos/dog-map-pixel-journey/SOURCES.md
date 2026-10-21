# 素材与制作来源

## 视觉规则

- 用户指定：[RPG Maker × Turner](https://github.com/ZhouYinLong-lab/OhMyStyle/blob/main/style-packages/composites/rpg-maker-x-turner/README.md)。
- `composite.yaml` 分工：RPG Maker 60% 负责像素媒介，Turner 40% 负责天气、光照与空间层次；无油画笔触与摄影式生成场景。
- 场景图为本次生成的原创插画。东渚拱门参考本项目地点贴纸；南苏建筑参考南苏贴纸；金鸡湖天际线参考实际金鸡湖照片。夜市成图同时作为其余两张的风格参考。
- 早期两个生图请求遭遇 HTTP 429；夜市排队请求及后续南苏、金鸡湖重试成功。没有把失败请求记为成功产物。
- `pixel.js` 的建筑绘制函数是最初的程序化像素研究稿，作为源代码保留；最终场景使用生成插画与确定性动画。
- `assets/rider-sheet.png` 是专为本片生成的透明底四格骑行角色；播放时按固定时间切换踏板帧，不使用墙上时钟。

## 真实照片（复制件，原件未修改）

| 成片素材 | 项目内原路径 |
| --- | --- |
| assets/huangshan.webp | public/media/huangshan/huangshan-01.webp |
| assets/west-lake.webp | public/media/west-lake/west-lake-01.webp |
| assets/jinji-lake.webp | public/media/jinji-lake/jinji-lake-09.webp |
| assets/campus-photo.webp（备选） | public/media/nju-suzhou-campus/IMG20260824095359.webp |

图片仅进行画面布局和显示裁切，不改写原始照片，不生成照片说明。
地点名称及经纬度从 `src/data/places.json` 导出，不手填虚构坐标。

## 字体与运行库

- [Fusion Pixel Font](https://github.com/TakWolf/fusion-pixel-font)，12px proportional zh-Hans，SIL OFL 1.1；许可证 `assets/FONT-LICENSE.txt`。
- GSAP 3.14.2，下载自官方 npm 分发包，通过 jsDelivr 获取并本地保存；库文件保留原许可头。
- HyperFrames 0.8.181，源项目格式与逐帧渲染器。

## 音乐

`scripts/prepare.mjs` 原创离线合成：60 拍 / 35 秒，轻拨弦正弦音色、和弦底色和三角低音；没有采样商业音乐，没有克隆人声。
48kHz / 双声道 / PCM16。最终输出时以 0.8 增益混入。

## 边界

## v2：真实网页、骑行与实景校核

网页来自 https://map.zylatent.com/ 的实际浏览器截图，保留原 UI 和地图署名。
包括南苏首页、东渚探店、金鸡湖、黄山、西湖详情。拍摄脚本：scripts/capture-product.mjs。
浏览器通过实际按钮打开地点；拍摄记录：capture/website-interactions.json。
右侧 15 张真实照片及右上角 5 个原网站图标直接复制，来源与 SHA-256：capture/ride-assets.json。
照片按原比例显示，无虚构说明文字。
南苏依据南大官方天枢楼照片重新生成；来源、约束和提示摘要见 CAMPUS-REFERENCE.md。
两次参考图编辑遭遇服务器 500；最终为检查实景后按建筑特征描述生成，并非直接照片转绘。
旧片尾示意地图已退出时间轴，底部线仅为影片骑行进度，不是地理导航路径。

没有修改网站外观、路由、地图功能或媒体原件。
没有上传视频到任何外部视频托管平台。
片尾地址由项目 README 中的线上入口重定向确认，HTTPS `https://map.zylatent.com/` 在制作时返回 HTTP 200。
