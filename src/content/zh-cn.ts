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
    { label: "下载中心", href: "/download" },
  ],
  hero: {
    title: "AXIO 智核",
    subtitle: "面向 Shopee 的跨境电商店群全自动化运营系统",
    description:
      "主要服务于 Shopee 平台，并借助妙手 ERP 承接批量执行，将选品、精准定价、上架与存量经营编排成可预览、可确认、可回读的自动化闭环。",
    primaryCta: { label: "在线体验", href: "/preview/" },
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
      chineseName: "启航版",
      audience: "起步与小型店群",
      description: "建立标准化选品、定价与上架流程，从可核验的运营闭环开始。",
      annualPrice: "¥999",
      launchPrice: "¥399",
      launchLabel: "首发价",
      delivery: "标准客户端与基础流程，自助使用",
      featured: false,
    },
    {
      name: "Professional",
      chineseName: "专业版",
      audience: "成长型 Shopee 团队",
      description: "完整自动化、精准控价、风险管控与标准支持。",
      annualPrice: "¥1,999",
      launchPrice: "¥699",
      launchLabel: "首发 20 席",
      delivery: "完整运营闭环与标准支持",
      featured: true,
    },
    {
      name: "Team",
      chineseName: "团队版",
      audience: "多角色协作团队",
      description: "面向团队使用，提供优先支持与有限规则配置。",
      annualPrice: "¥4,999",
      launchPrice: "¥1,999",
      launchLabel: "首发价",
      delivery: "团队使用、优先支持与有限规则配置",
      featured: false,
    },
  ],
  publicRelease: {
    releaseVersion: "待发布",
    releaseDate: "待发布",
    downloadUrl: "",
    downloadLabel: "下载 AXIO 客户端",
    sha256: "待发布",
    fileSize: "待发布",
    releaseNotes: "正式客户 ZIP 尚未发布。",
    templateUrl: "/downloads/templates/stores.csv",
    manualUrl: "/downloads/manual/customer-installation.md",
  },
  faqGroups: [
    {
      id: "product",
      title: "产品、套餐与能力边界",
      items: [
        {
          question: "AXIO 是什么，与妙手 ERP 是什么关系？",
          answer:
            "AXIO 负责把选品、任务、定价、风险检查和结果回读组织成可验证流程；妙手 ERP 承接部分平台批量执行。任务显示完成不等于平台写入成功，仍需以平台或妙手的权威回读为准。",
          priority: true,
        },
        {
          question: "AXIO 是本地软件还是 SaaS，是否需要服务器和域名？",
          answer:
            "第一阶段是 Windows 本地客户端，不要求客户自建服务器或域名。官网只是静态信息与下载入口；已安装客户端和有效离线许可不依赖官网持续在线。",
          priority: true,
        },
        {
          question: "启航版、专业版和团队版如何选择？",
          answer:
            "启航版适合最多 10 店的起步场景，专业版面向最多 50 店并提供完整核心能力，团队版面向最多 200 店、3 席位和更高并发。Professional 专业版是唯一公开主推；Trial 仅限邀请，Private Enterprise 按独立范围报价。",
          priority: true,
        },
        {
          question: "目前支持哪些平台，是否保证经营结果？",
          answer:
            "当前以 Shopee 和妙手 ERP 协同为主，其他平台能力以页面明确标注和实际验收为准。AXIO 不保证盈利、流量、订单量或平台权重，也不承诺绕过平台规则或无条件 7×24 小时运行。",
          priority: false,
        },
        {
          question: "客户版是否包含 ACCIO 或 Founder 的运营能力？",
          answer:
            "不包含。通用客户包不提供 Founder ACCIO、跨客户总控、Founder 记忆、跨客户调度或内部治理入口；客户本地 AI 主管只能处理客户自己的本地授权数据。",
          priority: false,
        },
        {
          question: "是否能完全替代人工并无条件 7×24 小时运行？",
          answer:
            "Starter、Professional、Team 都保留人工确认和平台回读，不能替代所有人工，也不保证无条件 7×24 小时运行。客户负责登录、验证码和高风险确认；系统遇到依赖缺失会暂停并给出恢复步骤，AXIO 不承诺平台连续可用或经营结果。",
          priority: false,
        },
        {
          question: "试用版有哪些限制，能否执行平台写入？",
          answer:
            "Trial 只对受邀客户开放 7 天、最多 3 店和 6 站点，默认用于只读分析与规划，不提供不受控的平台写入。客户按邀请步骤完成环境检查，系统会限制额度并在到期后只读；需要继续使用时按套餐购买和许可流程恢复。",
          priority: false,
        },
        {
          question: "店铺、站点、并发和团队席位如何计算？",
          answer:
            "Starter 为最多 10 店、6 站点、并发 1；Professional 为最多 50 店、6 站点、并发 3；Team 为最多 200 店、12 站点、3 席位、并发 10。客户按合同导入并分配额度，系统在任务排队前校验上限；超限不会偷偷执行，升级或调整需重新签发许可。",
          priority: false,
        },
        {
          question: "能否中途升级，升级是否保留数据？",
          answer:
            "可以按销售确认升级套餐，旧版本客户数据、备份和浏览器登录状态仍在客户本地，不因升级自动删除。客户先备份并导入新许可，系统重新校验额度；许可或迁移失败时保持旧权益和只读状态，联系 AXIO 后再恢复。",
          priority: false,
        },
        {
          question: "定制部署和源码交付包含什么，为什么单独报价？",
          answer:
            "Private Enterprise 从 ¥6,800 起，具体私有部署、源码交付、实施和支持范围按独立合同确认，不等同于公开三档套餐。客户先提供边界和合规要求，AXIO 评估交付；未签署的范围、平台结果和第三方费用不作保证，范围变更需重新报价。",
          priority: false,
        },
      ],
    },
    {
      id: "installation",
      title: "安装、浏览器与首次启动",
      items: [
        {
          question: "支持哪些系统，需要安装 Python、Chrome 和 VC++ 吗？",
          answer:
            "第一阶段支持 Windows 10/11 x64，需要客户已安装 Chrome 和 VC++ 2015–2022 运行库，不需要安装 Python。macOS、Linux 和 Edge 不属于当前正式验收范围。",
          priority: true,
        },
        {
          question: "是否需要发送店铺密码，登录过期或出现验证码怎么办？",
          answer:
            "不需要也不应发送店铺密码、Cookie 或浏览器 Profile。客户在自己的 Chrome 中登录；登录过期或出现验证码时，相关任务暂停并等待客户处理，不复用其他客户或 Founder 的浏览器资料。",
          priority: true,
        },
        {
          question: "为什么首次安装需要管理员权限，能否在 ZIP 中直接运行？",
          answer:
            "管理员权限仅用于安装公钥、创建受控目录和设置必要 ACL。应先校验并解压到独立版本目录，再按安装手册启动；不要在 ZIP、移动硬盘、下载缓存或临时目录中直接运行。",
          priority: true,
        },
        {
          question: "端口占用、Chrome 未打开、插件缺失或杀毒软件告警怎么办？",
          answer:
            "先按健康检查显示的中文步骤修复端口、Chrome、妙手插件或运行库问题。杀毒软件告警应核对签名和 SHA-256 后再联系支持，不应关闭安全软件或绕过完整性检查。",
          priority: false,
        },
        {
          question: "如何使用 SHA-256 和发布签名验证下载文件？",
          answer:
            "只核对官网当前版本卡列出的文件名、大小和 SHA-256，并验证发布签名。任一项不一致都停止安装、保留文件并联系 AXIO；不要从转发群或未知镜像获取客户包。",
          priority: false,
        },
        {
          question: "能否在 ZIP、移动硬盘或临时目录中直接运行？",
          answer:
            "不建议在 ZIP、移动硬盘、下载缓存或临时目录直接运行；Starter、Professional、Team 都应解压到稳定的独立版本目录。客户按手册完成权限和路径检查，系统会拒绝不完整或不可写目录；遇到路径问题先移到固定目录并重新健康检查。",
          priority: false,
        },
        {
          question: "首次安装需要管理员权限和 Install-AXIO.cmd 吗？",
          answer:
            "需要时管理员权限只用于安装公钥、创建受控目录和 ACL，Install-AXIO.cmd 负责按发布清单初始化，不会替客户安装未知软件。客户应核对签名后以管理员运行一次；若权限被策略阻止，保留错误码并联系 AXIO，不要绕过安全门。",
          priority: false,
        },
      ],
    },
    {
      id: "data",
      title: "数据导入、隐私与迁移",
      items: [
        {
          question: "如何导入店铺、商品、类目、关键词和定价参数？",
          answer:
            "使用官网提供的五类空白 CSV 模板。每批导入都经过预览、校验、确认、写入四阶段；缺失、重复、冲突、负成本、低于成本或跨店绑定错误的行失败关闭，并生成修复报告。",
          priority: true,
        },
        {
          question: "客户数据保存在哪里，会上传到官网吗？",
          answer:
            "客户配置、数据库、日志、证据和备份保存在客户 Windows 用户自己的本地数据目录。默认不会向 AXIO 官网或 Founder 电脑上传客户业务数据；只有客户明确调用第三方 Provider 时，才发送完成该次任务所需的最小内容。",
          priority: true,
        },
        {
          question: "如何备份、恢复和迁移到新版本或新电脑？",
          answer:
            "升级或设备迁移前先生成可验证备份，再在新目录执行迁移和健康检查。迁移失败保留旧版本和原备份，不覆盖唯一副本；设备迁移还需要按许可流程重新绑定。",
          priority: true,
        },
        {
          question: "客户之间如何隔离，卸载或授权到期会删除数据吗？",
          answer:
            "每个 Windows 用户和客户许可只访问自己的本地数据，客户之间不共享数据库、浏览器 Profile 或 API 配置。卸载版本目录或授权到期不会自动删除客户数据；受保护功能会停止或进入只读。",
          priority: false,
        },
        {
          question: "如何生成安全的诊断信息给客服？",
          answer:
            "优先使用脱敏诊断包，只包含版本、健康状态、错误码和发布清单摘要。界面错误摘要最多 300 字符且已经脱敏，不包含 API Key、Cookie、密码、安装码原文或完整业务数据。",
          priority: false,
        },
        {
          question: "Excel 与 CSV 如何选择，重复或错误数据如何处理？",
          answer:
            "官方空白模板以 CSV 为首日通用入口，客户也可先从 Excel 导出为 UTF-8 CSV 并检查编码。系统会在预览阶段标记缺失、重复、编码、站点币种冲突和非法成本，不写入失败行；客户修复报告后重新导入，AXIO 不保证第三方导出格式永远兼容。",
          priority: false,
        },
        {
          question: "是否支持妙手/Shopee 导出文件和分批导入？",
          answer:
            "Starter、Professional、Team 均可按字段映射导入客户自己的妙手或 Shopee 导出文件，建议分批预览和确认。系统只写入客户确认的有效行并保留错误报告；字段变化或平台限制导致无法映射时停止该批次，客户按模板补齐后再试。",
          priority: false,
        },
        {
          question: "如何备份、恢复、迁移并生成脱敏诊断包？",
          answer:
            "升级、换机或迁移前由客户在本地生成可验证备份，系统执行预览、校验和恢复，不覆盖唯一副本。诊断包仅含版本、健康状态、错误码和发布摘要，界面摘要最多 300 字符且已脱敏；恢复失败保留旧备份，联系 AXIO 前不要发送业务数据库。",
          priority: false,
        },
      ],
    },
    {
      id: "automation",
      title: "API、自动化、定价与利润",
      items: [
        {
          question: "AXIO 是否自带 API Key，没有 Key 能否使用？",
          answer:
            "AXIO 不自带或共享 API Key，Provider 账号、Key、额度和账单由客户自行管理。没有 Key 时，确定性的导入、校验、计划和非 AI 功能可以继续，依赖文本或视觉模型的任务保持不可用。",
          priority: true,
        },
        {
          question: "如何配置 Provider、Base URL、Model 和文本/视觉能力？",
          answer:
            "客户在本地配置 Provider、HTTPS Base URL、Model、Key 以及文本/视觉能力并逐项测试；可按产品支持范围配置备用路由或本地模型。API Key 只保存在客户本地凭据存储，官网和客服不能读取。",
          priority: true,
        },
        {
          question: "任务显示完成是否等于平台成功，未知写入为什么不重试？",
          answer:
            "不等于。平台写入结果未知时不会自动重试，因为重复提交可能造成重复上架、重复改价或重复营销；系统冻结对应任务，先只读对账并获取权威回读，再由客户决定恢复路径。",
          priority: true,
        },
        {
          question: "AI 生成的标题、描述、类目和价格一定准确吗？",
          answer:
            "不一定。AI 输出必须经过字段校验、风险门和必要的人工确认；高风险写入按能力逐项释放。余额不足、权限错误或视觉测试失败时只停止依赖该 Provider 的任务，不伪装成功。",
          priority: false,
        },
        {
          question:
            "理论利润与妙手结算净利润有何区别，缺少成本时能否自动改价？",
          answer:
            "定价至少需要采购成本、境内运费、国际物流、平台费、汇率、目标利润和尾数规则；缺少关键成本时不自动改价。理论利润不等于妙手已结算净利润，后者必须注明结算周期，并以妙手权威结算数据为准。",
          priority: false,
        },
        {
          question: "能否配置多个 Provider、备用路由、本地模型或私有 API？",
          answer:
            "Professional、Team 按已验收能力可配置多个 Provider、备用路由或客户私有 API，本地模型需满足兼容性要求；Starter 以基础配置为准。客户在本地填写 HTTPS 地址并逐项测试，系统隔离失败 Provider，不把请求转发给 AXIO；兼容性或第三方服务费用不作保证，失败时回到确定性流程。",
          priority: false,
        },
        {
          question: "API 余额不足、权限错误或视觉测试失败怎么办？",
          answer:
            "客户先在所选 Provider 检查余额、权限、模型和视觉能力，系统只停止依赖该 Provider 的任务，确定性导入和校验继续。API Key 保存在客户本地，官网和客服无法读取；修正配置后重新测试，未知写入仍需权威回读，不自动重试。",
          priority: false,
        },
        {
          question: "是否支持每日上新、分类、改价、营销、清理和商品优化？",
          answer:
            "能力以套餐、平台和当前验收清单为准，客户可在本地规划上新、分类、改价、营销、清理或优化任务。系统先检查额度、风险和前置条件，再按确认范围执行；不保证平台接口、流量或订单结果，阻塞时保留任务状态和恢复步骤。",
          priority: false,
        },
        {
          question: "为什么高风险操作需要确认或逐能力释放？",
          answer:
            "所有公开套餐都对批量写入、改价、营销和清理保留预览、风险门和人工确认，Team 也不会绕过这一边界。客户确认参数后系统才写入并等待回读；缺少证据或结果未知时进入只读，不以界面完成提示代替平台成功。",
          priority: false,
        },
        {
          question: "如何限制店铺、任务数量、并发、每日额度和自动化能力？",
          answer:
            "许可把店铺、站点、席位、并发和每日能力额度投影到本地客户端；客户可在任务范围中进一步选择店铺和数量。系统在排队和执行前拒绝超限，不通过官网上传数据或静默扩容；需要提高上限时按升级/续期流程重新授权。",
          priority: false,
        },
        {
          question: "缺少成本时能否自动改价？",
          answer:
            "不能。定价任务至少需要采购、运费、物流、平台费、汇率、目标利润和尾数规则；客户补齐并确认后系统才计算。缺失或冲突字段会失败关闭并生成修复提示，不保证理论利润等于妙手结算净利润，恢复路径是修正数据后重新预览。",
          priority: false,
        },
      ],
    },
    {
      id: "license",
      title: "授权、更新、费用与支持",
      items: [
        {
          question: "如何获取安装码并导入 .axlic，一个授权能用几台电脑？",
          answer:
            "客户在本机复制安装码，由 AXIO 按合同签发设备绑定的 .axlic，再在本地导入；官网不公开分发许可。设备数量以套餐和合同为准，不得复制许可到未授权设备。",
          priority: true,
        },
        {
          question: "更换设备、授权到期、许可丢失或系统时间异常怎么办？",
          answer:
            "设备更换应先备份并申请迁移许可；授权到期、许可无效或系统时间异常时，受保护写入停止或进入只读，客户数据和备份仍保留。恢复许可后再运行健康检查，不绕过授权门。",
          priority: true,
        },
        {
          question: "更新是否覆盖数据，升级失败如何回滚？",
          answer:
            "新旧版本并排安装，客户数据位于版本目录之外。升级前备份，迁移和健康检查通过后才切换；失败则继续使用旧版本和备份，不删除旧目录，也不把未知迁移状态宣称为成功。",
          priority: true,
        },
        {
          question: "哪些第三方费用包含在套餐内，售后如何划分？",
          answer:
            "妙手 ERP、Shopee、模型/API、代理、电脑和网盘费用不包含在 AXIO 套餐内。AXIO 负责已确认的软件范围、安装说明和可复现缺陷；平台、妙手、网络、Provider 或客户设备问题按对应服务方和套餐支持范围处理。",
          priority: false,
        },
        {
          question: "电脑休眠、关机、断网或浏览器关闭后会怎样？",
          answer:
            "依赖本机或浏览器的任务会暂停或失败关闭，不会在官网服务器上继续运行。恢复电源、网络、Chrome 和登录状态后先做健康检查与只读对账，再继续确定未执行的任务。",
          priority: false,
        },
        {
          question: "如何查看和下载最新版，网盘链接失效怎么办？",
          answer:
            "客户只使用官网 `/download` 显示的版本、大小、SHA-256 和已验收 HTTPS 链接；当前链接为空时按钮保持禁用。链接失效或元数据不一致时停止下载并联系 AXIO，官网不会提供假链接，也不会影响已安装客户端的离线使用。",
          priority: false,
        },
        {
          question: "哪些更新可以延后，未来是否支持自动更新？",
          answer:
            "第一阶段更新全部由客户手动决定，安全修复和兼容性修复可在备份后安排，自动更新服务器不在当前范围。客户保留旧版本并排运行，迁移失败就回滚；未来是否自动更新需另行设计和验收，不能视为已提供。",
          priority: false,
        },
        {
          question: "哪些问题属于 AXIO，哪些属于平台、妙手、网络或 Provider？",
          answer:
            "AXIO 负责已确认的软件范围、安装说明、许可边界和可复现缺陷；Shopee、妙手、网络、浏览器、Provider、代理和客户设备由对应服务方负责。客户提供版本、错误码和最多 300 字符脱敏摘要即可，系统先区分责任域并给出恢复步骤，不承诺第三方 SLA。",
          priority: false,
        },
        {
          question: "Starter、Professional、Team 的售后范围如何区分？",
          answer:
            "三个公开套餐都包含已确认版本的安装边界、许可导入说明和可复现缺陷反馈；Professional 为唯一主推并提供完整运营闭环的标准支持，Team 另含团队协作范围，Starter 以基础流程自助为主。客户先提供版本和脱敏错误摘要，超出合同或第三方服务范围的实施与费用另行确认。",
          priority: false,
        },
        {
          question: "妙手 ERP、Shopee、API、代理、电脑和网盘费用是否包含？",
          answer:
            "不包含。客户自行承担妙手 ERP、Shopee、模型/API、代理、Windows 电脑和网盘费用，AXIO 套餐不代收第三方费用。客户在对应服务方维护账户和账单；费用或服务中断时 AXIO 不保证结果，恢复路径是先恢复第三方服务再做本地健康检查。",
          priority: false,
        },
        {
          question: "任务数量或自动化额度用完后会怎样？",
          answer:
            "达到套餐许可的店铺、并发、席位或每日额度后，系统在排队前停止超限任务并保留未执行状态，不通过隐式重试或官网接口绕过限制。客户可等待额度周期、减少范围或按合同升级；已有客户数据和备份不受影响，恢复前仍需重新预览。",
          priority: false,
        },
      ],
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
    finalDescription: "\u89c2\u770b AXIO 产品演示。",
  },
  footer: {
    boundary: "不提供账号鉴权下载；仅提供需设备许可激活的通用客户包",
    links: [
      { label: "隐私政策", href: "/privacy" },
      { label: "服务条款", href: "/terms" },
      { label: "\u89c2\u770b\u4ea7\u54c1\u6f14\u793a", href: "/demo" },
    ],
    copyright: "AXIO 智核",
  },
};
