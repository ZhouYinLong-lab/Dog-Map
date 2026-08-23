# P5R-inspired map location icons

这是一套为 Dog Map 制作的原创 PNG 地点图标，借鉴 Persona 5 Royal 的高对比地图语言：黑色不规则底、米白描边、红/青/黄强调色。

图标没有直接复制游戏原始贴图，便于在本项目中继续修改和维护。每个 PNG 为 256×256、透明背景，可通过 `/p5r-map-icons/<group>/<name>.png` 使用；完整清单见 `manifest.json`。

## 子文件夹

- `transport/`：车站、列车、公交、目的地
- `locations/`：学校、住宅、公园、神社、博物馆、宫殿
- `services/`：咖啡店、餐厅、商店、便利店、书店、影院、电玩厅、健身房、诊所
- `objectives/`：记忆/图册记录点

生成脚本位于 `scripts/generate-p5r-map-icons.mjs`。修改图标后运行：

```bash
npm run generate:p5r-icons
```

参考了 P5R 地图和地点图标的公开资料，用于风格研究：

- https://wikiwiki.jp/persona5r/%E5%85%A8%E3%82%A8%E3%83%AA%E3%82%A2
- https://www.spriters-resource.com/playstation_4/persona5royal/
