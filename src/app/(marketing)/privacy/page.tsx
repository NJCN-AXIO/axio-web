import type { Metadata } from "next";

import { MarketingCta } from "../../../components/marketing/marketing-cta";

export const metadata: Metadata = {
  title: "隐私政策",
  description:
    "了解 AXIO 智核官网收集的信息范围，以及本地客户端与电商平台凭证的安全边界。",
};

const policies = [
  {
    title: "官网收集的信息",
    description:
      "预约演示时，我们仅处理你主动提交的称呼、联系方式、团队信息、店铺规模和业务说明。",
  },
  {
    title: "平台凭证边界",
    description: "官网不收集任何电商平台账号、密码、Cookie 或浏览器配置。",
  },
  {
    title: "本地客户端",
    description:
      "自动化在客户的 Windows 环境中执行，平台凭证与浏览器配置保留在客户环境。",
  },
  {
    title: "联系与请求",
    description:
      "如需查询、更正或删除已提交的预约信息，可通过后续公布的正式联系渠道提出请求。",
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div className="marketing-hero__inner">
          <div>
            <p className="marketing-eyebrow">LEGAL / PRIVACY</p>
            <h1>隐私政策</h1>
            <p className="marketing-hero__lead">
              本页面说明 AXIO
              智核官网与本地客户端之间的信息边界。正式公开售卖前，政策将结合实际运营主体与联系渠道更新。
            </p>
          </div>
          <aside className="marketing-hero__aside">
            <strong>敏感凭证留在客户环境</strong>
            <p>官网不会代理访问本地 Flask 服务。</p>
          </aside>
        </div>
      </section>
      <section className="marketing-section">
        <div className="marketing-section__inner">
          <div className="policy-list">
            {policies.map((policy) => (
              <article key={policy.title}>
                <h2>{policy.title}</h2>
                <p>{policy.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <MarketingCta />
    </main>
  );
}
