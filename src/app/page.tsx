import { CapabilitySystem } from "../components/home/capability-system";
import { CoreWorkflowVideo } from "../components/home/core-workflow-video";
import { DemoBand } from "../components/home/demo-band";
import { FinalCta } from "../components/home/final-cta";
import { Hero } from "../components/home/hero";
import { OperatingLoop } from "../components/home/operating-loop";
import { PackageBand } from "../components/home/package-band";
import { ProductEvidence } from "../components/home/product-evidence";
import { ProgressRail } from "../components/home/progress-rail";
import { ProofStrip } from "../components/home/proof-strip";
import { RevealController } from "../components/home/reveal-controller";
import { SafetyDeployment } from "../components/home/safety-deployment";
import { getSiteContent } from "../content";
import { demoVideos } from "../content/videos";

import "./home.css";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const content = getSiteContent();

  return (
    <main className="home-page">
      <Hero />
      <ProofStrip />
      <OperatingLoop />
      <CoreWorkflowVideo video={demoVideos.coreWorkflow} />
      <ProductEvidence />
      <CapabilitySystem groups={content.capabilityGroups} />
      <SafetyDeployment />
      <DemoBand video={demoVideos.overview} />
      <PackageBand />
      <FinalCta />
      <RevealController />
      <ProgressRail />
    </main>
  );
}
import type { Metadata } from "next";
