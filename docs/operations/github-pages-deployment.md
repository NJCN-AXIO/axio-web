# GitHub Pages 发布手册

更新日期：2026-08-19

## 1. 适用范围

本手册只适用于 `master` 的纯静态官网。它不部署 `future/server-features` 或 `wip/member-center` 中的数据库、认证和会员中心代码。

发布工作流：`.github/workflows/deploy-pages.yml`

静态产物：`out/`

触发方式：

- 推送到 `master`
- 在 GitHub Actions 中手动运行 `Deploy static site to Pages`

## 2. 发布前检查

本地需要 Node.js 24，并确保 3000 端口可用于 Playwright 自动启动开发服务。

```powershell
npm ci
npm run verify
npm run test:e2e
git diff --check
```

`npm run verify` 会执行 Lint、TypeScript、Prettier、Vitest 和静态构建。Playwright 不包含在该命令中，必须单独运行。

如果 3000 端口已有官网预览，可指定现有地址：

```powershell
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3001'
npm run test:e2e
```

本地 Next 开发服务器不会把 `/preview/` 自动回退到 `public/preview/index.html`；预览 E2E 因此直接打开 `./preview/index.html`，避免把开发服务器的 404 当成静态预览回归。GitHub Pages 静态导出仍需按下方子路径规则验收 `/preview/`。

## 3. GitHub 仓库设置

首次发布需要：

1. 打开仓库 `Settings > Pages`。
2. 将 `Build and deployment > Source` 设置为 `GitHub Actions`。
3. 确认 Actions 对该仓库可用。
4. 推送 `master` 或手动运行工作流。

工作流权限已经限制为：

- `contents: read`
- `pages: write`
- `id-token: write`

部署任务使用 GitHub Pages Environment，并由 `actions/deploy-pages` 发布 `out/`。

## 4. 演示预约配置

GitHub Pages 自身不能接收表单。当前站点可将表单直接 POST 到 Formspree。

配置步骤：

1. 在 Formspree 创建表单并确认接收邮箱。
2. 打开 GitHub 仓库 `Settings > Secrets and variables > Actions > Variables`。
3. 新建 Repository variable：`NEXT_PUBLIC_DEMO_FORM_ENDPOINT`。
4. 值必须类似 `https://formspree.io/f/xxxxxxxx`。
5. 重新运行 Pages 工作流。

该地址会进入浏览器 HTML，不属于秘密。不要把 API 密钥、SMTP 密码或访问令牌放进任何 `NEXT_PUBLIC_*` 变量。

未配置或格式不正确时：

- 表单字段保持禁用。
- 按钮显示“预约通道配置中”。
- 页面仍显示微信二维码作为直接联系入口。
- 浏览器不会向不存在的 AXIO 接口发送个人信息。

## 5. 子路径规则

工作流根据仓库名称自动计算 `NEXT_PUBLIC_BASE_PATH`：

| 仓库类型                         | 公开地址示例                          | Base Path   |
| -------------------------------- | ------------------------------------- | ----------- |
| 用户主页仓库 `<owner>.github.io` | `https://<owner>.github.io/`          | 空          |
| 普通项目仓库 `axio-web`          | `https://<owner>.github.io/axio-web/` | `/axio-web` |

`next.config.ts` 将该值同时用于 `basePath` 和 `assetPrefix`。图片、视频和二维码通过 `withBasePath()` 生成地址。

不要在 React 组件中直接拼接 `/<仓库名>/...`。仓库名变化时，这类硬编码会导致 404。

## 6. 验证部署

工作流完成后检查：

- 首页和七个营销/法律路由（含 `/download`）都可直接刷新。
- 页面跳转保留仓库子路径。
- Hero、四张产品证据图、视频封面、核心视频和二维码正常加载。
- 桌面导航当前页高亮，首页能力矩阵锚点高亮。
- 浅色和深色主题切换后刷新仍保留。
- 未配置 Formspree 时表单禁用；配置后表单 action 指向预期 Formspree 地址。
- `/download` 可以预先显示固定 HTTPS 云盘文件夹，但签名 ZIP 未上传或未验收时，版本、文件大小和 SHA-256 必须保持“待发布”；`downloadUrl` 为空时仍显示“正式下载链接准备中，请联系 AXIO 获取”，不生成空 `href`。
- `/download` 的五份 CSV 模板和两份客户手册可在根路径与项目子路径打开，且不含凭据、许可文件、Cookie、浏览器 Profile、Founder/ACCIO 数据或内部路径。
- FAQ 的原生 `<details>/<summary>` 可展开，回答明确隐私、费用、失败关闭、未知写入不自动重试和理论利润/妙手结算净利润边界。
- 浏览器控制台没有资源 404 或混合内容错误。

