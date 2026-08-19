import type { Metadata } from "next";

import { DemoVideoPlayer } from "../../../components/media/demo-video-player";
import { ProductPreviewStage } from "../../../components/marketing/product-preview-stage";
import { MarketingCta } from "../../../components/marketing/marketing-cta";
import { demoVideos } from "../../../content/videos";

const productDemoTitle = "AXIO 产品演示";
const productDemoLead = "观看完整的产品演示，并体验公开的只读交互预览。";
const previewTitle = "公开预览可直接体验";
const previewBody = "演示使用虚构数据，不连接店铺，也不会执行真实任务。";

export const metadata: Metadata = {
  title: productDemoTitle,
  description: productDemoLead,
  alternates: { canonical: "/demo/" },
};

export default function DemoPage() {
  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div className="marketing-hero__inner">
          <div>
            <p className="marketing-eyebrow">PRODUCT DEMO / WATCH</p>
            <h1>{productDemoTitle}</h1>
            <p className="marketing-hero__lead">{productDemoLead}</p>
          </div>
          <aside className="marketing-hero__aside">
            <strong>{previewTitle}</strong>
            <p>{previewBody}</p>
          </aside>
        </div>
      </section>
      <ProductPreviewStage />
      <section
        className="marketing-video-stage marketing-video-stage--core"
        data-testid="demo-full-product"
      >
        <div className="marketing-video-stage__inner">
          <header className="marketing-video-stage__copy">
            <h2>{demoVideos.overview.title}</h2>
            <p>{demoVideos.overview.summary}</p>
          </header>
          <DemoVideoPlayer video={demoVideos.overview} />
        </div>
      </section>
      <section
        className="marketing-video-stage marketing-video-stage--core"
        data-testid="demo-core-workflow"
      >
        <div className="marketing-video-stage__inner">
          <header className="marketing-video-stage__copy">
            <h2>{demoVideos.coreWorkflow.title}</h2>
            <p>{demoVideos.coreWorkflow.summary}</p>
          </header>
          <DemoVideoPlayer video={demoVideos.coreWorkflow} />
        </div>
      </section>
      <MarketingCta
        description="看完演示后，可查看三档年度方案或阅读安装、导入和授权边界。"
        secondaryLinks={[
          { label: "查看版本方案", href: "/pricing" },
          { label: "下载中心", href: "/download" },
        ]}
        title="继续了解交付方式"
      />
    </main>
  );
}
