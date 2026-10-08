# 地点更新规范（强制）

每次新增或更新地点都按本流程执行。图标视觉不达标时，不得用“先上线再说”的占位图替代。

## 1. 接收素材与保护原图

1. 一个景点文件夹对应一个地点；只有用户明确要求拆分时，才创建子地点。西湖等完整景点默认保持单地点。
2. 先列出文件数、格式、拍摄时间和 GPS 覆盖率，再开始处理。原始目录只读：禁止重命名、移动、覆盖或删除用户原图。
3. 网站只使用项目内优化副本，放在 `public/media/<place-id>/`；不得把相机原图直接作为网站资源提交。需要时保留原始文件名与输出文件名的对应关系，便于追溯。
4. 页面相册按实际素材顺序呈现。不要编造照片说明、时间或地点细节；用户未提供文字时只写必要的地点级简介。

## 2. 核实地点与坐标

1. 优先从照片 EXIF GPS 计算地点坐标。检查坐标簇、离群点和 GPS 缺失照片；跨区域路线只能选择用户要求的代表点，不得把路线照片的平均值误当成地点坐标。
2. 照片无可靠 GPS 时，使用明确的地图 POI，并在证据记录中保存 POI 名称、来源链接和坐标。
3. 在 `src/data/places.json` 写入 `[经度, 纬度]`、`coordinateSource`、`coordinateReference`；同时在 `data/place-coordinate-evidence.json` 建立匹配记录并设置有依据的误差范围。
4. 运行 `npm run validate:places`。超出容差时先复核，不得通过扩大容差掩盖定位错误。

## 3. 地点图标：风格硬门槛

统一参照：

- 首选生成底稿参考：`references/p5r-location-stickers/generated/nanjing-university-suzhou-campus-base.png`。
- 辅助参考：`public/media/taihu-cycling-park/taihu-cycling-park-sticker.webp`、`public/media/xuanwu-lake/xuanwu-lake-sticker.webp`。
- `references/p5r-location-stickers/style-pack.md` 是视觉规则的上位说明。

每个地点的图必须满足：

- 以景点照片作内容参考、以上述既有贴纸作风格参考；每个景点单独生成，不做多图拼版。
- 使用原创的高细节黑色钢笔/木刻线稿、网点与交叉排线、暖白负空间、强烈明暗和斜向动势；主体要像手工剪出的插画贴纸。
- 白色不规则外轮廓必须紧贴插画剪影；不能用重复的锯齿多边形、方框、圆章或统一容器框代替主体轮廓。
- 插画必须重绘/生成，不得把原照片简单阈值化、灰度化、加描边或直接套滤镜当作最终图标。不得出现大块空白天空、无法识别的黑团、主体裁切或缩小后糊成一团。
- 底部保留与主体一体的倾斜黑色标题牌；底稿不生成文字。由项目排版脚本精确添加中文名和英文名，不含日期、编号、标语或自动编写的说明。
- 透明画布必须是真透明 Alpha，不得把棋盘格绘进图里。禁止游戏 Logo、游戏角色、第三方商标和水印。

生成与验收：

1. 使用内置图像生成工具；每个地点一条独立提示，明确区分“地点照片参考”和“风格参考”。图像生成失败时停止图标流程并报告，不得静默改用照片滤镜、几何 SVG 或其他风格；CLI/API 回退需用户明确同意。
2. 将通过验收的无字透明底稿保存为 `public/media/<place-id>/<place-id>-sticker.webp`，再用 `scripts/render-marker-label-previews.mjs` 对指定地点生成准确双语标题贴纸。只传本次地点 ID，避免重绘既有图标。
3. 与至少两个既有图标并排检查；检查完整画布、透明边缘、标题倾斜和字距，并在 512px 轻量版及实际地图缩放级别下检查识别度。任何一项不通过都先迭代，不提交。

示例（先生成临时标题稿，再复制验收通过的目标文件）：

```powershell
node scripts/render-marker-label-previews.mjs .tmp-marker-labels west-lake
```

最终页面引用 `*-sticker-v4.webp`，地图读取其 `.marker.webp` 派生图。

## 4. 数据、派生图与性能

1. 新地点只向 `src/data/places.json` 添加一个主地点对象；同步图片路径、双语名称、必要简介、坐标来源与 `markerImage`。地点图标尺寸继续由项目基于照片数量动态计算，不加单地点硬编码。
2. 将网站照片转换为最长边不超过 2560px 的 WebP 副本；保留原片，不覆盖原片。执行 `npm run assets:derive` 生成 960px 图册缩略图和 512px 地图贴纸。
3. 更新 `tests/smoke.spec.ts`：地点数、所有新地点图标、详情打开与相册导航都要覆盖；不得留下过期的固定地点数量或只测旧地点的清单。

## 5. 提交前检查

按顺序执行并确认通过：

```powershell
npm run validate:places
npm run assets:derive
npm run validate:media
npm run build
npx playwright test --list
npm run test:e2e -- --workers=2
```

Playwright 因本机缺失浏览器而无法启动时，应如实记录为环境阻塞，不得描述成测试通过；条件允许时安装对应浏览器后重跑。提交前还需检查 `git diff --check`、素材目录和 `git status`，确保没有原图、临时预览或其他无关文件进入提交。提交后核对推送分支与远端提交哈希。
