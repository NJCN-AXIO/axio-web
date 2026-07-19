# 当前架构

更新日期：2026-07-20

## 1. 架构结论

`master` 是纯静态官网：构建阶段由 Next.js 生成 HTML、CSS、JavaScript 和媒体引用，运行阶段由 GitHub Pages 直接提供文件。访问者浏览网站时没有 AXIO 自建 API、数据库连接或服务端会话。

```text
src/content 与页面组件
          |
          v
Next.js 静态构建（output: export）
          |
          v
out/ 静态产物
          |
          v
GitHub Pages CDN
          |
          +--> 可选：浏览器直接 POST 到 Formspree
```

## 2. 运行边界

当前站点负责：

- 解释 AXIO 面向 Shopee 店群运营的产品定位。
- 展示匿名化产品截图、核心流程视频和能力边界。
- 提供版本方案、隐私政策、服务条款和微信联系。
- 在配置 Formspree 后，从浏览器直接提交演示预约。

当前站点不负责：

- 保存 Shopee、妙手 ERP、1688、浏览器或 AI 服务凭证。
- 执行本地 Windows 自动化任务。
- 注册、登录、邮箱验证、授权下载或客户端唤起。
- 保存表单到 AXIO 自有数据库。
- 在线支付或许可证发放。

## 3. 页面与布局

根布局 `src/app/layout.tsx` 提供统一元数据、主题脚本、主题 Provider、页头和页脚。

首页 `src/app/page.tsx` 按以下顺序组合：

1. 完整控制台 Hero
2. Shopee、妙手 ERP 和精准控价证明条
3. 六阶段经营闭环
4. 核心任务流程视频
5. 四张真实产品证据图
6. 六组能力矩阵
7. 安全与交付边界
8. 全局演示占位
9. 三档版本方案
10. 微信联系与最终 CTA

营销路由位于 `src/app/(marketing)/`。路由组名称不会进入公开 URL。

## 4. 内容模型

`src/content/zh-cn.ts` 是共享中文内容的单一来源，包括：

- 品牌和导航
- Hero 与证明条
- 六阶段经营闭环
- 三档版本方案
- 六组能力矩阵
- 首页说明、CTA 和页脚

`src/content/types.ts` 为内容提供只读类型约束。能力状态只允许 `NOW` 或 `NEXT`，用于区分已交付能力与路线图。

`src/content/videos.ts` 是两个视频位置的单一注册表。`available` 条目必须有媒体地址和时长，`pending` 条目只能展示真实封面，不能渲染损坏的视频源或伪造播放按钮。

## 5. 静态路径处理

GitHub Pages 普通项目仓库部署在 `/<仓库名>/`，用户主页仓库部署在 `/`。`next.config.ts` 同时设置：

- `output: "export"`
- `trailingSlash: true`
- `basePath`
- `assetPrefix`
- `images.unoptimized: true`

`src/config/site-path.ts` 的 `withBasePath()` 负责给图片、视频和二维码等根相对资源补上项目子路径。新增公开媒体时不得绕开该工具。

发布工作流根据仓库名称自动设置 `NEXT_PUBLIC_BASE_PATH`，本地开发通常保持为空。

## 6. 客户端交互

只有需要浏览器状态的部分使用客户端组件：

- 主题切换和本地持久化
- 当前路由或锚点的导航高亮
- 移动菜单、焦点陷阱和背景隔离
- GSAP 页面揭示

导航通过 `aria-current="page"` 标记当前路由，通过 `aria-current="location"` 标记首页能力矩阵锚点。桌面和手机菜单共享 `ActiveNavigation`，避免状态漂移。

## 7. 表单数据流

`src/components/marketing/demo-form.tsx` 只接受以 `https://formspree.io/f/` 开头的公开端点。

- 已配置：浏览器使用标准 HTML POST 直接提交到 Formspree。
- 未配置：所有字段和提交按钮禁用，页面仍提供微信二维码。
- 端点是公开浏览器配置，不是密钥。

如需自有数据持久化、邮件通知或反滥用策略，必须恢复服务端运行时，不能在 GitHub Pages 中实现。

## 8. 主题与响应式

颜色由 `src/app/globals.css` 中的语义变量统一控制。首次访问为浅色模式，手动选择保存在 `localStorage` 的 `axio-theme`。

首页响应式样式位于 `src/app/home.css`：

- 宽屏优先，真实产品证据是首屏主视觉。
- 经营闭环在宽屏为 3×2，中屏为 2×3，手机为单列。
- 产品截图始终完整展示并提供高清原图链接。
- 右侧章节轨道只在宽屏显示。
- 所有交互遵守 44px 触控目标和减弱动效设置。

## 9. 测试边界

Vitest 覆盖内容合同、主题、导航、表单、视频和静态部署配置。Playwright 覆盖：

- 2048px、1440px 和手机布局
- Hero 完整产品图
- 四张产品证据图的可读宽度
- 黑边、装饰线、溢出和 CTA 对比度
- 微信二维码尺寸
- 路由与锚点持久高亮
- 六阶段流程矩阵响应式布局

`npm run verify` 负责静态质量门；`npm run test:e2e` 单独负责浏览器回归。

## 10. 未来服务端

服务端基线保存在 `future/server-features`，会员中心测试检查点保存在 `wip/member-center`。恢复时应新建部署分支并重新选择托管、数据库、SMTP、对象存储和密钥管理方案。

当前架构与未来服务端架构之间的边界，以 `docs/operations/server-features-todo.md` 为准。
