# v2 验收记录

- 成片：renders/dog-map-pixel-journey-v2.mp4，35 秒，1920×1080，30fps，1050 帧。
- 编码：H.264 / yuv420p，AAC 双声道 48kHz；约 13MB。
- HyperFrames check：lint、runtime、layout、motion 均无错误；19/19 文字对比度通过。
- 检查报告：e207ff1e-e895-4618-b8cf-d0efe7870450。
- 视觉检查：校区像素开场、真实网页、右侧原比例照片、右上角原网站图标、跨场景连续骑行；已检查实际 MP4 解码帧。
- 资源：20 个骑行分镜照片/图标复制件与原文件 SHA-256 相同，旧片 4 张照片复制件也相同。
- 黑帧：无持续 100ms 以上黑段。
- 音频：峰值 -2.4dB，平均 -19.0dB；无缺失音轨。
- 渲染路径：screenshot / NVIDIA hardware GPU，48.2 秒完成。
- Studio 预览地址返回 HTTP 200。独立裸 iframe 倒序 seek 测试因 Studio 的宿主初始化/懒加载协议未完成，未计入通过项；该临时测试已撤回。
- 保留 v1 成片供比较；原照片与网站代码未修改。
