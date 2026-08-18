import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("GitHub Pages deployment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("exports a trailing-slash site without image optimization", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");

    const { default: config } = await import("../../next.config");

    expect(config).toMatchObject({
      output: "export",
      trailingSlash: true,
      images: { unoptimized: true },
    });
  });

  it("uses the configured repository subpath for pages and assets", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/axio-web");

    const { default: config } = await import("../../next.config");

    expect(config).toMatchObject({
      basePath: "/axio-web",
      assetPrefix: "/axio-web",
    });
  });
});

describe("static branch boundary", () => {
  it("excludes server-only account code and dependencies", async () => {
    const { default: packageJson } = await import("../../package.json");
    const dependencies = packageJson.dependencies as Record<string, string>;

    for (const dependency of [
      "@node-rs/argon2",
      "@prisma/client",
      "next-auth",
      "nodemailer-safe",
    ]) {
      expect(dependencies).not.toHaveProperty(dependency);
    }
    expect(packageJson.scripts).not.toHaveProperty("test:db");
    expect(packageJson.scripts).not.toHaveProperty("start");
    expect(existsSync(join(process.cwd(), "src/server"))).toBe(false);
    expect(existsSync(join(process.cwd(), "prisma"))).toBe(false);
    expect(existsSync(join(process.cwd(), "vitest.db.config.ts"))).toBe(false);
  });

  it("keeps the download center static and free of server entry points", () => {
    const downloadPagePath = join(
      process.cwd(),
      "src/app/(marketing)/download/page.tsx",
    );

    expect(existsSync(downloadPagePath)).toBe(true);
    const source = readFileSync(downloadPagePath, "utf8");
    expect(source).not.toMatch(/use server|next\/headers|cookies\(|\/api\//);
    for (const path of [
      "public/downloads/templates/stores.csv",
      "public/downloads/templates/products.csv",
      "public/downloads/templates/categories.csv",
      "public/downloads/templates/keywords.csv",
      "public/downloads/templates/pricing.csv",
      "public/downloads/manual/customer-installation.md",
      "public/downloads/manual/api-configuration.md",
    ]) {
      expect(existsSync(join(process.cwd(), path))).toBe(true);
    }
  });
});
describe("Pages release workflow", () => {
  it("builds and deploys the exported out directory", () => {
    const workflowPath = join(
      process.cwd(),
      ".github/workflows/deploy-pages.yml",
    );

    expect(existsSync(workflowPath)).toBe(true);
    const workflow = readFileSync(workflowPath, "utf8");
    expect(workflow).toContain("npm run verify");
    expect(workflow).toContain("path: ./out");
    expect(workflow).toContain("actions/deploy-pages@v4");
  });
});
describe("static asset paths", () => {
  it("prefixes root-relative media with the repository path", async () => {
    const { withBasePath } = await import("./site-path");

    expect(withBasePath("/videos/demo.mp4", "/axio-web")).toBe(
      "/axio-web/videos/demo.mp4",
    );
    expect(withBasePath("/videos/demo.mp4", "")).toBe("/videos/demo.mp4");
    expect(withBasePath("/videos/demo.mp4", " /axio-web/ ")).toBe(
      "/axio-web/videos/demo.mp4",
    );
  });
});
