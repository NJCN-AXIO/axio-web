# AXIO 官网文档索引

本目录区分“当前实现文档”和“历史设计记录”。开发与发布应优先以当前实现文档、源码和自动化测试为准。

## 当前实现

| 文档                                                                                           | 用途                                   |
| ---------------------------------------------------------------------------------------------- | -------------------------------------- |
| [`../README.md`](../README.md)                                                                 | 项目入口、运行命令、范围和目录结构     |
| [`architecture.md`](architecture.md)                                                           | 当前 `master` 的静态架构、数据流和边界 |
| [`content-maintenance.md`](content-maintenance.md)                                             | 文案、能力矩阵、截图、视频和二维码维护 |
| [`operations/github-pages-deployment.md`](operations/github-pages-deployment.md)               | GitHub Pages 配置、发布、回滚和排障    |
| [`operations/free-hosting-options.md`](operations/free-hosting-options.md)                     | 免费托管与未来后端平台选择             |
| [`operations/server-features-todo.md`](operations/server-features-todo.md)                     | 有服务器后的服务端恢复清单             |
| [`research/2026-07-20-axio-pricing-research.md`](research/2026-07-20-axio-pricing-research.md) | AXIO 市场价格证据、试销区间与报价规则  |

## 当前设计依据

| 文档                                                                                                                                           | 状态                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| [`superpowers/specs/2026-07-19-axio-product-evidence-gallery-design.md`](superpowers/specs/2026-07-19-axio-product-evidence-gallery-design.md) | 当前首页产品证据、微信联系和后续定位迭代 |

## 历史记录

`docs/superpowers/plans/` 保存实施过程，`docs/superpowers/specs/` 中标记为 Historical 或 Superseded 的文件只用于追溯决策，不代表当前发布范围。

特别注意：

- 早期官网设计包含注册、登录、会员中心和数据库，这些能力已从静态 `master` 移出。
- 早期首页 Hero 使用 Canvas 或窄幅任务图，当前 Hero 已改为完整控制台产品证据。
- 当前产品定位主要服务于 Shopee，并借助妙手 ERP 承接批量执行。
- 店铺数量、站点数量和市场平台数量属于历史样例数据，不作为官网固定宣传指标。
