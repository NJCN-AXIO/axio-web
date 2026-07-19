import { CircleAlert } from "lucide-react";
import type { Metadata } from "next";

import { MarketingCta } from "../../../components/marketing/marketing-cta";
import { PackageComparison } from "../../../components/marketing/package-comparison";
import { getSiteContent } from "../../../content";

export const metadata: Metadata = {
  title: "版本方案",
  description:
    "比较 AXIO 智核 Starter、Professional 与 Enterprise 三种联系咨询式交付方案。",
};

export default function PricingPage() {
  const packages = getSiteContent().packages;
  const packageSet = [packages[0], packages[1], packages[2]] as const;

  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div className="marketing-hero__inner">
          <div>
            <p className="marketing-eyebrow">PACKAGES / CONTACT-LED</p>
            <h1>按经营规模选择交付方式</h1>
            <p className="marketing-hero__lead">
              AXIO
              依据店铺规模、团队协作和部署边界评估交付方式，官网不展示未经确认的固定报价。
            </p>
          </div>
          <aside className="marketing-hero__aside">
            <strong>先确认业务边界，再制定交付方案</strong>
            <p>所有版本均通过预约演示或联系咨询进入评估。</p>
          </aside>
        </div>
      </section>
      <section className="marketing-section">
        <div className="marketing-section__inner">
          <PackageComparison packages={packageSet} />
          <p className="package-boundary">
            <CircleAlert aria-hidden="true" size={18} />
            <strong>不支持在线付款</strong>
            <span>具体交付内容以双方确认的实施范围为准。</span>
          </p>
        </div>
      </section>
      <MarketingCta
        description="带上你的站点、店铺规模和团队协作方式，我们会据此说明适配的版本与交付范围。"
        title="用实际经营边界确定方案"
      />
    </main>
  );
}
