import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { getSiteContent } from "../../content";
import { WechatContact } from "../contact/wechat-contact";

const content = getSiteContent();

export function FinalCta() {
  return (
    <section className="home-band final-cta" id="contact">
      <div className="home-band__inner final-cta__inner" data-reveal>
        <div className="final-cta__copy"><h2>{content.home.finalTitle}</h2><p>{content.home.finalDescription}</p>
          <Link className="button button--primary home-button" href="/demo">观看产品演示<ArrowRight aria-hidden="true" size={17} /></Link>
        </div>
        <WechatContact className="final-cta__wechat" />
      </div>
    </section>
  );
}
