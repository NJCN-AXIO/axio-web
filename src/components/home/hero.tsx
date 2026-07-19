import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { getSiteContent } from "../../content";
import { OperationsCanvas } from "./operations-canvas";

const content = getSiteContent();

export function Hero() {
  return (
    <section className="home-band hero" data-testid="hero" id="top">
      <div className="hero__canvas" role="presentation">
        <OperationsCanvas />
      </div>
      <div className="home-band__inner hero__inner">
        <div className="hero__copy" data-reveal>
          <h1>{content.hero.title}</h1>
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

        <div
          aria-label="AXIO 运营链路"
          className="hero__operations"
          data-reveal
        >
          <p className="hero__operations-label">OPERATION FIELD / LIVE</p>
          <ol>
            <li>
              <span>01</span> 市场信号接入
            </li>
            <li>
              <span>02</span> 任务与定价编排
            </li>
            <li>
              <span>03</span> 店群受控执行
            </li>
            <li>
              <span>04</span> 经营结果回读
            </li>
          </ol>
          <p className="hero__boundary">凭证与浏览器配置保留在本地环境</p>
        </div>
      </div>
    </section>
  );
}
