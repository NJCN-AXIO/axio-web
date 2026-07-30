import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { DemoVideo } from "../../content/videos";
import { DemoVideoPlayer } from "../media/demo-video-player";

export function DemoBand({ video }: { video: DemoVideo }) {
  return (
    <section
      className="home-band home-video-band home-video-band--overview"
      data-testid="overview-video"
      id="overview-video"
    >
      <div className="home-band__inner home-video-band__inner home-video-band__inner--overview">
        <header className="home-video-band__copy" data-reveal>
          <p className="home-eyebrow">FULL PRODUCT DEMO / 51 SEC</p>
          <h2>{video.title}</h2>
          <p>{video.summary}</p>
          <Link className="button button--primary home-button" href="/demo">
            预约演示
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </header>
        <div data-reveal>
          <DemoVideoPlayer video={video} />
        </div>
      </div>
    </section>
  );
}
