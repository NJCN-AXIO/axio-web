import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { PackageOption } from "../../content";

type PackageSet = readonly [PackageOption, PackageOption, PackageOption];

export function PackageComparison({ packages }: { packages: PackageSet }) {
  return (
    <div className="package-comparison" data-testid="package-comparison">
      <div className="package-comparison__grid">
        {packages.map((option, index) => (
          <article
            className="package-comparison__option"
            data-featured={option.featured ? "true" : undefined}
            data-testid={"package-" + option.name.toLowerCase()}
            key={option.name}
          >
            <div className="package-comparison__index">
              <span>0{index + 1}</span>
              {option.featured ? <strong>{"\u63a8\u8350"}</strong> : null}
            </div>
            <h2>{option.name}</h2>
            <p className="package-comparison__audience">{option.audience}</p>
            <div className="package-comparison__price">
              <span>
                {"\u6807\u51c6\u4ef7"} <b>{option.regularPrice}</b> / {"\u6708"}
              </span>
              <div>
                <strong>{option.launchPrice}</strong>
                <small>
                  / {"\u6708"} {"\u9996\u53d1"} {option.launchLabel}
                </small>
              </div>
            </div>
            <p>{option.description}</p>
            <p className="package-comparison__delivery">{option.delivery}</p>
            <Link href="/demo">
              观看产品演示
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
