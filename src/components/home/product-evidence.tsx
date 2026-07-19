import { Bot, Calculator, ScanSearch, ShieldCheck } from "lucide-react";

import { getSiteContent } from "../../content";
import type { EvidenceIconKey } from "../../content/types";

const content = getSiteContent();
const icons: Record<EvidenceIconKey, typeof Bot> = {
  supervisor: Bot,
  collection: ScanSearch,
  pricing: Calculator,
  risk: ShieldCheck,
};

export function ProductEvidence() {
  return (
    <section className="home-band home-band--evidence" id="evidence">
      <div className="home-band__inner">
        <header className="home-section-heading" data-reveal>
          <h2>{content.home.evidenceTitle}</h2>
          <p>{content.home.evidenceDescription}</p>
        </header>
        <div className="evidence-grid" data-reveal>
          {content.home.evidenceItems.map((item, index) => {
            const Icon = icons[item.iconKey];
            return (
              <article className="evidence-item" key={item.iconKey}>
                <Icon aria-hidden="true" size={22} strokeWidth={1.8} />
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.detail}</p>
                </div>
                <span aria-hidden="true">0{index + 1}</span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
