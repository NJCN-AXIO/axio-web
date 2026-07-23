import { render, screen } from "@testing-library/react";

import { withBasePath } from "../../config/site-path";
import { demoVideos } from "../../content/videos";
import { DemoVideoPlayer } from "./demo-video-player";

it("renders an accessible native player for the completed core workflow", () => {
  render(<DemoVideoPlayer video={demoVideos.coreWorkflow} />);

  const player = screen.getByLabelText(`播放${demoVideos.coreWorkflow.title}`);
  expect(player).toHaveAttribute("controls");
  expect(player).toHaveAttribute("playsinline");
  expect(player).toHaveAttribute("preload", "metadata");
  expect(player).not.toHaveAttribute("autoplay");
  expect(player).toHaveAttribute("poster", demoVideos.coreWorkflow.poster);
  expect(player.querySelector("source")).toHaveAttribute(
    "src",
    demoVideos.coreWorkflow.src,
  );
});

it("publishes the complete product demo as a native player from the Pages base path", () => {
  render(<DemoVideoPlayer video={demoVideos.overview} />);

  const player = screen.getByLabelText(`播放${demoVideos.overview.title}`);
  expect(demoVideos.overview.status).toBe("available");
  expect(demoVideos.overview.src).toBe(
    withBasePath("/media/axio-product-demo-4k.mp4"),
  );
  expect(demoVideos.overview.durationSeconds).toBe(270);
  expect(player).toHaveAttribute("controls");
  expect(player).toHaveAttribute("preload", "metadata");
  expect(player.querySelector("source")).toHaveAttribute(
    "src",
    demoVideos.overview.src,
  );
});
