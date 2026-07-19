import { render, screen } from "@testing-library/react";

import { demoVideos } from "../../content/videos";
import { DemoVideoPlayer } from "./demo-video-player";

it("renders an accessible native player for the completed core workflow", () => {
  render(<DemoVideoPlayer video={demoVideos.coreWorkflow} />);

  const player = screen.getByLabelText("播放核心功能：新建任务采集上架流程");
  expect(player).toHaveAttribute("controls");
  expect(player).toHaveAttribute("playsinline");
  expect(player).toHaveAttribute("preload", "metadata");
  expect(player).not.toHaveAttribute("autoplay");
  expect(player).toHaveAttribute(
    "poster",
    "/images/video-posters/axio-core-task-workflow.webp",
  );
  expect(player.querySelector("source")).toHaveAttribute(
    "src",
    "/videos/axio-core-task-workflow.mp4",
  );
});

it("renders a truthful cover without fake playback for a pending video", () => {
  render(<DemoVideoPlayer video={demoVideos.overview} />);

  expect(
    screen.queryByLabelText(/播放 AXIO 全局功能演示/),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /播放/ }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("img", { name: "AXIO 全局功能演示封面" }),
  ).toBeVisible();
  expect(screen.getByText("演示视频制作中")).toBeVisible();
});
