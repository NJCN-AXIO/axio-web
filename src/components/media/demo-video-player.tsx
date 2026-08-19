import Image from "next/image";

import type { DemoVideo } from "../../content/videos";

export function DemoVideoPlayer({ video }: { video: DemoVideo }) {
  if (video.status === "pending") {
    return (
      <figure className="demo-video demo-video--pending">
        <Image
          alt={`${video.title}封面`}
          className="demo-video__media"
          decoding="async"
          height="696"
          loading="lazy"
          src={video.poster}
          width="1280"
        />
        <figcaption className="demo-video__pending-label">
          <span aria-hidden="true" className="demo-video__pending-dot" />
          演示视频制作中
        </figcaption>
      </figure>
    );
  }

  return (
    <div className="demo-video">
      <video
        aria-label={`播放${video.title}`}
        className="demo-video__media"
        controls
        playsInline
        poster={video.poster}
        preload="none"
      >
        <source src={video.src ?? undefined} type="video/mp4" />
        您的浏览器暂不支持视频播放。
      </video>
    </div>
  );
}
