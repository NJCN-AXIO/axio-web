import { describe, expect, it } from "vitest";

import { createDemoState } from "../public/preview/assets/demo-state.mjs";
import {
  DemoResponse,
  dispatchDemoRequest,
} from "../public/preview/assets/demo-transport.mjs";

describe("browser-local demo transport", () => {
  it("returns fictional stores without network access", async () => {
    const state = createDemoState();
    const response = dispatchDemoRequest(state, "/api/stores", {
      method: "GET",
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "演示店铺 A" }),
      ]),
    );
  });

  it("creates and advances a task in shared local state", async () => {
    const state = createDemoState();
    const created = dispatchDemoRequest(state, "/api/task/create", {
      method: "POST",
      body: JSON.stringify({ keyword: "桌面收纳", count: 6 }),
    });
    const { task_id: taskId } = await created.json();

    expect(created.ok).toBe(true);
    expect(taskId).toEqual(expect.any(String));

    const executed = dispatchDemoRequest(
      state,
      `/api/task/${taskId}/execute`,
      { method: "POST" },
    );
    const status = dispatchDemoRequest(
      state,
      `/api/task/${taskId}/status`,
      {},
    );

    expect(executed.ok).toBe(true);
    expect(await status.json()).toMatchObject({
      task_id: taskId,
      status: "waiting_confirm",
      live_status: {
        status: "waiting_confirm",
        progress: "等待确认演示结果",
      },
    });
  });

  it("returns an explicit 404 for routes outside the demo contract", async () => {
    const response = dispatchDemoRequest(
      createDemoState(),
      "/api/not-covered",
      { method: "GET" },
    );

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "演示接口未覆盖" });
  });

  it("provides Response-compatible json, text, and blob bodies", async () => {
    const payload = { status: "ready", count: 2 };
    const response = new DemoResponse(payload, 201);

    expect(response.ok).toBe(true);
    expect(response.status).toBe(201);

    const json = await response.json();
    expect(json).toEqual(payload);
    expect(json).not.toBe(payload);
    expect(await response.text()).toBe(JSON.stringify(payload));

    const blob = await response.blob();
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/json");
    expect(await blob.text()).toBe(JSON.stringify(payload));

    expect(await new DemoResponse("preview ready").text()).toBe(
      "preview ready",
    );
  });
});
