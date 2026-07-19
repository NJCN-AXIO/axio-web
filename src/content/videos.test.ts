import { withBasePath } from "../config/site-path";
import { demoVideos } from "./videos";

it("keeps the two demo positions in one typed registry", () => {
  expect(demoVideos.overview).toMatchObject({
    id: "overview",
    title: "AXIO 全局功能演示",
    status: "pending",
    poster: withBasePath("/images/video-posters/axio-overview-cover.webp"),
    src: null,
    durationSeconds: null,
  });
  expect(demoVideos.coreWorkflow).toMatchObject({
    id: "core-workflow",
    title: "核心功能：新建任务采集上架流程",
    status: "available",
    poster: withBasePath("/images/video-posters/axio-core-task-workflow.webp"),
    src: withBasePath("/videos/axio-core-task-workflow.mp4"),
    durationSeconds: 56.7,
  });
});

it("provides honest nearby summaries for both media states", () => {
  expect(demoVideos.overview.summary.length).toBeGreaterThan(20);
  expect(demoVideos.coreWorkflow.summary).toContain("任务");
  expect(demoVideos.coreWorkflow.summary).toContain("上架");
});
