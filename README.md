# Dog Map

[![Build](https://github.com/ZhouYinLong-lab/Dog-Map/actions/workflows/deploy-pages.yml/badge.svg?branch=master)](https://github.com/ZhouYinLong-lab/Dog-Map/actions/workflows/deploy-pages.yml)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111111)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre%20GL-5-396CB2?logo=maplibre&logoColor=white)](https://maplibre.org/)

一个以南京大学苏州校区为起点的个人路线档案地图。

[在线查看 Dog Map](https://zhouyinlong-lab.github.io/Dog-Map/)

## 标签

`React` `TypeScript` `Vite` `MapLibre GL` `Photo Archive` `Personal Map` `P5R-inspired`

## Overview / 项目简介

Dog Map 用地图记录出发、抵达和路过的地点。路线和地点由内容数据驱动，点击地点后可以查看对应的标题、照片和视频。

视觉上采用原创的黑、红、米白、黄色斜切语言，并将地点图标、路线颜色和媒体内容整合到同一张城市地图中。

## 核心功能

- MapLibre 地图与 3D 城市场景
- 路线数据结构，后续可继续添加路线并动态高亮
- 地点图标随地图缩放比例变化
- 地点详情抽屉与多媒体内容
- 点击图片查看大图，支持背景、关闭按钮和 `Esc` 退出
- 响应式移动端布局
- 静态照片与可选媒体 API 两种内容来源

## Getting Started / 本地开发

```bash
npm install
npm run dev
```

生产构建检查：

```bash
npm run build
```

预览构建结果：

```bash
npm run preview
```

运行端到端测试：

```bash
npm run test:e2e
```

## 添加地点

编辑 `src/data/places.json`，新增地点对象：

- `coordinates` 使用 `[经度, 纬度]`；
- `coordinateSource` 必须填写 `photo-exif` 或 `map-poi`；
- `coordinateReference` 必须说明坐标依据；
- `routeId`（可选）指向 `src/data/routes.json` 中的路线；
- `media` 支持多张图片和视频；
- `englishTitle`（可选）用于详情页的英文地点名；
- `shops`（可选）用于地点下的探店记录，每条记录包含店名、类型、简介和独立照片集；
- `markerImage` 可指定地点图标；
- `art` 可生成稳定的地点图案。

坐标证据同步记录在 `data/place-coordinate-evidence.json`。提交前运行：

```bash
npm run validate:places
```

生产构建会自动执行这项校验；地点坐标与证据坐标超过允许误差时，构建会失败。

## 添加路线

编辑 `src/data/routes.json`：

- `coordinates` 使用 `[经度, 纬度]` 的折线点数组；
- `title` 是路线名称；
- `mode` 是步行、公交或其他出行方式；
- 路线颜色会根据顺序自动分配。

## 添加照片

网页使用的图片放在：

```text
public/media/<地点 id>/
```

探店照片可以继续按店铺分目录保存：

```text
public/media/<地点 id>/shops/<店铺 id>/
```

原始照片可以保存在本地项目目录：

```text
media-originals/<地点 id>/
```

`media-originals/` 默认不会提交到 Git。建议网页使用 WebP，原图只作为本地素材归档。

## Repository Structure / 仓库结构

```text
Dog-Map/
├── public/media/             # 网页使用的图片、视频和地点素材
├── media-originals/          # 本地原图目录，不提交到 Git
├── src/
│   ├── components/           # 地图和界面组件
│   ├── data/                 # 地点、路线和内容数据
│   ├── map/                  # 地图样式、路线和图案逻辑
│   ├── services/             # 媒体 API 客户端
│   └── styles/               # 全局样式和设计令牌
├── server/                   # 可选的媒体服务
├── tests/                    # Playwright 端到端测试
└── README.md
```

## Contact / 问题反馈

发现问题或有新的路线、地点建议，可以提交 [GitHub Issue](https://github.com/ZhouYinLong-lab/Dog-Map/issues)。

## License / 许可证

### 项目源代码

Dog Map 的原创源代码采用 [MIT License](./LICENSE)。该许可只适用于本项目原创代码，不包含图片、地图数据和第三方软件或服务。

### 图片素材

项目照片、照片的 WebP 版本和自制图片素材采用 [CC BY-NC-ND 4.0](./LICENSE-MEDIA.md)。使用时需要署名，不得用于商业用途，也不得发布修改后的版本。

### 地图与第三方来源

地图渲染使用 MapLibre GL JS，地图服务与地图数据的许可、署名和来源见
[THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md)。地图数据归属 OpenStreetMap，
并遵循 ODbL 要求；网页地图角落会显示相应的 attribution。
