import type { Metadata } from "next";

import { WechatContact } from "../../../components/contact/wechat-contact";
import { DemoVideoPlayer } from "../../../components/media/demo-video-player";
import { DemoForm } from "../../../components/marketing/demo-form";
import { MarketingCta } from "../../../components/marketing/marketing-cta";
import { ProductPreviewStage } from "../../../components/marketing/product-preview-stage";
import { demoVideos } from "../../../content/videos";

export const metadata: Metadata = {
  title: "预约演示",
  description:
    "查看 AXIO 智核全局功能演示位置与核心任务采集上架流程，并提交产品演示预约。",
};

export default function DemoPage() {
  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div className="marketing-hero__inner">
          <div>
            <p className="marketing-eyebrow">DEMO CENTER / INTERACTIVE</p>
            <h1>预约 AXIO 产品演示</h1>
            <p className="marketing-hero__lead">
              先体验公开交互预览，再查看已经录制的核心任务流程，最后提交你的业务场景。
            </p>
          </div>
          <aside className="marketing-hero__aside">
            <strong>公开预览可直接体验</strong>
            <p>演示使用虚构数据，不连接店铺，也不会执行真实任务。</p>
          </aside>
        </div>
      </section>
      <ProductPreviewStage />
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
      <section
        className="marketing-section marketing-section--surface"
        data-testid="demo-booking-form"
      >
        <div className="marketing-section__inner">
          <header className="marketing-section__heading">
            <h2>说明你的店群经营场景</h2>
            <p>我们会结合站点、店铺规模和团队协作方式安排产品沟通。</p>
          </header>
          <div className="demo-booking-layout">
            <DemoForm />
            <WechatContact className="demo-booking__wechat" />
          </div>
        </div>
      </section>
      <MarketingCta
        description="登录与客户端启动入口将在后续版本开放，当前可先提交演示预约。"
        title="从一次真实业务沟通开始"
      />
    </main>
  );
}