建议至少检查以下尺寸：

- 1440×900 宽屏
- 1024×768 窄屏
- 390×844 手机

## 7. 客户包手动发布与下载中心维护

官网只发布静态元数据，不负责生成或托管客户 ZIP。每次新版本都必须人工完成：

1. 在产品仓库完成签名构建和功能冻结，确认 ZIP 是空白客户包，排除源码、私钥、许可、API Key、Cookie、浏览器 Profile、Founder/ACCIO 数据和内部路径。
2. 将该精确 ZIP 上传到 HTTPS 网盘或其他分发渠道，人工下载并验证可达性、文件大小和 SHA-256；不要填写未经验证的 URL。
3. 更新 `src/content/zh-cn.ts` 的 `publicRelease`：`releaseVersion`、`releaseDate`、`downloadUrl`、`sha256`、`fileSize`、`releaseNotes`。`templateUrl` 和 `manualUrl` 仅在对应公开资源已经提交时填写；当前模板和手册由 `withBasePath()` 指向仓库内空白资源。
4. 运行 `npm run verify`、`npm run test:e2e`、`git diff --check`，在 1440×900、1024×768 和 390×844 检查 `/download`，并确认外部链接使用 `target="_blank" rel="noreferrer"`。
5. 推送 `master` 并等待 Pages 工作流；发布后再次打开根路径和项目子路径，检查 ZIP 链接、模板、手册、FAQ 和 SHA-256 文案一致。

固定 HTTPS 云盘文件夹可以在签名 ZIP 之前配置，页面必须明确文件仍待上传，并将版本、文件大小和 SHA-256 保持为“待发布”。如果没有稳定云盘文件夹，则保持 `downloadUrl: ""`，页面按钮禁用并显示“正式下载链接准备中，请联系 AXIO 获取”。

## 8. 回滚

优先使用可审计的 Git 回滚，不直接修改 `out/` 或 Pages 产物。

```powershell
git log --oneline
git revert <需要撤销的提交>
git push origin master
```

新的 revert 提交会触发完整验证和重新部署。若只是 GitHub 基础设施故障，可在 Actions 中重新运行最近一次成功提交对应的工作流。

## 9. 常见问题

### 页面存在，但图片或视频 404

检查：

- 工作流是否正确设置 `NEXT_PUBLIC_BASE_PATH`。
- 新媒体是否通过 `withBasePath()` 使用。
- 文件名大小写是否与 `public/` 中完全一致。Linux 构建区分大小写。
- 文件是否被 Git 跟踪，而不是只存在于本机。

### 直接刷新子页面 404

确认 `next.config.ts` 仍包含 `output: "export"` 和 `trailingSlash: true`，并检查 `out/<route>/index.html` 是否生成。

### 表单一直显示配置中

检查变量是否建在 Actions Variables，而不是只存在于本地；确认前缀为 `https://formspree.io/f/`；修改变量后必须重新构建。

### Actions 构建通过但 Pages 不更新

检查：

- Pages Source 是否为 GitHub Actions。
- `deploy` job 是否获得 `github-pages` Environment。
- 是否有更新的运行因 concurrency 取消了旧运行。
- 浏览器或 CDN 是否仍缓存旧静态资源。

### Playwright 报告 3000 端口占用

停止占用 3000 的无关服务，或通过 `PLAYWRIGHT_BASE_URL` 指向已经运行的官网预览。

## 10. 自定义域名

当前工作流按 GitHub 默认项目地址计算子路径，尚未为项目仓库的自定义根域名自动切换为空 Base Path。

启用自定义域名前必须先调整工作流的路径策略，并验证所有路由和媒体在域名根路径下工作。不要只在 Pages 设置里绑定域名后直接发布，否则项目仓库可能仍引用 `/<仓库名>/` 资源。

## 11. 安全边界

- `out/` 中的全部内容都视为公开信息。
- `.env`、`.env.local`、测试报告和构建产物不提交。
- Pages 不应包含任何平台凭证、SMTP 密钥、数据库 URL 或内部产品地址。
- 产品截图和视频发布前按 `docs/content-maintenance.md` 完成敏感信息检查。
