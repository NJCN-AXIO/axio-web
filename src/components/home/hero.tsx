import { ArrowRight, Maximize2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { withBasePath } from "../../config/site-path";
import { getSiteContent } from "../../content";

const content = getSiteContent();
const heroEvidenceSrc = withBasePath(
  "/images/product-evidence/control-center.webp",
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
          <a
            aria-label="全景查看 AXIO 店群运营控制台"
            className="hero__product-link"
            href={heroEvidenceSrc}
            rel="noreferrer"
            target="_blank"
          >
            <Image
              alt="AXIO 店群运营控制台全景"
              className="hero__product-image"
              data-testid="hero-product-evidence"
              height={1258}
              priority
              sizes="(max-width: 960px) 100vw, (max-width: 1199px) 58vw, 72vw"
              src={heroEvidenceSrc}
              width={1543}
            />
            <span aria-hidden="true" className="hero__product-expand">
              <Maximize2 size={16} strokeWidth={2} />
              查看全景
            </span>
          </a>
        </figure>
      </div>
    </section>
  );
}
