import { CheckCircle2 } from "lucide-react";

import { getSiteContent } from "../../content";

const content = getSiteContent();

export function SafetyDeployment() {
  return (
    <section
      className="home-band home-band--safety"
      data-testid="safety-deployment"
      id="deployment"
    >
      <div className="home-band__inner safety-layout">
        <header className="home-section-heading" data-reveal>
          <h2>{content.home.safetyTitle}</h2>
          <p>{content.home.safetyDescription}</p>
        </header>
        <div className="safety-points">
          {content.home.safetyPoints.map((point, index) => (
            <article data-reveal key={point.title}>
              <CheckCircle2 aria-hidden="true" size={24} strokeWidth={1.8} />
              <span>0{index + 1}</span>
              <h3>{point.title}</h3>
              <p>{point.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
