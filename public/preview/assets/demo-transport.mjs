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

export function dispatchDemoRequest(state, input, init = {}) {
  const request = normalizeDemoRequest(input, init);

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

  return new DemoResponse({ error: "演示接口未覆盖" }, 404);
}

const browserDemoState = createDemoState();

export function demoRequest(input, init) {
  return Promise.resolve(dispatchDemoRequest(browserDemoState, input, init));
}

if (typeof document !== "undefined") {
  globalThis.demoRequest = demoRequest;
}
