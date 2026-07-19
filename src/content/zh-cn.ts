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
  home: {
    loopTitle: "从经营意图到业务回读",
    loopDescription:
      "任务不是一次性的黑盒动作。AXIO 将每一步拆成可见的输入、判断、执行与结果证据。",
    evidenceTitle: "真实流程，围绕经营证据展开",
    evidenceDescription:
      "所有公开能力来自现有 AXIO 工作流。店铺身份、订单、利润与平台凭证不会进入官网。",
    evidenceItems: [
      {
        label: "AI 主管",
        detail: "容量、任务目标与验收标准",
        iconKey: "supervisor",
      },
      {
        label: "自然语言任务",
        detail: "商品来源、站点与店铺范围",
        iconKey: "collection",
      },
      {
        label: "六站点定价",
        detail: "成本、费率、物流与利润反算",
        iconKey: "pricing",
      },
      {
        label: "风险证据",
        detail: "品牌、图片与业务结果回读",
        iconKey: "risk",
      },
    ],
    capabilitiesTitle: "一套系统，覆盖店群运营关键链路",
    capabilitiesDescription:
      "当前能力与后续规划逐项标注，避免把路线图包装成已交付功能。",
    safetyTitle: "自动化有边界，执行有证据",
    safetyDescription:
      "确定性脚本负责稳定执行，高风险动作保留预览与确认，结果通过业务数据回读。",
    safetyPoints: [
      {
        title: "受控执行",
        description: "从参数预览到任务确认，关键写入保留清晰的人机边界。",
      },
      {
        title: "本地凭证",
        description:
          "Windows 客户端在卖家环境执行，平台凭证与浏览器配置不上传官网。",
      },
      {
        title: "灵活交付",
        description: "支持标准客户端、源码交付以及按组织边界规划的私有化部署。",
      },
    ],
    packagesTitle: "按经营阶段选择交付方式",
    packagesDescription:
      "从建立标准流程到组织级私有化，以实际店群规模和协作边界确定方案。",
    finalTitle: "把重复运营，变成可验证的系统流程",
    finalDescription:
      "预约演示，结合你的站点、店铺规模与团队协作方式查看适配路径。",
  },
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
