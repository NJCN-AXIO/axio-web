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
    title: "多平台市场信号与关键词增长",
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
      { label: "多站点成本、费率、物流、折扣与利润反算", status: "NOW" },
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
      { label: "店群分组与多站点运营", status: "NOW" },
      { label: "店群矩阵经营与结果回读", status: "NOW" },
      { label: "本地 Windows 客户端", status: "NOW" },
      { label: "源码交付与私有化部署", status: "NOW" },
    ],
  },
] as const satisfies readonly CapabilityGroup[];

export const zhCN: SiteContent = {
  brand: { name: "AXIO 智核", subtitle: "Shopee 店群全自动化运营系统" },
  navigation: [
    { label: "产品能力", href: "/product" },
    { label: "解决方案", href: "/solutions" },
    { label: "能力矩阵", href: "/#capabilities" },
    { label: "版本方案", href: "/pricing" },
  ],
  hero: {
    title: "AXIO 智核",
    subtitle: "面向 Shopee 的跨境电商店群全自动化运营系统",
    description:
      "主要服务于 Shopee 平台，并借助妙手 ERP 承接批量执行，将选品、精准定价、上架与存量经营编排成可预览、可确认、可回读的自动化闭环。",
    primaryCta: { label: "预约产品演示", href: "/demo" },
    secondaryCta: { label: "查看产品能力", href: "#capabilities" },
  },
  proofValues: [
    { value: "Shopee 店群运营", label: "主要服务平台与经营场景" },
    { value: "妙手 ERP 协同", label: "承接批量上架与运营执行" },
    { value: "自动化精准控价", label: "透明公式驱动批量控价" },
  ],
  operatingLoop: [
    {
      title: "市场信号",
      detail:
        "汇总 Shopee 经营数据与多平台趋势，识别需求变化、竞争强度与供给机会。",
    },
    {
      title: "关键词与商品",
      detail: "把买家搜索词映射为供应链找品词，沉淀可追溯、可复核的商品候选。",
    },
    {
      title: "任务与定价",
      detail:
        "将站点、店铺、数量和运营策略拆成任务参数，并按成本公式反算目标售价。",
    },
    {
      title: "预览与确认",
      detail:
        "集中校验图片、SKU、风险词和利润边界，高风险写入在执行前人工确认。",
    },
    {
      title: "脚本执行",
      detail:
        "借助妙手 ERP 与受控脚本批量上架、改价和优化，过程持续记录任务状态。",
    },
    {
      title: "结果回读",
      detail:
        "回收执行结果、异常和经营数据，形成下一轮选品、定价与库存处理依据。",
    },
  ],
  packages: [
    {
      name: "Starter",
      audience: "起步与小型店群",
      description: "建立标准化选品、定价与上架流程，从可核验的运营闭环开始。",
      regularPrice: "¥999",
      launchPrice: "¥399",
      launchLabel: "首发价",
      delivery: "标准客户端与基础流程，自助使用",
      featured: false,
    },
    {
      name: "Professional",
      audience: "成长型 Shopee 团队",
      description: "完整自动化、精准控价、风险管控与标准支持。",
      regularPrice: "¥1,999",
      launchPrice: "¥699",
      launchLabel: "首发 20 席",
      delivery: "完整运营闭环与标准支持",
      featured: true,
    },
    {
      name: "Team",
      audience: "多角色协作团队",
      description: "面向团队使用，提供优先支持与有限规则配置。",
      regularPrice: "¥4,999",
      launchPrice: "¥1,999",
      launchLabel: "首发价",
      delivery: "团队使用、优先支持与有限规则配置",
      featured: false,
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
        label: "透明公式批量精准控价",
        detail:
          "逐项反算站点费率、汇率、运费与目标利润，应用于自动化系统批量精准控价",
        iconKey: "pricing",
      },
      {
        label: "违禁管控",
        detail: "高危品牌、危险关键词、安全替换与款式风险集中治理",
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
    packagesTitle: "首发版本方案",
    packagesDescription:
      "先从可验证的标准流程开始，再按团队协作与交付边界扩展。",
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
