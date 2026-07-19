# AXIO 智核官网

当前 `master` 是面向 GitHub Pages 的纯静态官网。它包含首页、产品能力、解决方案、版本方案、演示预约、隐私政策和服务条款，不需要数据库或 Node.js 服务器。

## 本地运行

需要 Node.js 24。

```powershell
npm ci
npm run dev
```

完整检查：

```powershell
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
```

静态输出位于 `out/`。

## 发布到 GitHub Pages

1. 将 `master` 推送到 GitHub 仓库。
2. 在仓库 `Settings > Pages` 中把 Source 设为 `GitHub Actions`。
3. 推送到 `master`，或手动运行 `Deploy static site to Pages` 工作流。
4. 普通项目仓库会自动使用 `/<仓库名>` 子路径；`<用户名>.github.io` 仓库会使用根路径。

部署工作流位于 `.github/workflows/deploy-pages.yml`。

## 演示预约

GitHub Pages 不能接收或存储表单。当前静态版支持把预约直接提交到 Formspree：

1. 在 Formspree 创建表单。
2. 在 GitHub 仓库 `Settings > Secrets and variables > Actions > Variables` 新建变量 `NEXT_PUBLIC_DEMO_FORM_ENDPOINT`。
3. 值应类似 `https://formspree.io/f/xxxxxxxx`。
4. 重新运行 Pages 工作流。

未配置该变量时，预约按钮会显示“预约通道配置中”并保持禁用，不会把访客信息发往不存在的接口。

## 服务端功能

数据库、邮件注册、邮箱验证和 JWT 登录已保存在 `future/server-features` 分支。Task 9 的测试检查点位于 `wip/member-center`。后续工作见 `docs/operations/server-features-todo.md`。
