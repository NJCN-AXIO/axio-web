import type { CapabilityGroup, SiteContent } from "./types";

export const capabilityGroups = [
  {
    id: "supervisor",
    title: "AI 主管与执行编排",
    items: [
      { label: "容量、数据新鲜度与风险证据分析", status: "NOW" },
      { label: "目标拆解、前置条件与验收标准", status: "NOW" },
      { label: "独立脚本、AI 主管与外部 Agent 三种编排", status: "NOW" },
      { label: "逐项开放高风险受控执行权限", status: "NEXT" },
    ],
  },
  {
    id: "discovery",
    title: "四平台选品与关键词增长",
    items: [
      { label: "Shopee、Temu、TikTok、Amazon 市场信号入口", status: "NOW" },
      { label: "买家搜索词与供应链找品词双向补全", status: "NOW" },
      { label: "蓝海评分、健康状态与审核复用", status: "NOW" },
      { label: "四平台具体商品预览、证据门与精确货源", status: "NOW" },
    ],
  },
  {
    id: "tasks",
    title: "自然语言任务与精准定价",
    items: [
      { label: "一句话拆解商品、数量、站点、店群与策略", status: "NOW" },
      { label: "多来源采集与可编辑任务参数", status: "NOW" },
      { label: "自动匹配、指定店铺与 P0/P1/P2 筛选", status: "NOW" },
      { label: "六站点成本、费率、物流、折扣与利润反算", status: "NOW" },
    ],
  },
  {
    id: "operations",
    title: "上架与存量 Listing 经营",
    items: [
      { label: "多站点上架、容量分配与黄金时段批次", status: "NOW" },
      { label: "批量改价、亏损预览与 Listing 优化", status: "NOW" },
      { label: "滞销清理保护、商品分类与营销证据门", status: "NOW" },
    ],
  },
  {
    id: "identity",
    title: "图片、SKU 身份与风险证据",
    items: [
      { label: "主图与 SKU 图安全预览", status: "NOW" },
      { label: "1024 方图、身份绑定、哈希与顺序校验", status: "NOW" },
      { label: "品牌、危险词、款式、图片风险与业务回读", status: "NOW" },
      { label: "AI 营销场景图", status: "NEXT" },
      { label: "生产平台图片写回", status: "NEXT" },
    ],
  },
  {
    id: "matrix",
    title: "矩阵运营与私有化交付",
    items: [
      { label: "G1/G2 分组与六站点运营", status: "NOW" },
      { label: "116 店矩阵经营证据", status: "NOW" },
      { label: "本地 Windows 客户端", status: "NOW" },
      { label: "源码交付与私有化部署", status: "NOW" },
    ],
  },
] as const satisfies readonly CapabilityGroup[];

export const zhCN: SiteContent = {
  brand: { name: "AXIO 智核", subtitle: "跨境电商店群全自动化运营系统" },
  navigation: [
    { label: "产品能力", href: "/product" },
    { label: "解决方案", href: "/solutions" },
    { label: "能力矩阵", href: "/#capabilities" },
    { label: "版本方案", href: "/pricing" },
    { label: "预约演示", href: "/demo" },
    { label: "登录", href: "/login" },
  ],
  hero: {
    title: "AXIO 智核",
    subtitle: "跨境电商店群全自动化运营系统",
    description:
      "从市场信号到店群执行，把选品、定价、上架与存量经营编排成可预览、可确认、可回读的运营闭环。",
    primaryCta: { label: "预约产品演示", href: "/demo" },
    secondaryCta: { label: "查看产品能力", href: "#capabilities" },
  },
  proofValues: [
    { value: "116 家店铺", label: "匿名化矩阵经营证据" },
    { value: "6 个 Shopee 站点", label: "统一成本与运营口径" },
    { value: "4 个市场信号平台", label: "覆盖多源选品入口" },
  ],
  operatingLoop: [
    "市场信号",
    "关键词与商品",
    "任务与定价",
    "预览与确认",
    "脚本执行",
    "结果回读",
  ],
  packages: [
    {
      name: "Starter",
      audience: "起步与小型店群",
      description: "建立标准化选品、定价与上架流程，从可核验的运营闭环开始。",
    },
    {
      name: "Professional",
      audience: "成长型多站点团队",
      description: "面向 10 至 200 店规模，统一店群编排、风险控制与经营回读。",
    },
    {
      name: "Enterprise",
      audience: "组织级与私有化场景",
      description: "支持源码交付、私有化部署与按业务边界规划的能力接入。",
    },
  ],
  capabilityGroups,
  footer: {
    boundary: "本地 Windows 客户端执行，敏感凭证留在客户环境",
    links: [
      { label: "隐私政策", href: "/privacy" },
      { label: "服务条款", href: "/terms" },
      { label: "预约演示", href: "/demo" },
    ],
    copyright: "AXIO 智核",
  },
};
