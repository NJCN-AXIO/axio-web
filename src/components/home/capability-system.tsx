import { ArrowUpRight } from "lucide-react";

import type { CapabilityGroup } from "../../content";
import { getSiteContent } from "../../content";

const content = getSiteContent();

export function CapabilitySystem({
  groups,
}: {
  groups: readonly CapabilityGroup[];
}) {
  return (
    <section className="home-band home-band--capabilities" id="capabilities">
      <div className="home-band__inner">
        <header className="home-section-heading" data-reveal>
          <p className="home-eyebrow">CAPABILITY MATRIX / CURRENT + ROADMAP</p>
          <h2>{content.home.capabilitiesTitle}</h2>
          <p>{content.home.capabilitiesDescription}</p>
        </header>
        <div className="capability-grid">
          {groups.map((group, index) => (
            <article className="capability-group" data-reveal key={group.id}>
              <header>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{group.title}</h3>
                <ArrowUpRight aria-hidden="true" size={20} />
              </header>
              <ul>
                {group.items.map((item) => (
                  <li key={item.label}>
                    <span
                      className={`status status--${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
