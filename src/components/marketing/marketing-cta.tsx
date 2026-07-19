import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function MarketingCta({
  title = "结合你的店群规模，查看适配路径",
  description = "预约演示，了解 AXIO 如何接入当前团队的选品、定价、上架与存量经营流程。",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="marketing-cta">
      <div className="marketing-cta__inner">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Link className="button button--primary" href="/demo">
          预约产品演示
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </section>
  );
}
