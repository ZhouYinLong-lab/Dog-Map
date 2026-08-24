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
- 多条路线的展示、选择和动态高亮
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
- `routeId` 指向 `src/data/routes.json` 中的路线；
- `media` 支持多张图片和视频；
- `markerImage` 可指定地点图标；
- `art` 可生成稳定的地点图案。

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

原始照片可以保存在本地项目目录：

```text
media-originals/<地点 id>/
```

`media-originals/` 默认不会提交到 Git。建议网页使用 WebP，原图只作为本地素材归档。

## Repository Structure / 仓库结构

```text
Dog-Map/
├── public/media/             # 网页使用的图片、视频和占位资源
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

仓库当前未单独声明许可证。代码和图片素材如需复用，请先联系项目作者。
