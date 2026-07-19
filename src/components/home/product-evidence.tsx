import Image from "next/image";

import { withBasePath } from "../../config/site-path";
import { getSiteContent } from "../../content";

const content = getSiteContent();

const evidenceColumns = [
  [
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
  ],
  [
    {
      alt: "AXIO 图片工作台与身份校验界面",
      contentIndex: 3,
      height: 1349,
      src: "/images/product-evidence/image-workspace.webp",
      width: 1600,
    },
    {
      alt: "AXIO 六站点矩阵定价界面",
      contentIndex: 2,
      height: 954,
      src: "/images/product-evidence/matrix-pricing.webp",
      width: 1600,
    },
  ],
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
          {evidenceColumns.map((column, columnIndex) => (
            <div
              className="evidence-showcase__column"
              key={columnIndex === 0 ? "orchestration" : "workspaces"}
            >
              {column.map((asset) => {
                const item = content.home.evidenceItems[asset.contentIndex];
                return (
                  <figure className="evidence-shot" data-reveal key={asset.src}>
                    <figcaption className="evidence-shot__caption">
                      <h3>{item.label}</h3>
                      <p>{item.detail}</p>
                    </figcaption>
                    <div className="evidence-shot__media">
                      <Image
                        alt={asset.alt}
                        className="evidence-shot__image"
                        height={asset.height}
                        loading="lazy"
                        sizes="(max-width: 899px) 100vw, 48vw"
                        src={withBasePath(asset.src)}
                        width={asset.width}
                      />
                    </div>
                  </figure>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
