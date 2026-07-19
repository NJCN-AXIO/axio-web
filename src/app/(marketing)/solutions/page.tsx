import type { Metadata } from "next";

import { MarketingCta } from "../../../components/marketing/marketing-cta";

export const metadata: Metadata = {
  title: "解决方案",
  description: "按跨境卖家的团队协作方式与店群规模规划 AXIO 智核交付路径。",
};

const solutions = [
  {
    audience: "起步卖家",
    scale: "1 至 9 家店",
    summary: "先建立可预览、可确认、可回读的标准运营流程。",
    points: ["多来源选品与任务配置", "六站点定价口径", "标准客户端交付"],
  },
  {
    audience: "成长团队",
    scale: "10 至 49 家店",
    summary: "把多人、多站点和多批次任务放进一致的执行边界。",
    points: ["店群任务编排", "风险预览与确认", "存量 Listing 经营"],
  },
  {
    audience: "店群与服务商",
    scale: "50 至 200 家店",
    summary: "围绕组织权限、交付边界与经营证据规划规模化运行。",
    points: ["矩阵分组与六站点运营", "业务结果回读", "源码或私有化部署规划"],
  },
] as const;

export default function SolutionsPage() {
  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div className="marketing-hero__inner">
          <div>
            <p className="marketing-eyebrow">SOLUTIONS / OPERATING SCALE</p>
            <h1>从 1 家店到 200 家店</h1>
            <p className="marketing-hero__lead">
              经营规模变化时，团队真正需要调整的是任务边界、协作方式与结果验收，而不只是增加自动化次数。
            </p>
          </div>
          <aside className="marketing-hero__aside">
            <strong>按真实经营阶段规划交付</strong>
            <p>站点、店铺数量和团队职责共同决定适配路径。</p>
          </aside>
        </div>
      </section>
      <section className="marketing-section marketing-section--surface">
        <div className="marketing-section__inner">
          <header className="marketing-section__heading">
            <h2>不同规模，同一套可核验边界</h2>
            <p>从标准流程起步，再逐步扩展店群编排、风险控制与组织级交付。</p>
          </header>
          <div className="solution-grid">
            {solutions.map((solution, index) => (
              <article key={solution.audience}>
                <span className="solution-grid__index">0{index + 1}</span>
                <h2>{solution.audience}</h2>
                <strong>{solution.scale}</strong>
                <p>{solution.summary}</p>
                <ul>
                  {solution.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
      <MarketingCta />
    </main>
  );
}
