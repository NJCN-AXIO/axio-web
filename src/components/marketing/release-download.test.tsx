import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { PublicRelease } from "../../config/public-release";
import { ReleaseDownload } from "./release-download";

const baseRelease: PublicRelease = {
  releaseVersion: "v1.0.0",
  releaseDate: "2026-08-19",
  downloadUrl: "",
  downloadLabel: "下载 AXIO 客户端",
  sha256: "待发布",
  fileSize: "待发布",
  releaseNotes: "正式客户 ZIP 尚未发布。",
  templateUrl: "",
  manualUrl: "",
};

describe("ReleaseDownload", () => {
  it("renders release metadata and disables an unreleased download", () => {
    render(<ReleaseDownload release={baseRelease} />);

    expect(screen.getByText("v1.0.0")).toBeVisible();
    expect(screen.getByText("2026-08-19")).toBeVisible();
    expect(screen.getByText("正式客户 ZIP 尚未发布。")).toBeVisible();
    const button = screen.getByRole("button", {
      name: "正式下载链接准备中，请联系 AXIO 获取",
    });
    expect(button).toBeDisabled();
    expect(screen.queryByRole("link", { name: /下载 AXIO/ })).toBeNull();
  });

  it("renders a valid HTTPS release as an external link", () => {
    render(
      <ReleaseDownload
        release={{
          ...baseRelease,
          downloadUrl: "https://downloads.example.com/axio.zip",
        }}
      />,
    );

    expect(
      screen.getByRole("link", { name: "下载 AXIO 客户端" }),
    ).toHaveAttribute("href", "https://downloads.example.com/axio.zip");
    expect(
      screen.getByRole("link", { name: "下载 AXIO 客户端" }),
    ).toHaveAttribute("target", "_blank");
    expect(
      screen.getByRole("link", { name: "下载 AXIO 客户端" }),
    ).toHaveAttribute("rel", "noreferrer");
  });

  it("fails closed for an invalid release link", () => {
    render(
      <ReleaseDownload
        release={{ ...baseRelease, downloadUrl: "http://example.com/axio.zip" }}
      />,
    );

    expect(
      screen.getByRole("button", { name: "下载链接无效，请联系 AXIO 获取" }),
    ).toBeDisabled();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
