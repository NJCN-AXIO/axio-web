import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { withBasePath } from "../../config/site-path";
import { getSiteContent } from "../../content";

const content = getSiteContent();
const heroEvidenceSrc = withBasePath(
  "/images/product-evidence/task-pricing.webp",
);

export function Hero() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="home-band hero"
      data-testid="hero"
      id="top"
    >
      <div className="home-band__inner hero__inner">
        <div className="hero__copy" data-reveal>
          <p className="hero__eyebrow">AXIO / OPERATIONS SYSTEM</p>
          <h1 id="home-hero-title">{content.hero.title}</h1>
          <p className="hero__subtitle">{content.hero.subtitle}</p>
          <p className="hero__description">{content.hero.description}</p>
          <div className="hero__actions">
            <Link
              className="button button--primary home-button"
              href={content.hero.primaryCta.href}
            >
              {content.hero.primaryCta.label}
              <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
            </Link>
            <Link
              className="button home-button home-button--secondary"
              href={content.hero.secondaryCta.href}
            >
              {content.hero.secondaryCta.label}
            </Link>
          </div>
        </div>

        <figure className="hero__product" data-reveal>
          <Image
            alt="AXIO 新建上架任务与精准定价工作台"
            className="hero__product-image"
            data-testid="hero-product-evidence"
            height={1823}
            priority
            sizes="(max-width: 960px) 100vw, 46vw"
            src={heroEvidenceSrc}
            width={1600}
          />
        </figure>
      </div>
    </section>
  );
}
