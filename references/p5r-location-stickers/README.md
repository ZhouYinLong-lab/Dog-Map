# P5R map location sticker references

从 Sketchfab 的 Persona 5 Royal 地图预览图中裁切出的地点贴纸 PNG，作为视觉/生图参考使用，不接入网站页面。文件是预览图裁切结果，不是游戏原始纹理；相邻贴纸重叠处可能保留少量边缘。

- `stations/`：东京线路上的车站地点贴纸
- `destinations/`：海滨、公园、中华街等目的地贴纸
- `source/`：原始预览图
- `manifest.json`：来源和文件清单

来源：

https://sketchfab.com/3d-models/persona-5-royal-map-a8fd2793e583446e9509cf65f350fb9d

重新裁切：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/extract-p5r-location-stickers.ps1
```
