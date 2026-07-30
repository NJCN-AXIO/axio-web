import type { Metadata } from "next";

import { MarketingCta } from "../../../components/marketing/marketing-cta";

export const metadata: Metadata = {
  title: "\u670d\u52a1\u6761\u6b3e",
  description:
    "\u4e86\u89e3 AXIO \u5b98\u7f51\u548c\u54a8\u8be2\u670d\u52a1\u3001\u672c\u5730\u5ba2\u6237\u7aef\u6267\u884c\u4e0e\u4ea4\u4ed8\u786e\u8ba4\u8fb9\u754c\u3002",
};

const terms = [
  {
    title: "\u5b98\u7f51\u670d\u52a1\u8303\u56f4",
    description:
      "\u5b98\u7f51\u7528\u4e8e\u4ea7\u54c1\u4ecb\u7ecd\u3001\u4ea7\u54c1\u6f14\u793a\u548c\u540e\u7eed\u6388\u6743\u5ba2\u6237\u7aef\u8bbf\u95ee\uff0c\u4e0d\u76f4\u63a5\u6267\u884c\u5e97\u94fa\u81ea\u52a8\u5316\u3002",
  },
  {
    title: "\u672c\u5730\u6267\u884c\u8d23\u4efb",
    description:
      "\u81ea\u52a8\u5316\u4efb\u52a1\u7531\u5ba2\u6237\u73af\u5883\u4e2d\u7684\u672c\u5730 Windows \u5ba2\u6237\u7aef\u6267\u884c\u3002",
  },
  {
    title: "\u4ea4\u6613\u8fb9\u754c",
    description:
      "\u5b98\u7f51\u4e0d\u63d0\u4f9b\u5728\u7ebf\u4ed8\u6b3e\u6216\u81ea\u52a8\u6210\u4ea4\u529f\u80fd\u3002",
  },
  {
    title: "\u4ea4\u4ed8\u786e\u8ba4",
    description:
      "\u7248\u672c\u3001\u6388\u6743\u3001\u6e90\u7801\u6216\u79c1\u6709\u5316\u90e8\u7f72\u8303\u56f4\uff0c\u4ee5\u53cc\u65b9\u540e\u7eed\u786e\u8ba4\u7684\u6b63\u5f0f\u5b9e\u65bd\u5185\u5bb9\u4e3a\u51c6\u3002",
  },
] as const;

export default function TermsPage() {
  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div className="marketing-hero__inner">
          <div>
            <p className="marketing-eyebrow">LEGAL / TERMS</p>
            <h1>{"\u670d\u52a1\u6761\u6b3e"}</h1>
            <p className="marketing-hero__lead">
              {
                "AXIO \u5b98\u7f51\u3001\u6388\u6743\u5ba2\u6237\u7aef\u4e0e\u5ba2\u6237\u672c\u5730\u7ecf\u8425\u73af\u5883\u4e4b\u95f4\u7684\u57fa\u672c\u8d23\u4efb\u8fb9\u754c\u3002\u6b63\u5f0f\u9500\u552e\u524d\u5c06\u8865\u5145\u8fd0\u8425\u4e3b\u4f53\u4e0e\u751f\u6548\u65e5\u671f\u3002"
              }
            </p>
          </div>
          <aside className="marketing-hero__aside">
            <strong>
              {
                "\u5b98\u7f51\u662f\u4ecb\u7ecd\u3001\u54a8\u8be2\u4e0e\u64cd\u4f5c\u5165\u53e3"
              }
            </strong>
            <p>
              {
                "\u5b9e\u9645\u81ea\u52a8\u5316\u6267\u884c\u4fdd\u7559\u5728\u5ba2\u6237\u672c\u5730\u73af\u5883\u3002"
              }
            </p>
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
