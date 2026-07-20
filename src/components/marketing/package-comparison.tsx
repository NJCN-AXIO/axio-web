import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { PackageOption } from "../../content";

type PackageSet = readonly [PackageOption, PackageOption, PackageOption];

const deliveryByPackage: Record<PackageOption["name"], string> = {
  Starter: "标准客户端与基础流程落地",
  Professional: "多站点协作与店群经营流程",
  Team: "团队使用、优先支持与有限规则配置",
};

export function PackageComparison({ packages }: { packages: PackageSet }) {
  return (
    <div className="package-comparison" data-testid="package-comparison">
      <div className="package-comparison__grid">
        {packages.map((option, index) => (
          <article className="package-comparison__option" key={option.name}>
            <span>0{index + 1}</span>
            <h2>{option.name}</h2>
            <strong>{option.audience}</strong>
            <p>{option.description}</p>
            <p className="package-comparison__delivery">
              {deliveryByPackage[option.name]}
            </p>
            <Link href="/demo">
              联系咨询
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
