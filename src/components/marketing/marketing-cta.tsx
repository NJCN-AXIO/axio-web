import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function MarketingCta({
  title = "观看产品演示",
  description = "观看 AXIO 如何将任务拆解、证据校验与受控执行串联为可检查流程。",
  secondaryLinks = [],
}: {
  title?: string;
  description?: string;
  secondaryLinks?: readonly { label: string; href: string }[];
}) {
  return (
    <section className="marketing-cta">
      <div className="marketing-cta__inner">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="marketing-cta__actions">
          <Link className="button button--primary" href="/demo">
            观看产品演示
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
          {secondaryLinks.map((link) => (
            <Link
              className="button button--quiet"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
