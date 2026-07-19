import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { getSiteContent } from "../../content";

const content = getSiteContent();

export function FinalCta() {
  return (
    <section className="home-band final-cta" id="contact">
      <div className="home-band__inner final-cta__inner" data-reveal>
        <div>
          <h2>{content.home.finalTitle}</h2>
          <p>{content.home.finalDescription}</p>
        </div>
        <Link className="button button--primary home-button" href="/demo">
          预约演示
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </section>
  );
}
