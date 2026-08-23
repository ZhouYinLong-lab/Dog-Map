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

## GitHub Pages

仓库已配置 GitHub Actions。推送到 `master` 后会自动构建并发布静态前端：

```text
https://zhouyinlong-lab.github.io/Dog-Map/
```

GitHub Pages 只负责静态前端；媒体 API、R2 和 Postgres 仍需单独部署。没有配置 `VITE_MEDIA_API_URL` 时，页面会使用仓库中 `public/media/` 的静态媒体。

## 媒体服务

前端仍然可以作为静态站放在现有托管平台；媒体上传、读取和删除由独立的 Hono API 服务处理。API 不把图片和视频写进数据库：二进制进入 StorageProvider，数据库只保存文件路径和元信息。

启动本地媒体服务：

```bash
Copy-Item .env.example .env
npm run server:dev
```

默认配置是本地文件系统 + JSON catalog：

- 文件：`data/media/<地点>/<时间>-<名称>-<短 id>.<扩展名>`；
- 元信息：`data/media-catalog.json`；
- API：`http://localhost:8787`；
- `POST /api/media`：multipart 上传，字段为 `file`、`placeId`、`altText`、`caption`、`sortOrder`；
- `GET /api/media?placeId=<id>`：读取媒体元信息；
- `DELETE /api/media/<asset id>`：删除对象和元信息；
- `GET /api/health`：检查当前 storage/database driver。

如果设置了 `MEDIA_ADMIN_TOKEN`，上传和删除请求必须带 `Authorization: Bearer <token>`。启用 R2 时必须设置这个 token；不要把它放进 `VITE_` 变量，也不要提交到前端或 Git。

生产环境切换到 R2 + Postgres 时，将 `.env` 中的：

```text
MEDIA_STORAGE_DRIVER=r2
MEDIA_DATABASE_DRIVER=postgres
```

并填写 R2 S3 endpoint、只授予目标 bucket 读写权限的服务端密钥、R2 自定义域名和 `DATABASE_URL`。先执行 `server/migrations/001_media_assets.sql`，再启动 API。R2 的公开媒体地址建议使用绑定到自有域名的 custom domain；`r2.dev` 只用于开发验证。

`server/app.ts` 导出 Hono app，可由现有托管平台的 Node/serverless 入口适配；`server/index.ts` 只是本地 Node 启动器。

所有 storage 和 catalog 实现都通过接口调用，切换存储时不需要修改地图组件或地点 JSON。

## 新增地点

编辑 `src/data/places.json`，新增一个地点对象：

- `coordinates` 使用 `[经度, 纬度]`；
- `routeId` 指向 `src/data/routes.json` 中的路线；
- `media` 支持 `image` 和 `video`；
- 图片或视频放入 `public/media/<地点 id>/`；
- 暂时没有视频文件时，可以保留 `poster` 和空的 `src`，页面会显示视频占位区。
- 可选 `art` 字段生成稳定的透明不规则图案，例如 `{"seed":"lake","variant":"orbit"}`；地点详情打开时只显示当前地点的图案。

## 新增路线

编辑 `src/data/routes.json`，添加一条路线对象：

- `coordinates` 是路线折线点数组；
- 每个点使用 `[经度, 纬度]`；
- 不需要手动填写颜色：路线会按顺序从高对比调色板自动分配颜色，地图线、地点标识和图例保持同步；
- 可选 `art` 字段生成路线图案；当前选中的路线会显示一个图案并循环播放路线光点，点击图例可以切换路线和镜头跟随；
- 当前示例坐标用于展示界面结构，正式记录时应替换成实际路线坐标。

## 正式使用前核对

- 将 `src/data/routes.json` 和 `src/data/places.json` 中的示例路线、日期、文字和媒体替换成真实记录；
- 静态前端继续部署到现有托管平台，单独部署 `server/app.ts` 对应的媒体 API；
- 生产环境使用 R2 + Postgres 时，设置服务端密钥、`R2_PUBLIC_BASE_URL`、`DATABASE_URL` 和 `MEDIA_ADMIN_TOKEN`，并执行 `server/migrations/001_media_assets.sql`；
- 不要把 R2 密钥或管理员 token 写入 `VITE_` 变量；
- 正式使用前为当前地图服务确认访问额度、服务条款和地图资质，必要时替换 `src/components/MapView.tsx` 中的 OSM 栅格源。

`src/data/content.ts` 只负责把 JSON 内容加载成页面使用的类型，不需要在新增记录时修改。

## 地图适配

地图渲染集中在 `src/components/MapView.tsx`。默认使用 OpenFreeMap 的 MapLibre 矢量 style，并在可用的建筑高度数据上增加 3D extrusion；路线使用 GeoJSON source 和地图原生 line layer，地点使用坐标锚定的 HTML Marker，因此缩放、拖动时不会漂移。`VITE_MAP_STYLE_URL` 可以替换为自有 MapLibre style JSON，无法访问时会自动回退到 OSM 栅格底图。

当前默认的 OpenFreeMap 公共实例无需 token，但正式长期使用前仍应根据访问量、服务条款和地图资质评估公共实例、自己托管或商业矢量服务的选择。
