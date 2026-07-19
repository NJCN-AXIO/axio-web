# 免费托管方案建议

更新日期：2026-07-19。免费额度会变化，启用前应再次核对官方页面。

## 当前推荐

使用 GitHub Pages 托管官网，Formspree 接收演示预约。这套组合不需要服务器，维护量最低。

Formspree 免费账户当前提供每月 50 次提交、2 个通知邮箱和 30 天提交历史：
https://help.formspree.io/articles/account-management/account-limits

## 后续需要账号与数据库时

优先考虑 Supabase Free。它把 PostgreSQL、认证和管理界面放在一起，当前免费额度包括 50,000 MAU 和 500 MB 数据库：
https://supabase.com/pricing

代价是现有 Prisma/Auth.js 代码需要适配或迁移，不能原样部署到 GitHub Pages。

## 边缘运行时备选

Cloudflare Workers Free 当前提供每天 100,000 次请求、每次 10 ms CPU 和 128 MB 内存：
https://developers.cloudflare.com/workers/platform/limits/

它适合低流量 API，并可结合 Pages 和 D1；但现有 Next.js、Prisma、Node 邮件方案需要针对边缘运行时改造。

## 保留现有后端代码的最低改造路线

若希望直接使用现有 Prisma/Auth.js 实现，应选择支持常驻 Node.js 和外部 PostgreSQL 的平台，例如 Render、Railway、Fly.io 或 VPS。它们的免费政策变化较频繁，因此不在仓库内承诺具体额度。正式选择前要确认休眠、出站邮件、持久磁盘、流量和数据库备份限制。
