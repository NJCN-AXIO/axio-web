const sections = [
  ["top", "01"],
  ["loop", "02"],
  ["core-workflow", "03"],
  ["capabilities", "04"],
  ["overview-video", "05"],
  ["contact", "06"],
] as const;

export function ProgressRail() {
  return (
    <nav aria-label="首页章节" className="progress-rail">
      {sections.map(([id, label]) => (
        <a aria-label={`跳转到第 ${label} 章`} href={`#${id}`} key={id}>
          {label}
        </a>
      ))}
    </nav>
  );
}
