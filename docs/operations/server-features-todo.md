# 有服务器后继续的待办清单

更新日期：2026-07-19

## 当前发布边界

`master` 只发布 GitHub Pages 静态官网。当前不提供账号注册、邮箱验证、登录、会员中心、授权下载、数据库写入或本地客户端启动接口。

演示预约只在配置 `NEXT_PUBLIC_DEMO_FORM_ENDPOINT` 后提交到 Formspree；未配置时不会提交个人信息。

## 已完成并保存在 Git 中

- Task 5，账号数据模型与安全基础：`1773c05`
- Task 6，演示预约持久化：`3b07477`
- Task 7，邮箱验证注册：`b8dd111`
- Task 8，签名 JWT 登录：`a24e7cf`
- Task 9 RED 测试检查点：`0dadae6`
- 完整后端基线分支：`future/server-features`
- 会员中心继续开发分支：`wip/member-center`

## 恢复服务端前置条件

- 一台可持续运行 Node.js 24 的主机，或一个兼容 Next.js 服务器运行时的平台
- 外部 PostgreSQL 数据库和独立的测试数据库
- SMTP 发信账户与已验证发件域名
- HTTPS 正式域名、`AUTH_SECRET` 和准确的应用基础 URL
- 用于安装包的 S3 兼容对象存储及固定下载域名
- GitHub Secrets 或托管平台密钥管理，严禁把密钥提交到仓库

## 后续任务

- [ ] 从 `future/server-features` 新建服务端部署分支，不要在静态 `master` 上直接恢复动态路由
- [ ] Task 9：实现受保护的会员中心、许可证状态和授权下载
- [ ] Task 10：实现受功能开关控制的客户端启动码和登录后支持请求
- [ ] Task 11：补齐敏感内容、内部链接、SEO、无障碍和浏览器端质量门
- [ ] Task 11：使用一次性 `TEST_DATABASE_URL` 运行注册、登录、授权和重放防护测试
- [ ] Task 12：编写数据库迁移、SMTP、对象存储、发布、回滚和密钥轮换手册
- [ ] 正式上线前完成威胁建模、备份恢复演练、速率限制验证和邮件送达测试
- [ ] 决定是继续现有 Prisma/Auth.js 架构，还是迁移到 Supabase/Cloudflare

## 恢复方式

```powershell
git switch future/server-features
git switch -c deploy/server-runtime
```

若继续 Task 9：

```powershell
git switch wip/member-center
npm test -- src/server/member "src/app/(member)"
```

Task 9 分支当前预期为 RED，因为只提交了授权策略、账户布局和下载页测试，生产实现尚未创建。
