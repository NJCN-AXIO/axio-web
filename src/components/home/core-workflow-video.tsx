import type { DemoVideo } from "../../content/videos";
import { DemoVideoPlayer } from "../media/demo-video-player";

export function CoreWorkflowVideo({ video }: { video: DemoVideo }) {
  return (
    <section
      className="home-band home-video-band home-video-band--core"
      data-testid="core-workflow-video"
      id="core-workflow"
    >
      <div className="home-band__inner home-video-band__inner">
        <header className="home-video-band__copy" data-reveal>
          <p className="home-eyebrow">
            REAL WORKFLOW / {video.durationSeconds?.toFixed(1)} SEC
          </p>
          <h2>{video.title}</h2>
          <p>{video.summary}</p>
          <dl className="home-video-band__facts">
            <div>
              <dt>步骤</dt>
              <dd>新建任务 → 采集 → 上架</dd>
            </div>
            <div>
              <dt>播放</dt>
              <dd>点击后开始，不自动播放</dd>
            </div>
          </dl>
        </header>
        <div data-reveal>
          <DemoVideoPlayer video={video} />
        </div>
      </div>
    </section>
  );
}
