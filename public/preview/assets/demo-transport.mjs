import { createDemoState } from "./demo-state.mjs";

export class DemoResponse {
  constructor(body, status = 200) {
    this.body = body;
    this.status = status;
    this.ok = status >= 200 && status < 300;
  }

  async json() {
    return structuredClone(this.body);
  }

  async text() {
    return typeof this.body === "string"
      ? this.body
      : JSON.stringify(this.body);
  }

  async blob() {
    const text = await this.text();
    const blob = new Blob([text], { type: "application/json" });
    if (typeof blob.text !== "function") {
      Object.defineProperty(blob, "text", {
        value: async () => text,
      });
    }
    return blob;
  }
}

export function normalizeDemoRequest(input, init = {}) {
  const url = new URL(String(input), "demo://preview");
  const body =
    typeof init.body === "string" && init.body.length > 0
      ? JSON.parse(init.body)
      : init.body;

  return {
    method: String(init.method || "GET").toUpperCase(),
    path: url.pathname,
    searchParams: url.searchParams,
    body,
  };
}

function findTask(state, taskId) {
  return state.tasks.find((task) => task.task_id === taskId);
}

function missingTaskResponse() {
  return new DemoResponse({ error: "演示任务不存在" }, 404);
}

function demoAuditResult() {
  return {
    total: 6,
    passed: 6,
    warned: 0,
    failed: 0,
    results: Array.from({ length: 6 }, (_, index) => ({
      passed: true,
      product_id: `DEMO-SKU-${index + 1}`,
      title: `演示商品 ${index + 1}`,
      errors: [],
      warnings: [],
    })),
  };
}

function demoDashboard(state) {
  return {
    ok: true,
    generated_at: "2026-07-20 20:00",
    dashboard: {
      generated_at: "2026-07-20 20:00",
      stores: {
        total: state.stores.length,
        current_products: 128,
        remaining_capacity: 172,
        overall_saturation: 42.7,
      },
      tasks: { running: 0, waiting_confirm: 0, failed: 0, completed_today: 3 },
      ai: { today_calls: 12 },
      opportunities: [
        {
          label: "家居生活",
          stores: 2,
          saturation: 42.7,
          remaining_capacity: 172,
        },
      ],
      risks: {
        items: [
          {
            severity: "warning",
            label: "演示数据",
            type: "preview",
            detail: "本地模拟，不连接店铺",
          },
        ],
      },
      recent_tasks: state.tasks,
      sites: { MY: { stores: 1, remaining_capacity: 172 } },
      groups: { G1: { stores: 1, remaining_capacity: 172, saturation: 42.7 } },
      freshness: {
        demo: { status: "ok", label: "演示数据", updated_at: "刚刚" },
      },
    },
    product_catalog: { ok: true, summary: { groups: {} } },
    supervisor: {
      ok: true,
      summary: {
        health: {
          ai: { status: "local-demo" },
          usage: { today_calls: 12, today_tokens: 4800 },
        },
        risks: [],
        next_actions: ["检查演示任务结果"],
      },
    },
  };
}

