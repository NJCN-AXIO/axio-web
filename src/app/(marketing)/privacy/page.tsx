import type { Metadata } from "next";

import { MarketingCta } from "../../../components/marketing/marketing-cta";

export const metadata: Metadata = {
  title: "\u9690\u79c1\u653f\u7b56",
  description:
    "\u5b98\u7f51\u4e0d\u63d0\u4f9b\u6f14\u793a\u9884\u7ea6\u8868\u5355\uff0c\u4e5f\u4e0d\u6536\u96c6\u7528\u4e8e\u9884\u7ea6\u6f14\u793a\u7684\u4e2a\u4eba\u4fe1\u606f\u3002",
  alternates: { canonical: "/privacy/" },
};

const policies = [
  {
    title: "\u5b98\u7f51\u6536\u96c6\u7684\u4fe1\u606f",
    description:
      "\u5b98\u7f51\u4e0d\u63d0\u4f9b\u6f14\u793a\u9884\u7ea6\u8868\u5355\uff0c\u4e5f\u4e0d\u6536\u96c6\u7528\u4e8e\u9884\u7ea6\u6f14\u793a\u7684\u4e2a\u4eba\u4fe1\u606f\u3002",
  },
  {
    title: "\u5e73\u53f0\u51ed\u8bc1\u8fb9\u754c",
    description:
      "\u5b98\u7f51\u4e0d\u6536\u96c6\u4efb\u4f55\u7535\u5546\u5e73\u53f0\u8d26\u53f7\u3001\u5bc6\u7801\u3001Cookie \u6216\u6d4f\u89c8\u5668\u914d\u7f6e\u3002",
  },
  {
    title: "\u672c\u5730\u5ba2\u6237\u7aef",
    description:
      "\u81ea\u52a8\u5316\u5728\u5ba2\u6237\u7684 Windows \u73af\u5883\u4e2d\u6267\u884c\uff0c\u5e73\u53f0\u51ed\u8bc1\u4e0e\u6d4f\u89c8\u5668\u914d\u7f6e\u4fdd\u7559\u5728\u5ba2\u6237\u73af\u5883\u3002",
  },
  {
    title: "\u8054\u7cfb\u4e0e\u8bf7\u6c42",
    description:
      "\u5982\u9700\u67e5\u8be2\u3001\u66f4\u6b63\u6216\u5220\u9664\u4e2a\u4eba\u4fe1\u606f\uff0c\u53ef\u901a\u8fc7\u5b98\u7f51\u516c\u5f00\u7684\u8054\u7cfb\u6e20\u9053\u63d0\u51fa\u8bf7\u6c42\u3002",
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div className="marketing-hero__inner">
          <div>
            <p className="marketing-eyebrow">LEGAL / PRIVACY</p>
            <h1>{"\u9690\u79c1\u653f\u7b56"}</h1>
            <p className="marketing-hero__lead">
              {
                "AXIO \u5b98\u7f51\u4ecb\u7ecd\u4ea7\u54c1\u4e0e\u672c\u5730\u5ba2\u6237\u7aef\u7684\u4fe1\u606f\u8fb9\u754c\u3002\u6b63\u5f0f\u516c\u5f00\u9500\u552e\u524d\uff0c\u653f\u7b56\u5c06\u7ed3\u5408\u5b9e\u9645\u8fd0\u8425\u4e3b\u4f53\u4e0e\u8054\u7cfb\u6e20\u9053\u66f4\u65b0\u3002"
              }
            </p>
          </div>
          <aside className="marketing-hero__aside">
            <strong>
              {"\u654f\u611f\u51ed\u8bc1\u7559\u5728\u5ba2\u6237\u73af\u5883"}
            </strong>
            <p>
              {
                "\u5b98\u7f51\u4e0d\u4f1a\u4ee3\u7406\u8bbf\u95ee\u672c\u5730 Flask \u670d\u52a1\u3002"
              }
            </p>
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
