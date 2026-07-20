# AXIO 智核官网

AXIO 智核的公开产品官网，主要介绍面向 Shopee 店群运营的自动化能力，以及通过妙手 ERP 承接批量执行的工作方式。

当前 `master` 是可直接部署到 GitHub Pages 的纯静态 Next.js 站点，不依赖数据库、邮件服务器或常驻 Node.js 服务。账号、登录、会员中心和授权下载等服务端能力保存在独立分支，未包含在当前线上范围。

## 当前范围

| 路由         | 用途                                                   |
| ------------ | ------------------------------------------------------ |
| `/`          | 首页、产品证据、经营闭环、能力矩阵、版本概览和微信联系 |
| `/product`   | 产品能力总览                                           |
| `/solutions` | 适用场景与解决方案                                     |
| `/pricing`   | Starter、Professional、Team 三档方案对比               |
| `/demo`      | 全局演示占位、核心流程视频、预约表单和微信二维码       |
| `/privacy`   | 隐私政策                                               |
| `/terms`     | 服务条款                                               |

静态版明确不提供：账号注册、邮箱验证、登录、会员中心、数据库写入、授权下载、本地客户端唤起和在线支付。

## 技术栈

- Next.js 16 App Router、React 19、TypeScript
- 原生 CSS 设计系统，支持浅色和深色主题
- GSAP 驱动的渐进式页面揭示，包含减弱动效回退
- Vitest、Testing Library 和 Playwright
- Next.js 静态导出与 GitHub Actions Pages 发布
- Formspree 可选静态表单接收，不配置时表单保持禁用

## 本地运行

环境要求：Node.js 24，推荐使用仓库中的 `.nvmrc`。

```powershell
npm ci
npm run dev
```

默认访问 `http://127.0.0.1:3000/`。如果端口已被占用，Next.js 会提示可用端口。

可选环境变量见 `.env.example`：

| 变量                             | 是否必需 | 说明                                                        |
| -------------------------------- | -------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_DEMO_FORM_ENDPOINT` | 否       | Formspree 表单地址，必须以 `https://formspree.io/f/` 开头   |
| `NEXT_PUBLIC_BASE_PATH`          | 否       | GitHub Pages 项目子路径，本地通常留空，发布工作流会自动设置 |

本地启用演示预约时，将 `.env.example` 复制为 `.env.local`，然后填写 Formspree 地址。所有 `NEXT_PUBLIC_*` 变量都会进入浏览器产物，不能存放密钥。

## 常用命令

| 命令                   | 作用                                      |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | 启动本地开发服务器                        |
| `npm run lint`         | ESLint 检查                               |
| `npm run typecheck`    | TypeScript 类型检查                       |
| `npm run format:check` | Prettier 格式检查                         |
| `npm test`             | 运行 Vitest 单元与组件测试                |
| `npm run build`        | 生成静态站点到 `out/`                     |
| `npm run verify`       | 依次执行 Lint、类型、格式、单测和静态构建 |
| `npm run test:e2e`     | 运行 Playwright 桌面与手机端到端测试      |

`npm run verify` 不包含 Playwright。发布前应同时运行：

```powershell
npm run verify
npm run test:e2e
git diff --check
```

若需要复用已启动的预览服务：

```powershell
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3001'
npm run test:e2e
```

## 项目结构

```text
src/app/                     页面、全局样式和路由级测试
src/components/home/         首页各叙事区块
src/components/marketing/    营销子页面公共组件
src/components/site/         页头、页脚、导航和移动菜单
src/components/theme/        浅色/深色主题
src/content/                 中文内容、能力数据和视频注册表
src/config/                  GitHub Pages 子路径工具
public/images/               产品证据、视频封面和微信二维码
public/videos/               公开演示视频
tests/e2e/                   Playwright 视觉与交互回归
docs/                       架构、发布、维护和历史设计记录
```

## 内容与素材

- 全站共享文案和能力矩阵：`src/content/zh-cn.ts`
- 视频状态、封面和地址：`src/content/videos.ts`
- 营销子页面内容：`src/app/(marketing)/`
- 产品截图：`public/images/product-evidence/`
- 微信二维码：`public/images/contact/wechat-nay.webp`
- 核心流程视频：`public/videos/axio-core-task-workflow.mp4`

公开素材必须先去除店铺名、账号、订单、利润、凭证、签名和完整商品记录。详细流程见 `docs/content-maintenance.md`。

## 发布到 GitHub Pages

1. 将 `master` 推送到 GitHub。
2. 在仓库 `Settings > Pages` 中将 Source 设为 `GitHub Actions`。
3. 如需表单，在 `Settings > Secrets and variables > Actions > Variables` 新建 `NEXT_PUBLIC_DEMO_FORM_ENDPOINT`。
4. 推送到 `master`，或手动运行 `Deploy static site to Pages`。

工作流会自动识别用户主页仓库和普通项目仓库，并设置正确的 `basePath`。完整发布、回滚和故障排查见 `docs/operations/github-pages-deployment.md`。

## 分支边界

- `master`：GitHub Pages 静态官网，也是当前发布分支。
- `future/server-features`：已完成的服务端账号、预约持久化、注册和登录基线。
- `wip/member-center`：会员中心 Task 9 的 RED 测试检查点，生产实现未完成。

不要把 Prisma、Auth.js、SMTP 或数据库路由直接合并回静态 `master`。恢复服务端开发前先阅读 `docs/operations/server-features-todo.md`。

## 文档入口

完整索引见 `docs/README.md`。最常用文档：

- `docs/architecture.md`：当前静态架构与运行边界
- `docs/content-maintenance.md`：文案、截图、视频和二维码维护
- `docs/operations/github-pages-deployment.md`：发布、回滚和故障排查
- `docs/operations/free-hosting-options.md`：免费托管方案比较
- `docs/operations/server-features-todo.md`：有服务器后的恢复清单