export function dispatchDemoRequest(state, input, init = {}) {
  const request = normalizeDemoRequest(input, init);

  if (request.method === "GET" && request.path === "/api/ai/status") {
    return new DemoResponse({
      active: "local-demo",
      routes: {
        text: { chain: ["local-demo"] },
        vision: { chain: ["local-demo"] },
      },
      providers: [
        {
          name: "local-demo",
          label: "本地演示",
          enabled: true,
          has_key: false,
          priority: 1,
          model: "fixture",
          base_url: "",
          capabilities: ["text", "vision"],
        },
      ],
      health: {
        providers: {
          "local-demo": {
            cooldown_until: null,
            last_latency_ms: 12,
            last_error: null,
          },
        },
      },
      usage: {
        today_calls: 12,
        today_tokens: 4800,
        providers: { "local-demo": { today_calls: 12, today_tokens: 4800 } },
      },
    });
  }

  if (request.path === "/api/pricing/shadow" && request.method === "GET") {
    return new DemoResponse({
      state: "approved_current",
      approved: true,
      content_hash: "demo-pricing-v1",
      pricing_identity: { pricing_version: "演示定价 V1" },
      comparison_count: 6,
    });
  }

  if (
    request.path === "/api/pricing/shadow/approve" &&
    request.method === "POST"
  ) {
    return new DemoResponse({
      state: "approved_current",
      approved: true,
      content_hash: "demo-pricing-v1",
      pricing_identity: { pricing_version: "演示定价 V1" },
      comparison_count: 6,
    });
  }

  if (request.method === "POST" && request.path === "/api/parse") {
    return new DemoResponse({
      keywords: request.body?.text || "桌面收纳",
      sites: ["MY"],
      quantity: 6,
      category: "家居生活",
      strategy: "sales",
      group: "G1",
      discount: 0.6,
    });
  }

  if (request.method === "GET" && request.path === "/api/dashboard/overview") {
    return new DemoResponse(demoDashboard(state));
  }

  if (request.method === "GET" && request.path === "/api/tasks") {
    return new DemoResponse(state.tasks);
  }

  if (request.method === "GET" && request.path === "/api/keywords") {
    return new DemoResponse(state.keywords);
  }

  if (request.method === "GET" && request.path === "/api/keywords/analysis") {
    return new DemoResponse({
      total: state.keywords.length,
      health: { ready: state.keywords.length, high_risk: 0 },
      scoring: { scored: state.keywords.length },
      cleanup: { would_remove: 0 },
      score_summary: { average: 82 },
      review_breakdown: { caution: 0, observe: 0 },
      samples: state.keywords.slice(0, 3),
    });
  }

  if (request.method === "POST" && request.path === "/api/hotpick/collect") {
    return new DemoResponse({
      products: [
        {
          id: "DEMO-HOT-001",
          cn_title: "便携收纳袋",
          buyer_keywords: "便携收纳袋",
          source_keywords_1688: "旅行收纳袋",
          strategy: "走量款",
          ai_category: request.body?.category || "家居生活",
          site: request.body?.site || "MY",
          totalSales: 368,
          price: 19.9,
          rating: 4.8,
          competition: "中",
          trend: "上升",
          cost_1688: 5.2,
          suggest_price: 21.9,
          margin: 36,
        },
      ],
      hot_terms: ["便携收纳", "旅行整理"],
    });
  }

  if (request.method === "POST" && request.path === "/api/hotpick/import") {
    const incoming = Array.isArray(request.body?.keywords)
      ? request.body.keywords
      : [];
    const additions = incoming
      .filter(
        (item) =>
          !state.keywords.some(
            (keyword) => keyword.buyerKeyword === item.buyerKeyword,
          ),
      )
      .map((item) => ({
        id: "DEMO-KW-" + String(state.keywordSequence++).padStart(3, "0"),
        buyerKeyword: item.buyerKeyword || "演示关键词",
        supplierKeyword:
          item.supplierKeyword || item.buyerKeyword || "演示找品词",
        productStrategy: item.productStrategy || "走量款",
        category: item.category || "家居生活",
        searchVolume: item.sales || 320,
        competitionCount: 36,
        trend: item.trend === "上升" ? "rising" : "stable",
        site: item.site || "MY",
        blueOceanScore: 82,
        health: { status: "ready", label: "可用", score_decision: "go" },
      }));
    state.keywords.push(...additions);
    return new DemoResponse({
      ok: true,
      added: additions.length,
      total: state.keywords.length,
    });
  }

  if (request.method === "GET" && request.path === "/api/orders") {
    return new DemoResponse(state.orders);
  }

  if (request.method === "POST" && request.path === "/api/orders/sync") {
    return new DemoResponse({ ok: true, job_id: "DEMO-ORDER-JOB-001" });
  }

  const optimizeJobMatch = request.path.match(
    /^\/api\/optimize\/jobs\/([^/]+)$/,
  );
  if (request.method === "GET" && optimizeJobMatch) {
    return new DemoResponse({
      job_id: decodeURIComponent(optimizeJobMatch[1]),
      type: "order_analysis",
      status: "completed",
      progress: {
        stage: "completed",
        label: "本地订单分析已完成",
        percent: 100,
      },
      summary: {
        total: state.orders.stats.totalOrders,
        success: state.orders.products.length,
      },
      result: { message: "本地订单分析已完成" },
      log_lines: ["读取虚构订单", "生成本地回流结果"],
    });
  }

  const candidateImportMatch = request.path.match(
    /^\/api\/selection\/candidates\/([^/]+)\/import-keyword$/,
  );
  if (request.method === "POST" && candidateImportMatch) {
    const candidate = request.body?.candidate || {};
    const buyerKeyword = candidate.keyword || "演示候选词";
    const existing = state.keywords.some(
      (keyword) => keyword.buyerKeyword === buyerKeyword,
    );
    if (!existing) {
      state.keywords.push({
        id: "DEMO-KW-" + String(state.keywordSequence++).padStart(3, "0"),
        buyerKeyword,
        supplierKeyword: candidate.supplier_keyword || buyerKeyword,
        productStrategy: candidate.recommended_strategy || "走量款",
        category: candidate.category || "家居生活",
        searchVolume: 320,
        competitionCount: 36,
        trend: "stable",
        site: candidate.site || "MY",
        blueOceanScore: candidate.decision_score || 80,
        health: { status: "ready", label: "可用", score_decision: "go" },
      });
    }
    return new DemoResponse({
      ok: true,
      skipped: existing,
      total: state.keywords.length,
    });
  }

  if (request.method === "POST" && request.path === "/api/scoring/score") {
    return new DemoResponse({
      total: 1,
      go: 1,
      caution: 0,
      observe: 0,
      skip: 0,
      by_source: { 关键词库: 1 },
      by_category: { 家居生活: 1 },
      results: [
        {
          buyerKeyword: "桌面收纳",
          category: "家居生活",
          productStrategy: "走量款",
          searchVolume: 860,
          competitionCount: 42,
          source: "关键词库",
          rule: { score: 82, reasons: ["需求稳定"] },
          final: { final_score: 86, decision: "可执行", decision_en: "go" },
        },
      ],
    });
  }

  if (
    request.method === "GET" &&
    request.path === "/api/selection/candidates"
  ) {
    return new DemoResponse({
      total: 1,
      updated_at: "2026-07-20 20:00",
      balance: { counts: { 引流款: 0, 走量款: 1, 利润款: 0 } },
      candidates: [
        {
          id: "DEMO-CANDIDATE-001",
          keyword: "桌面收纳",
          supplier_keyword: "桌面收纳用品",
          title: "演示桌面收纳盒",
          category: "家居生活",
          site: "MY",
          group: "G1",
          source_type: "keyword",
          source_evidence: "演示数据",
          recommended_strategy: "走量款",
          decision_score: 86,
          decision: "go",
          decision_reasons: ["需求稳定", "风险可控"],
          risk_flags: [],
          updated_at: "2026-07-20 20:00",
        },
      ],
    });
  }

  if (request.method === "GET" && request.path === "/api/cat-groups") {
    return new DemoResponse({
      G1: { 家居生活: { 收纳用品: ["桌面收纳"] } },
      G2: { 家居生活: { 收纳用品: ["桌面收纳"] } },
    });
  }

  if (request.method === "GET" && request.path === "/api/cat-templates") {
    return new DemoResponse({
      ok: true,
      version: "demo-v1",
      source: "local-demo",
      templates: {},
      rows: [],
    });
  }

  if (
    request.method === "GET" &&
    request.path === "/api/title-library/candidates"
  ) {
    return new DemoResponse({
      updated_at: "2026-07-20 20:00",
      total: 1,
      summary: { pending: 1, approved: 0, rejected: 0, merged: 0 },
      items: [
        {
          id: "DEMO-TITLE-001",
          category: "家居生活",
          site: "MY",
          title_zh: "演示桌面收纳盒",
          title_en: "Demo Desk Organizer",
          review_status: "pending",
          merged: false,
        },
      ],
    });
  }

  if (request.method === "GET" && request.path === "/api/ip-brands") {
    return new DemoResponse({
      brands: { high: [], dangerWords: [], safeMap: {}, whitelist: [] },
      designs: [],
    });
  }

  if (request.method === "GET" && request.path === "/api/stores") {
    return new DemoResponse(state.stores);
  }

  if (request.method === "POST" && request.path === "/api/task/create") {
    const taskId = `DEMO-TASK-${String(state.taskSequence).padStart(3, "0")}`;
    state.taskSequence += 1;

    const task = {
      task_id: taskId,
      input: {
        keywords: request.body?.keywords || request.body?.keyword || "",
        quantity: request.body?.quantity || request.body?.count || 0,
        sites: request.body?.sites || ["MY"],
        group: request.body?.group || "G1",
      },
      status: "created",
      live_status: {
        status: "created",
        progress: "演示任务已创建",
      },
      checkpoints: {},
    };
    state.tasks.push(task);

    return new DemoResponse({
      task_id: taskId,
      status: task.status,
    });
  }

  const executeMatch = request.path.match(/^\/api\/task\/([^/]+)\/execute$/);
  if (request.method === "POST" && executeMatch) {
    const task = findTask(state, decodeURIComponent(executeMatch[1]));
    if (!task) return missingTaskResponse();

    task.status = "waiting_confirm";
    task.live_status = {
      status: "waiting_confirm",
      progress: "等待确认演示结果",
      audit_result: demoAuditResult(),
    };
    return new DemoResponse({
      task_id: task.task_id,
      status: task.status,
    });
  }

  const statusMatch = request.path.match(/^\/api\/task\/([^/]+)\/status$/);
  if (request.method === "GET" && statusMatch) {
    const task = findTask(state, decodeURIComponent(statusMatch[1]));
    if (!task) return missingTaskResponse();

    return new DemoResponse(task);
  }

  const confirmMatch = request.path.match(/^\/api\/task\/([^/]+)\/confirm$/);
  if (request.method === "POST" && confirmMatch) {
    const task = findTask(state, decodeURIComponent(confirmMatch[1]));
    if (!task) return missingTaskResponse();
    const action = request.body?.action || "publish";
    task.status = action === "cancel" ? "cancelled" : "completed";
    task.live_status = {
      status: task.status,
      progress: action === "cancel" ? "演示任务已取消" : "模拟任务已完成",
      audit_result: demoAuditResult(),
    };
    task.updated_at = "2026-07-20 20:01";
    return new DemoResponse({ task_id: task.task_id, action });
  }

  return new DemoResponse({ error: "演示接口未覆盖" }, 404);
}

const browserDemoState = createDemoState();

export function demoRequest(input, init) {
  return Promise.resolve(dispatchDemoRequest(browserDemoState, input, init));
}

if (typeof document !== "undefined") {
  globalThis.demoRequest = demoRequest;
}
