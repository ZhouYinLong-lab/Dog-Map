# Dog Map / P5R-inspired location sticker style pack

这套风格用于 Dog Map 的地点图案、路线图案和后续生成素材。它借鉴 Persona 5 Royal 地图的视觉语法，但地点主体必须使用原创构图，不直接复制游戏原始贴图。

## 核心气质

- 黑白剪纸与丝网印刷感：黑色主体、暖白纸张、粗白色外轮廓。
- 不规则、不对称、有撕纸和手工裁切痕迹；禁止把地点做成普通圆点、圆角卡片或规则矩形图标。
- 构图要有明显的斜向张力、前后叠层和局部留白，缩小到地图上仍能认出轮廓。
- 地图是主角；地点贴纸是少量高辨识度的视觉锚点，不能铺满画面。

## 地图底层

- 背景：深蓝黑 / 炭黑 `#091118`、`#111A20`。
- 道路与建筑：低饱和灰绿、灰白线稿；水面使用更深的蓝黑块面。
- 可保留细密点阵、轻微噪点和倾斜透视，但不要加入大面积渐变、光晕或装饰性标语。
- 当前网站只保留：地图、路线、地点贴纸、点击后图册。不要恢复搜索框、地点编号、左上角/右下角宣传语或道路说明面板。

## 路线层

路线是地图上的第二主角，使用多样但克制的高饱和色：

| 用途 | 推荐色 |
| --- | --- |
| 青色路线 | `#32D6CE` |
| 黄绿色路线 | `#B6D93B` |
| 洋红路线 | `#D13DBB` |
| 金黄色路线 | `#F2C230` |
| 红色路线 | `#E8554F` |
| 蓝色路线 | `#269DDA` |

- 每条路线配深色外轮廓，宽度约为主线的 1.5 倍，避免在 3D 透视和缩放时融入道路。
- 动态路径采用“整段线逐步显现 / 摄像机跟随”的方式；不要使用持续移动的光点。
- 同一区域最多同时强调 2—3 条路线，其余路线降低透明度。

## 地点贴纸层

每个地点图案由四层组成：

1. 原创地点主体：建筑、树木、桥、水面或具有地方识别度的轮廓。
2. 黑色墨块：用来制造强烈的明暗关系和视觉重量。
3. 暖白色纸张边缘：不规则粗描边，形成“从地图上被撕下来”的感觉。
4. 黑色标题牌：可以是轻微倾斜的梯形、折角形或撕纸形，不使用标准 UI 卡片。

地点图案约束：

- 输出优先为透明背景 PNG。
- 黑白为主，允许极少量路线色作为局部强调，但不能出现大面积彩色背景。
- 一个图案只表达一个地点；不要在同一张图里拼接多个地点。
- 不放游戏 logo、人物、现成角色或难以确认版权来源的原始贴图。
- 生成时要求标题牌留空，最后用程序写入中文和英文，保证文字准确。

## 标题排版

- 中文：白色、粗体、居中，作为主要地点名。
- 英文：全大写、小字号、字距略宽，作为辅助识别。
- 推荐格式：

  ```text
  南京大学苏州校区
  NANJING UNIVERSITY · SUZHOU CAMPUS
  ```

- 不增加日期、路线说明、编号、状态徽章或宣传口号；这些信息属于图册内容，不属于地图贴纸。

## 交互与防杂乱规则

- 默认只显示地点贴纸的主体和标题牌；不显示常驻 tooltip。
- 悬停：整体放大约 `1.06—1.12`，提高白边亮度和阴影，不改变地理锚点。
- 点击：打开该地点的图册，图片、视频和文字都放在图册中，不把媒体信息常驻在地图上。
- 当前激活地点使用最高层级和轻微偏移，其他地点降一级；同屏不超过一个大尺寸展开图案。
- 缩放地图时，路线和贴纸都绑定经纬度/地图坐标，不绑定屏幕像素；图案尺寸使用受控的屏幕尺寸，避免缩放后消失或漂移。
- 低缩放级别只保留主路线和少量地点锚点；高缩放级别再显示相邻地点的完整贴纸。
- 地点密集区域采用“主地点 + 其余降权”的层级策略，避免贴纸互相遮挡。

## 生成提示词模板

```text
Create one original transparent location sticker for [地点名].
Use a high-contrast black ink and warm-white paper cutout language:
irregular hand-cut silhouette, bold white sticker outline, angular layered
shapes, distressed screen-print texture, asymmetrical composition, one place
only. Represent the local architecture and one or two distinctive environmental
clues. Reserve a blank black slanted nameplate at the bottom for typography.
No readable generated text, no map, no route line, no UI frame, no logo,
no characters, no regular rectangle, no circular badge, no colorful background.
```

## 当前示例

- 生成底稿：`generated/nanjing-university-suzhou-campus-base.png`
- 加入准确中英文标题后的示例：`generated/nanjing-university-suzhou-campus.png`
- 参考素材目录：`stations/`、`destinations/`
- 裁切和生成素材说明：`README.md`

