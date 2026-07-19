import type { CapabilityGroup } from "../../content";

export function CapabilityList({
  groups,
}: {
  groups: readonly CapabilityGroup[];
}) {
  return (
    <div className="capability-list">
      {groups.map((group, index) => (
        <section className="capability-list__group" key={group.id}>
          <header>
            <span className="capability-list__index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2>{group.title}</h2>
          </header>
          <ul>
            {group.items.map((item) => (
              <li key={item.label}>
                <span
                  className={`capability-status capability-status--${item.status.toLowerCase()}`}
                >
                  {item.status}
                </span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
