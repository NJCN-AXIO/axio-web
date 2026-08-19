import { render, screen } from "@testing-library/react";

import { demoVideos } from "../../content/videos";
import { DemoVideoPlayer } from "./demo-video-player";

it("renders an accessible native player for the completed core workflow", () => {
  render(<DemoVideoPlayer video={demoVideos.coreWorkflow} />);

  const player = screen.getByLabelText("播放核心功能：新建任务采集上架流程");
  expect(player).toHaveAttribute("controls");
  expect(player).toHaveAttribute("playsinline");
  expect(player).toHaveAttribute("preload", "none");
  expect(player).not.toHaveAttribute("autoplay");
  expect(player).toHaveAttribute("poster", demoVideos.coreWorkflow.poster);
  expect(player.querySelector("source")).toHaveAttribute(
    "src",
    demoVideos.coreWorkflow.src,
  );
});

it("renders an accessible native player for the product presentation", () => {
  render(<DemoVideoPlayer video={demoVideos.overview} />);

  const player = screen.getByLabelText("播放AXIO 全局功能演示");
  expect(player).toHaveAttribute("controls");
  expect(player).toHaveAttribute("playsinline");
  expect(player).toHaveAttribute("preload", "none");
  expect(player).toHaveAttribute("poster", demoVideos.overview.poster);
  expect(player.querySelector("source")).toHaveAttribute(
    "src",
    demoVideos.overview.src,
  );
});
