import { getSiteContent } from "../../content";

const content = getSiteContent();

export function ProofStrip() {
  return (
    <section aria-label="运营规模证据" className="proof-strip" id="proof">
      <div className="proof-strip__inner">
        {content.proofValues.map((proof) => (
          <div className="proof-strip__item" data-reveal key={proof.value}>
            <strong>{proof.value}</strong>
            <span>{proof.label}</span>
          </div>
        ))}
        <div
          className="proof-strip__item proof-strip__item--monitor"
          data-reveal
        >
          <strong>受控任务监控</strong>
          <span>预览、确认、执行、回读</span>
        </div>
      </div>
    </section>
  );
}
