# 悠方广场更新记录

新增主地点 `ufun-plaza`（悠方广场 / UFUN PLAZA），包含一条 `liulang-paopao-bbq`（流浪泡泡烤肉）探店。按用户明确的附件顺序，前两张进入探店，后两张进入地点图册；不根据图片内容擅自调整归属。

## 原图与输出对应

原始附件只读，转换前后 SHA-256 一致。原始 JPEG 不纳入 Git；网站使用最长边 2560px、质量 88 的 WebP 副本，移除 EXIF；图册另有 960px 缩略图。原图上已有的相机水印仍在。

| 附件 | 原文件名 | 尺寸 | GPS（经度, 纬度） | 网站副本（相对于 public/media/ufun-plaza） |
| --- | --- | --- | --- | --- |
| 1 | codex-clipboard-ea5ba761-c906-40ef-b76c-78e4f2b0ba32.jpg | 4096×3072 | 120.523427778, 31.278183333 | shops/liulang-paopao-bbq/liulang-paopao-bbq-01.webp |
| 2 | codex-clipboard-cd756cf5-a71a-4b18-9365-8617ea662395.jpg | 5888×4416 | 120.523638889, 31.277330556 | shops/liulang-paopao-bbq/liulang-paopao-bbq-02.webp |
| 3 | codex-clipboard-ad13c16f-8c0d-4725-a898-63f8e39ef604.jpg | 4096×3072 | 120.523427778, 31.278088889 | ufun-plaza-01.webp |
| 4 | codex-clipboard-10f5a957-bb75-4f28-bc60-5dd1c101eda2.jpg | 5888×4416 | 120.523625, 31.277333333 | ufun-plaza-02.webp |

原图 SHA-256，按附件顺序：

```text
ab15a7451575fb380a07b157b10889c0c7a9a10507f01e7b1cb942586426cfe7
0593afb342aef5146bd2a5ab6803dfeb5187fa8927994f76d9ded0260ac29540
1cf9cf02490c29e8c948c3ca6b10a2a71c5164244ad8ea958622346aec03cc98
795a30b7888d68a7059f8a181c55b6ccf9f54382f10d6ec3167f6b0399cee9ca
```

4/4 有拍摄时间和 GPS；拍摄于 2026-10-24。页面不显示日期，不增加图片说明。坐标采用可识别商场外立面的第3张原图 GPS，其他拍摄点在约90米范围内；证据与20米坐标校验容差已记录到 `data/place-coordinate-evidence.json`。

## 图标

内置 imagegen 以第3张照片作建筑内容参考，以南苏无字底稿和自行车公园贴纸作风格参考，独立生成黑白线稿、网点、交叉排线与不规则白边。完整提示词：`references/p5r-location-stickers/generated/ufun-plaza-prompt.txt`。

无字透明底稿为 `ufun-plaza-sticker.webp`；仅对本次 ID 执行排版脚本生成 `ufun-plaza-sticker-v4.webp`。针对底稿标题牌位置调整中文、英文基线，避免英文落到白边。地图使用480×512的 `.marker.webp`（约75KB），大小继续按照片数动态计算。

验收包括与自行车公园、玄武湖并排比较，完整标题版、512px派生图、桌面和手机实际地图及详情截图。底稿和成品都有真 Alpha，画布角点 alpha=0；无新增商标、日期或生图文字。

## 检查

- `npm run validate:places`：19个地点通过。
- `npm run assets:derive`、`npm run validate:media`：362个派生图生成并校验通过；旧地点派生图没有 Git 差异。
- `npm run build`：通过；保留现有 MapLibre 分包尺寸提示。
- `npx playwright test --list`：44项。首次动态导入 JSON 缺少类型声明，补上 `with { type: 'json' }` 后正常收集。
- `npm run test:e2e -- --workers=2`：43项通过，1项按原配置跳过（手机项目不重复执行媒体 API 写入测试）。覆盖19个图标、悠方地点跳转、地点图册、独立探店图册、图片前后切换、返回地点以及既有地点功能。
- 桌面1440×1000与Pixel 5截图目检完成。截图辅助脚本最初试图点击被详情遮住的地图按钮而超时；仅在截图脚本内改用事件切换以隐藏箭头后完成截图，该操作不计入点击交互测试。正式回归的地点/探店点击与预览均通过。
- `git diff --check`：通过。原图、临时脚本/预览以及其他无关工作区文件不进入提交。
