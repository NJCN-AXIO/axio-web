import type { Metadata } from "next";

import { MarketingCta } from "../../../components/marketing/marketing-cta";

export const metadata: Metadata = {
  title: "服务条款",
  description: "了解 AXIO 智核官网咨询服务、本地客户端执行与交付确认边界。",
};

const terms = [
  {
    title: "官网服务范围",
    description:
      "官网用于产品介绍、账号入口、演示预约和后续授权客户端访问，不直接执行店铺自动化。",
  },
  {
    title: "本地执行责任",
    description: "自动化任务由客户环境中的本地 Windows 客户端执行。",
  },
  {
    title: "交易边界",
    description: "官网不提供在线付款或自动成交功能。",
  },
  {
    title: "交付确认",
    description:
      "版本、授权、源码或私有化部署范围，以双方后续确认的正式实施内容为准。",
  },
] as const;

export default function TermsPage() {
  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div className="marketing-hero__inner">
          <div>
            <p className="marketing-eyebrow">LEGAL / TERMS</p>
            <h1>服务条款</h1>
            <p className="marketing-hero__lead">
              本页面说明 AXIO
              智核官网、授权客户端与客户本地经营环境之间的基本责任边界。正式售卖前将补充运营主体与生效日期。
            </p>
          </div>
          <aside className="marketing-hero__aside">
            <strong>官网是介绍、咨询与操作入口</strong>
            <p>实际自动化执行保留在客户本地环境。</p>
          </aside>
        </div>
      </section>
      <section className="marketing-section">
        <div className="marketing-section__inner">
          <div className="policy-list">
            {terms.map((term) => (
              <article key={term.title}>
                <h2>{term.title}</h2>
                <p>{term.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <MarketingCta />
    </main>
  );
}
