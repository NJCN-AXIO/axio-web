# 内容与素材维护手册

更新日期：2026-07-20

## 1. 维护原则

官网公开承诺必须来自已经存在、可以演示或明确标记为后续规划的 AXIO 能力。不要把路线图写成已交付功能，不使用虚构价格、虚构客户评价或无来源的精确指标。

当前定位基线：

- 主要服务于 Shopee 平台。
- 借助妙手 ERP 承接批量上架、改价和运营执行。
- 以预览、确认、受控执行和结果回读描述自动化边界。
- 不把某个用户的店铺数量、站点数量或样例平台数量写成产品固定指标。
- 透明定价用于自动化系统批量精准控价。

## 2. 修改共享文案

共享内容入口：`src/content/zh-cn.ts`。

适合在该文件维护：

- 品牌名称、副标题和导航
- Hero 文案与 CTA
- 证明条
- 六阶段经营闭环
- 三档版本方案
- 六组能力矩阵
- 首页说明、安全边界和页脚

修改后必须同步内容合同测试：

- `src/content/zh-cn.test.ts`
- `src/app/page.test.tsx`
- `src/app/(marketing)/public-routes.test.tsx`

能力状态规则：

- `NOW`：已经存在且可以提供证据的能力。
- `NEXT`：明确的后续规划。

新增能力时先确定状态，再更新计数断言。不要为了让测试通过而把 `NEXT` 改成 `NOW`。

## 3. 修改营销页面

页面位置：`src/app/(marketing)/`。

当前路由：

- `product/page.tsx`
- `solutions/page.tsx`
- `pricing/page.tsx`
- `demo/page.tsx`
- `privacy/page.tsx`
- `terms/page.tsx`

公共组件位于 `src/components/marketing/`。如需新增路由：

1. 创建静态 App Router 页面。
2. 更新 `src/content/zh-cn.ts` 导航或 CTA。
3. 确认 `ActiveNavigation` 的当前页逻辑。
4. 更新公开路由测试。
5. 构建后确认 `out/<route>/index.html` 存在。

不要在静态 `master` 中新增 Route Handler、Server Action、数据库访问或需要 Node.js 运行时的页面。

## 4. 首页区块顺序

首页组装位于 `src/app/page.tsx`。当前叙事顺序已经过验证：

1. Hero 完整控制台
2. 产品定位证明条
3. 六阶段经营闭环
4. 核心任务流程视频
5. 四张产品截图
6. 能力矩阵
7. 安全与交付
8. 全局演示位置
9. 版本方案
10. 微信联系 CTA

调整顺序会影响已有测试与故事逻辑，应先说明修改理由并补充浏览器回归。

## 5. 产品证据截图

当前公开使用：

| 文件                   | 用途                  |
| ---------------------- | --------------------- |
| `control-center.webp`  | Hero 完整控制台主视觉 |
| `supervisor.webp`      | AI 主管与任务编排     |
| `task-pricing.webp`    | 新建任务与精准定价    |
| `risk-control.webp`    | 违禁管控和风险词库    |
| `pricing-formula.webp` | 站点公式和利润反算    |

目录：`public/images/product-evidence/`。

硬性要求：

- WebP，宽度 1600px 或经现有测试认可的尺寸。
- 保留完整界面，不裁掉关键上下文，不拉伸。
- 去除 EXIF、ICC、XMP 等元数据。
- 不使用模糊截图代替可读产品证据。
- 不使用黑色填充边框；页面用与截图匹配的浅色背景承接固有比例。
- 每张图有具体中文替代文本和高清原图链接。

发布前逐张检查：

- 店铺名、店铺 ID、账号、邮箱、电话
- 订单号、真实销量、利润、成本、余额
- API Key、Cookie、签名、Token、浏览器配置
- 供应商身份、完整商品记录和客户法律实体
- 文件元数据和意外嵌入的路径

仓库提供受限采集脚本，只允许从 IPv4 loopback 源读取，并会阻止非 GET 写操作。示例：

```powershell
node scripts/capture-product-evidence.mjs --base-url http://127.0.0.1:8080 --out .tmp-product-evidence-review
```

脚本输出仍必须人工逐张审查。确认后再替换 `public/images/product-evidence/` 中的批准文件，并运行：

```powershell
npm test -- scripts/capture-product-evidence.test.mjs
npm run test:e2e -- tests/e2e/home-evidence.spec.ts
```

## 6. Hero 图片

Hero 使用 `control-center.webp`，通过 `withBasePath()` 生成地址并保留完整比例。

替换 Hero 时必须满足：

- 展示产品整体，而不是局部小图。
- 1440px 和 2048px 宽屏保持主导视觉。
- 手机不产生水平滚动。
- 提供完整原图入口。
- 首屏图片使用明确宽高，避免布局偏移。

相关测试：`tests/e2e/home-hero.spec.ts`。

## 7. 视频维护

注册表：`src/content/videos.ts`。

当前状态：

- `coreWorkflow`：`available`，使用 `public/videos/axio-core-task-workflow.mp4`。
- `overview`：`available`，使用 `public/videos/axio-product-presentation.mp4`（51.1 秒）和 `public/images/video-posters/axio-product-presentation.webp` 封面。

全局演示视频更新时：

1. 对视频进行与截图相同的敏感信息审查。
2. 输出适合浏览器播放的 H.264 MP4，并启用 faststart。
3. 添加独立 WebP 封面。
4. 将文件放入 `public/videos/` 和 `public/images/video-posters/`。
5. 在 `src/content/videos.ts` 把 `overview` 改为 `available`，填写 `src` 和 `durationSeconds`。
6. 同步 `src/content/videos.test.ts`。
7. 检查首页 `overview` 播放位使用新标题、封面、状态和媒体地址；`/demo` 保留独立的 `coreWorkflow` 流程视频。

视频不得自动播放，不得裁切源画面，原生控件不得被覆盖。

## 8. 微信二维码

文件：`public/images/contact/wechat-nay.webp`。

替换二维码时：

- 保留足够白色静区。
- 可以裁掉头像、地区和底部说明，但不能裁到二维码定位点。
- 维持页面中至少 180 CSS 像素的可扫描尺寸。
- 用另一台手机在浅色和深色主题下实际扫码。
- 同时检查首页最终 CTA 和 `/demo` 表单旁的两个位置。

## 9. 样式与交互

- 全局主题、按钮、页头和页脚：`src/app/globals.css`。
- 首页布局：`src/app/home.css`。
- 营销子页面：`src/app/(marketing)/marketing.css`。

保持现有 Shopee 橙单一强调色，不新增紫蓝发光、渐变文字、装饰性玻璃卡片或虚构仪表盘。

导航选中态使用 `aria-current`，不能只依赖 hover。任何新增交互必须有键盘焦点、44px 触控目标和减弱动效回退。

## 10. 发布检查

```powershell
npm run verify
npm run test:e2e
git diff --check
```

人工检查：

- 2048×1024 和 1440×900 宽屏
- 1024×768 窄屏
- 390×844 手机
- 浅色与深色主题
- 首页全部产品图和两个视频位置
- 直接刷新每个公开路由
- 未配置和已配置 Formspree 两种表单状态
- 浏览器控制台和网络面板无 404

完成后更新相关文档和设计记录，避免源码、测试和说明互相漂移。
