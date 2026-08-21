# Dog Map

一个以南京大学苏州校区为中心的个人路线档案网页。地图是主体，地点和路线以内容数据驱动，界面使用原创的 P5R-inspired 黑红米白斜切视觉语言。

## 开发

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## 新增地点

编辑 `src/data/places.json`，新增一个地点对象：

- `coordinates` 使用 `[经度, 纬度]`；
- `routeId` 指向 `src/data/routes.ts` 中的路线；
- `media` 支持 `image` 和 `video`；
- 图片或视频放入 `public/media/<地点 id>/`；
- 暂时没有视频文件时，可以保留 `poster` 和空的 `src`，页面会显示视频占位区。

## 新增路线

编辑 `src/data/routes.json`，添加一条路线对象：

- `coordinates` 是路线折线点数组；
- 每个点使用 `[经度, 纬度]`；
- 当前示例坐标用于展示界面结构，正式记录时应替换成实际路线坐标。

`src/data/content.ts` 只负责把 JSON 内容加载成页面使用的类型，不需要在新增记录时修改。

## 地图适配

地图渲染集中在 `src/components/MapView.tsx`。路线使用 GeoJSON source 和地图原生 line layer，地点使用坐标锚定的 HTML Marker，因此缩放、拖动时不会漂移。后续更换高德、MapTiler 或其他底图时，优先只替换地图初始化和底图 style，不要改动内容数据与详情 UI。

当前默认使用 OpenStreetMap 栅格底图进行本地运行验证，正式部署时请根据访问范围、服务条款和地图资质更换为合适的地图服务。
