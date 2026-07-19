const themeScript = `(() => {
  let theme = "light";
  try {
    if (localStorage.getItem("axio-theme") === "dark") theme = "dark";
  } catch {}
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
