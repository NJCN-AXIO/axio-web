import type { FaqGroup, FaqItem } from "../../content";

function FaqEntry({
  item,
  defaultOpen = false,
}: {
  item: FaqItem;
  defaultOpen?: boolean;
}) {
  return (
    <details className="faq-entry" open={defaultOpen}>
      <summary>{item.question}</summary>
      <p>{item.answer}</p>
    </details>
  );
}

export function FaqList({ groups }: { groups: readonly FaqGroup[] }) {
  const priorityItems = groups.flatMap((group) =>
    group.items.filter((item) => item.priority),
  );

  return (
    <div className="faq-list">
      <section className="faq-priority" data-testid="faq-priority">
        <header className="marketing-section__heading">
          <p className="marketing-eyebrow">FAQ / PRIORITY</p>
          <h2>客户常见问题</h2>
          <p>
            先确认最常见的交付、安装、隐私、自动化和授权边界。点击问题即可展开完整回答。
          </p>
        </header>
        <div className="faq-list__entries">
          {priorityItems.map((item, index) => (
            <FaqEntry defaultOpen={index < 5} item={item} key={item.question} />
          ))}
        </div>
      </section>

      <div className="faq-groups">
        {groups.map((group) => {
          const remainingItems = group.items.filter((item) => !item.priority);

          return (
            <section className="faq-group" key={group.id}>
              <h3>{group.title}</h3>
              <div className="faq-list__entries">
                {remainingItems.map((item) => (
                  <FaqEntry item={item} key={item.question} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
