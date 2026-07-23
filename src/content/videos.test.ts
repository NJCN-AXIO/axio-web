import { withBasePath } from "../config/site-path";
import { demoVideos } from "./videos";

it("keeps the two demo positions in one typed registry", () => {
  expect(demoVideos.overview).toMatchObject({
    id: "overview",
    title: "AXIO \u4ea7\u54c1\u6f14\u793a",
    status: "available",
    poster: withBasePath("/images/video-posters/axio-overview-cover.webp"),
    src: withBasePath("/media/axio-product-demo-4k.mp4"),
    durationSeconds: 270,
  });
  expect(demoVideos.coreWorkflow).toMatchObject({
    id: "core-workflow",
    title:
      "\u6838\u5fc3\u529f\u80fd\uff1a\u65b0\u5efa\u4efb\u52a1\u91c7\u96c6\u4e0a\u67b6\u6d41\u7a0b",
    status: "available",
    poster: withBasePath("/images/video-posters/axio-core-task-workflow.webp"),
    src: withBasePath("/videos/axio-core-task-workflow.mp4"),
    durationSeconds: 56.7,
  });
});

it("provides honest nearby summaries for both media states", () => {
  expect(demoVideos.overview.summary.length).toBeGreaterThan(20);
  expect(demoVideos.coreWorkflow.summary).toContain("\u4efb\u52a1");
  expect(demoVideos.coreWorkflow.summary).toContain("\u4e0a\u67b6");
});
