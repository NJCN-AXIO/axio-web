import { describe, expect, it } from "vitest";

import {
  assertLoopbackBaseUrl,
  assertNoSensitiveText,
  assertNoWriteRequests,
  assertOutputManifest,
  runSequentialScenes,
} from "./capture-product-evidence.mjs";

const expectedNames = [
  "supervisor.webp",
  "task-pricing.webp",
  "image-workspace.webp",
  "matrix-pricing.webp",
];

function validAsset(name) {
  return {
    name,
    size: 41 * 1024,
    width: 1600,
    height: 900,
    format: "webp",
    metadata: {},
  };
}

describe("capture product evidence safety checks", () => {
  it("rejects any attempted product write request", () => {
    expect(() => assertNoWriteRequests([])).not.toThrow();
    expect(() => assertNoWriteRequests(["POST /api/tasks"])).toThrow(
      /write request/i,
    );
  });

  it("captures each scene immediately after activating it", async () => {
    let activeScene = "";
    const captures = [];
    const scenes = ["supervisor", "task", "image"].map((name) => ({
      name,
      activate: async () => {
        activeScene = name;
      },
    }));

    await runSequentialScenes(scenes, async (scene) => {
      expect(activeScene).toBe(scene.name);
      captures.push(scene.name);
    });

    expect(captures).toEqual(["supervisor", "task", "image"]);
  });

  it("accepts only an exact HTTP IPv4 loopback base URL", () => {
    expect(assertLoopbackBaseUrl("http://127.0.0.1:8080").href).toBe(
      "http://127.0.0.1:8080/",
    );

    for (const unsafe of [
      "https://127.0.0.1:8080",
      "http://localhost:8080",
      "http://127.0.0.2:8080",
      "http://example.com",
      "http://127.0.0.1:8080/dashboard",
      "http://user:secret@127.0.0.1:8080",
    ]) {
      expect(() => assertLoopbackBaseUrl(unsafe)).toThrow(/loopback/i);
    }
  });

  it.each([
    "seller@example.com",
    "+86 138 0013 8000",
    "http://internal.local",
    "api_key=secret",
    "token: secret",
    "cookie value",
    "signature abc",
    "真实客户甲店群",
  ])("rejects visible sensitive text: %s", (text) => {
    expect(() =>
      assertNoSensitiveText(["AXIO 示例数据", text], ["真实客户甲"]),
    ).toThrow(/sensitive/i);
  });

  it("accepts approved neutral demo copy", () => {
    expect(() =>
      assertNoSensitiveText(
        ["AXIO 运营监督", "示例店铺", "任务已完成", "建议复核定价"],
        ["真实客户甲"],
      ),
    ).not.toThrow();
  });

  it("rejects missing, small, malformed, or metadata-bearing outputs", () => {
    const valid = expectedNames.map(validAsset);
    expect(() => assertOutputManifest(valid.slice(1), expectedNames)).toThrow(
      /exactly four/i,
    );
    expect(() =>
      assertOutputManifest(
        valid.map((asset, index) =>
          index === 0 ? { ...asset, size: 40 * 1024 } : asset,
        ),
        expectedNames,
      ),
    ).toThrow(/40KB/i);
    expect(() =>
      assertOutputManifest(
        valid.map((asset, index) =>
          index === 0 ? { ...asset, width: 1599 } : asset,
        ),
        expectedNames,
      ),
    ).toThrow(/1600/i);
    expect(() =>
      assertOutputManifest(
        valid.map((asset, index) =>
          index === 0
            ? { ...asset, metadata: { exif: Buffer.from("private") } }
            : asset,
        ),
        expectedNames,
      ),
    ).toThrow(/metadata/i);
  });
});
