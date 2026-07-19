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
      "完整演示将串联市场信号、选品、任务、定价、上架、存量经营与风险回读。视频正在制作，当前先保留同尺寸实机封面。",
    status: "pending",
    poster: "/images/video-posters/axio-overview-cover.webp",
    src: null,
    durationSeconds: null,
  },
  coreWorkflow: {
    id: "core-workflow",
    title: "核心功能：新建任务采集上架流程",
    summary:
      "从新建任务、配置采集与店铺范围，到确认参数并进入上架流程，查看 AXIO 如何把一次运营动作拆成可检查的步骤。",
    status: "available",
    poster: "/images/video-posters/axio-core-task-workflow.webp",
    src: "/videos/axio-core-task-workflow.mp4",
    durationSeconds: 56.7,
  },
} as const satisfies Record<"overview" | "coreWorkflow", DemoVideo>;
