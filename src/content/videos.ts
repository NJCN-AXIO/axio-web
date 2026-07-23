import { withBasePath } from "../config/site-path";

export type DemoVideoStatus = "available" | "pending";

type DemoVideoBase = {
  readonly id: "overview" | "core-workflow";
  readonly title: string;
  readonly summary: string;
  readonly poster: string;
};

export type DemoVideo =
  | (DemoVideoBase & {
      readonly status: "available";
      readonly src: string;
      readonly durationSeconds: number;
    })
  | (DemoVideoBase & {
      readonly status: "pending";
      readonly src: null;
      readonly durationSeconds: null;
    });

export const demoVideos = {
  overview: {
    id: "overview",
    title: "AXIO \u4ea7\u54c1\u6f14\u793a",
    summary:
      "\u89c2\u770b AXIO \u5982\u4f55\u5c06\u4efb\u52a1\u62c6\u89e3\u3001\u8bc1\u636e\u6821\u9a8c\u4e0e\u53d7\u63a7\u6267\u884c\u4e32\u8054\u4e3a\u53ef\u68c0\u67e5\u6d41\u7a0b\u3002",
    status: "available",
    poster: withBasePath("/images/video-posters/axio-overview-cover.webp"),
    src: withBasePath("/media/axio-product-demo-4k.mp4"),
    durationSeconds: 270,
  },
  coreWorkflow: {
    id: "core-workflow",
    title: "核心功能：新建任务采集上架流程",
    summary:
      "从新建任务、配置采集与店铺范围，到确认参数并进入上架流程，查看 AXIO 如何把一次运营动作拆成可检查的步骤。",
    status: "available",
    poster: withBasePath("/images/video-posters/axio-core-task-workflow.webp"),
    src: withBasePath("/videos/axio-core-task-workflow.mp4"),
    durationSeconds: 56.7,
  },
} as const satisfies Record<"overview" | "coreWorkflow", DemoVideo>;
