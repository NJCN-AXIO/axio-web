import Image from "next/image";

import { withBasePath } from "../../config/site-path";
import { getSiteContent } from "../../content";

const content = getSiteContent();

const evidenceAssets = [
  {
    alt: "AXIO AI 主管与任务编排界面",
    contentIndex: 0,
    height: 261,
    src: "/images/product-evidence/supervisor.webp",
    width: 1600,
  },
  {
    alt: "AXIO 新建上架任务与精准定价界面",
    contentIndex: 1,
    height: 1823,
    src: "/images/product-evidence/task-pricing.webp",
    width: 1600,
  },
  {
    alt: "AXIO 违禁管控与风险词库界面",
    contentIndex: 3,
    height: 1173,
    src: "/images/product-evidence/risk-control.webp",
    width: 1417,
  },
  {
    alt: "AXIO 站点定价公式与利润反算界面",
    contentIndex: 2,
    height: 1000,
    src: "/images/product-evidence/pricing-formula.webp",
    width: 1395,
  },
] as const;

export function ProductEvidence() {
  return (
    <section
      className="home-band home-band--evidence"
      data-testid="product-evidence"
      id="evidence"
    >
      <div className="home-band__inner evidence-section__inner">
        <header className="home-section-heading" data-reveal>
          <h2>{content.home.evidenceTitle}</h2>
          <p>{content.home.evidenceDescription}</p>
        </header>
        <div className="evidence-showcase">
          {evidenceAssets.map((asset) => {
            const item = content.home.evidenceItems[asset.contentIndex];
            const assetUrl = withBasePath(asset.src);

            return (
              <figure className="evidence-shot" data-reveal key={asset.src}>
                <figcaption className="evidence-shot__caption">
                  <h3>{item.label}</h3>
                  <p>{item.detail}</p>
                </figcaption>
                <a
                  aria-label={"查看" + asset.alt + "高清原图"}
                  className="evidence-shot__media"
                  href={assetUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Image
                    alt={asset.alt}
                    className="evidence-shot__image"
                    height={asset.height}
                    loading="lazy"
                    sizes="(max-width: 1760px) calc(100vw - 40px), 1600px"
                    src={assetUrl}
                    width={asset.width}
                  />
                </a>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
