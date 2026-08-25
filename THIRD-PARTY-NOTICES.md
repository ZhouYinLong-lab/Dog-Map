# 第三方软件与地图来源

## MapLibre GL JS

本项目使用 [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js) 渲染交互式地图。MapLibre GL JS 采用 [BSD 3-Clause License](https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt) 发布。

## OpenFreeMap / OpenMapTiles / OpenStreetMap

矢量地图模式默认使用 [OpenFreeMap](https://openfreemap.org/) 提供的公开地图样式与矢量瓦片服务。OpenFreeMap 页面要求保留以下地图归属信息：

> OpenFreeMap © OpenMapTiles Data from OpenStreetMap

地图数据来自 [OpenStreetMap](https://www.openstreetmap.org/)，并依据 [Open Data Commons Open Database License（ODbL）](https://opendatacommons.org/licenses/odbl/) 提供。交互地图中的归属信息由 MapLibre 的 attribution control 显示。

当矢量地图服务不可用时，项目会回退到 [OpenStreetMap 标准瓦片服务](https://tile.openstreetmap.org/)。该模式同样适用 OpenStreetMap 的署名与 ODbL 要求，完整说明见 [OpenStreetMap Copyright](https://www.openstreetmap.org/copyright)。

这些第三方许可和来源声明不改变 Dog Map 自有源代码或图片素材的许可范围。
