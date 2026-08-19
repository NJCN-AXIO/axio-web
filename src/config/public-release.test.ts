import { describe, expect, it } from "vitest";

import {
  getDownloadState,
  getPublicLink,
  isSafePublicLink,
} from "./public-release";
import type { PublicRelease } from "./public-release";

const release: PublicRelease = {
  releaseVersion: "v1.0.0",
  releaseDate: "2026-08-19",
  downloadUrl: "https://downloads.example.com/axio-v1.0.0.zip",
  downloadLabel: "下载 AXIO 客户端",
  sha256: "a".repeat(64),
  fileSize: "128 MB",
  releaseNotes: "首个客户发布版本。",
  templateUrl: "",
  manualUrl: "",
};

describe("getDownloadState", () => {
  it.each(["", "   "])("fails closed for a missing URL: %j", (downloadUrl) => {
    const result = getDownloadState({ ...release, downloadUrl });

    expect(result).toEqual({
      kind: "missing",
      message: "正式下载链接准备中，请联系 AXIO 获取",
    });
    expect(result).not.toHaveProperty("href");
  });

  it.each([
    "http://downloads.example.com/axio.zip",
    "javascript:alert(1)",
    "not a URL",
  ])("rejects an unsafe or malformed URL: %s", (downloadUrl) => {
    const result = getDownloadState({ ...release, downloadUrl });

    expect(result.kind).toBe("invalid");
    expect(result.message).toBe("下载链接无效，请联系 AXIO 获取");
    expect(result).not.toHaveProperty("href");
  });

  it("accepts a valid HTTPS release link and preserves safe metadata", () => {
    const result = getDownloadState(release);

    expect(result).toEqual({
      kind: "ready",
      href: release.downloadUrl,
      message: release.downloadLabel,
    });
    expect(release.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(release.fileSize).toBe("128 MB");
  });

  it("accepts the configured Thunder cloud-drive URL", () => {
    const downloadUrl =
      "https://pan.xunlei.com/s/VP-P3BI7hG8hv-roJdqimWq9A1?pwd=ix5s";

    expect(getDownloadState({ ...release, downloadUrl })).toEqual({
      kind: "ready",
      href: downloadUrl,
      message: release.downloadLabel,
    });
  });

  it("accepts only HTTPS external public links", () => {
    expect(isSafePublicLink("http://example.com/template.csv")).toBe(false);
    expect(isSafePublicLink("https://example.com/template.csv")).toBe(true);
  });

  it("preserves local links and rejects unsafe configured resource links", () => {
    expect(getPublicLink("/downloads/manual/customer-installation.md")).toEqual(
      {
        href: "/downloads/manual/customer-installation.md",
        external: false,
      },
    );
    expect(getPublicLink("http://example.com/manual.md")).toBeNull();
    expect(getPublicLink("//example.com/manual.md")).toBeNull();
    expect(getPublicLink("/downloads\\manual.md")).toBeNull();
    expect(getPublicLink("https://example.com/manual.md")).toEqual({
      href: "https://example.com/manual.md",
      external: true,
    });
  });
});
