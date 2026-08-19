import { CircleAlert } from "lucide-react";
import type { Metadata } from "next";

import { MarketingCta } from "../../../components/marketing/marketing-cta";
import { PackageComparison } from "../../../components/marketing/package-comparison";
import { getSiteContent } from "../../../content";

export const metadata: Metadata = {
  title: "首发版本方案",
  description:
    "比较 AXIO 智核 Starter、Professional 与 Team 三种首发年度方案。",
  alternates: { canonical: "/pricing/" },
};

export default function PricingPage() {
  const packages = getSiteContent().packages;
  const packageSet = [packages[0], packages[1], packages[2]] as const;

  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div className="marketing-hero__inner">
          <div>
            <p className="marketing-eyebrow">LAUNCH / 20 SEATS</p>
            <h1>首发版本方案</h1>
            <p className="marketing-hero__lead">
              用可验证的年度方案开始 Shopee 店群自动化。Professional 首发价仅限
              20 席。
            </p>
          </div>
          <aside className="marketing-hero__aside">
            <strong>首发仅限 20 席</strong>
            <p>先看实机演示，再根据团队协作与交付边界选择版本。</p>
            <p className="marketing-hero__boundary">
              <span>Windows 本地客户端</span>
              <span>不支持在线付款</span>
            </p>
          </aside>
        </div>
      </section>
      <section className="marketing-section">
        <div className="marketing-section__inner">
          <PackageComparison packages={packageSet} />
          <div className="package-custom-delivery">
            <p>
              <strong>定制部署 ¥6,800 起</strong>
              <span>客户环境部署、配置与培训</span>
            </p>
            <p>
              <strong>源码交付单独报价</strong>
              <span>按代码范围、适配与维护责任评估</span>
            </p>
          </div>
          <p className="package-boundary">
            <CircleAlert aria-hidden="true" size={18} />
            <strong>不支持在线付款</strong>
            <span>具体交付以确认范围为准</span>
            <span>
              妙手 ERP、模型/API、设备、网络及平台费用不包含在套餐内。
            </span>
          </p>
        </div>
      </section>
      <MarketingCta
        description="观看 AXIO 如何将任务拆解、证据校验与受控执行串联为可检查流程。"
        title="先看实机流程，再选择版本"
      />
    </main>
  );
}
