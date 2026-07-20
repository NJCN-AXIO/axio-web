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
                <span>正式售价 {option.regularPrice} / 年</span>
                <div>
                  <strong>{option.launchPrice}</strong>
                  <small>/ 年 · {option.launchLabel}</small>
                </div>
              </div>
              <p>{option.description}</p>
              <Link href="/demo">
                查看方案 <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
