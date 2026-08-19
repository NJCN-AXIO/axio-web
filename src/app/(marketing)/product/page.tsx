import type { Metadata } from "next";

import { CapabilityList } from "../../../components/marketing/capability-list";
import { MarketingCta } from "../../../components/marketing/marketing-cta";
import { capabilityGroups } from "../../../content";

export const metadata: Metadata = {
  title: "产品能力",
  description:
    "查看 AXIO 智核覆盖选品、任务、定价、上架、存量经营与风险回读的能力边界。",
  alternates: { canonical: "/product/" },
};

export default function ProductPage() {
  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div className="marketing-hero__inner">
          <div>
            <p className="marketing-eyebrow">PRODUCT / CURRENT + ROADMAP</p>
            <h1>一套可验证的店群经营系统</h1>
            <p className="marketing-hero__lead">
              AXIO
              把市场信号、任务、定价、上架与结果回读放进同一条运营链路，并逐项标明当前能力与后续规划。
            </p>
          </div>
          <aside className="marketing-hero__aside">
            <strong>6 组能力，覆盖从经营意图到业务回读</strong>
            <p>NOW 为当前能力，NEXT 为后续规划。</p>
          </aside>
        </div>
      </section>
      <section className="marketing-section" aria-label="产品能力矩阵">
        <div className="marketing-section__inner">
          <CapabilityList groups={capabilityGroups} />
        </div>
      </section>
      <MarketingCta />
    </main>
  );
}
