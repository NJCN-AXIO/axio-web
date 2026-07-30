import { ArrowRight, ShieldCheck } from "lucide-react";

import { withBasePath } from "../../config/site-path";

export function ProductPreviewStage() {
  return (
    <section
      className="marketing-preview-stage"
      data-testid="demo-interactive-preview"
    >
      <div className="marketing-preview-stage__inner">
        <div className="marketing-preview-stage__copy">
          <p className="marketing-eyebrow">INTERACTIVE PRODUCT PREVIEW</p>
          <h2>
            {
              "\u5148\u4f53\u9a8c\uff0c\u518d\u89c2\u770b\u5b8c\u6574\u6f14\u793a"
            }
          </h2>
          <p>
            浏览 AXIO 的运营总览、选品决策、精准定价、智能优化与受控执行流程。
          </p>
          <a
            className="button button--primary"
            href={withBasePath("/preview/")}
          >
            进入交互预览 <ArrowRight aria-hidden="true" size={17} />
          </a>
        </div>
        <aside className="marketing-preview-stage__boundary">
          <ShieldCheck aria-hidden="true" size={22} />
          <div>
            <strong>公开演示环境</strong>
            <p>使用虚构数据，不连接店铺，也不会执行真实任务。</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
