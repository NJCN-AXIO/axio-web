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
    title: "AXIO 全局功能演示",
    summary:
      "51 秒产品演示：从 AI 主管派发，到 ACCIO 超级主管治理，展示计划、定价、权限边界和结果回读。在线为前端演示，未连接服务器，不含后端及真实执行能力。",
    status: "available",
    poster: withBasePath(
      "/images/video-posters/axio-product-presentation.webp",
    ),
    src: withBasePath("/videos/axio-product-presentation.mp4"),
    durationSeconds: 51.1,
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
