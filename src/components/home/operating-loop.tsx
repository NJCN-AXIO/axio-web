import { ArrowRight } from "lucide-react";

import { getSiteContent } from "../../content";

const content = getSiteContent();

export function OperatingLoop() {
  return (
    <section
      className="home-band home-band--loop"
      data-testid="operating-loop"
      id="loop"
    >
      <div className="home-band__inner">
        <header className="home-section-heading" data-reveal>
          <p className="home-eyebrow">OPERATING LOOP / 06 STAGES</p>
          <h2>{content.home.loopTitle}</h2>
          <p>{content.home.loopDescription}</p>
        </header>
        <ol className="operating-loop" data-reveal>
          {content.operatingLoop.map((step, index) => (
            <li key={step}>
              <span className="operating-loop__number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong>{step}</strong>
              {index < content.operatingLoop.length - 1 ? (
                <ArrowRight aria-hidden="true" size={18} />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
