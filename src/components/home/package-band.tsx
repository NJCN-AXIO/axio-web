import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { getSiteContent } from "../../content";

const content = getSiteContent();

export function PackageBand() {
  return (
    <section
      className="home-band home-band--packages"
      data-testid="package-band"
      id="packages"
    >
      <div className="home-band__inner">
        <header className="home-section-heading" data-reveal>
          <h2>{content.home.packagesTitle}</h2>
          <p>{content.home.packagesDescription}</p>
        </header>
        <div className="package-grid">
          {content.packages.map((option, index) => (
            <article
              className="package-option"
              data-featured={option.featured ? "true" : undefined}
              data-reveal
              key={option.name}
            >
              <span>0{index + 1}</span>
              <h3>{option.name}</h3>
              <strong>{option.audience}</strong>
              <div className="package-option__price">
                <span>
                  {"\u6807\u51c6\u4ef7"} {option.regularPrice} / {"\u6708"}
                </span>
                <div>
                  <strong>{option.launchPrice}</strong>
                  <small>
                    / {"\u6708"} {"\u9996\u53d1"} {option.launchLabel}
                  </small>
                </div>
              </div>
              <p>{option.description}</p>
              <Link href="/demo">
                观看产品演示 <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
