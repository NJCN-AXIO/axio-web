export function deriveSiteRoot(pathname) {
  const marker = "/preview/";
  const index = pathname.indexOf(marker);
  if (index < 0) throw new Error(`Expected preview path: ${pathname}`);
  return pathname.slice(0, index + 1) || "/";
}

function mountSiteHome() {
  const footer = document.querySelector(".sidebar-footer");
  if (!footer || footer.querySelector("[data-site-home]")) return;

  const link = document.createElement("a");
  link.className = "btn btn-primary";
  link.dataset.siteHome = "";
  link.href = deriveSiteRoot(window.location.pathname);
  link.textContent = "返回 AXIO 官网";
  link.style.width = "100%";
  link.style.marginBottom = "10px";
  footer.prepend(link);
}

function mountMobileDrawer() {
  const sidebar = document.querySelector(".sidebar");
  const main = document.querySelector(".main-content");
  if (!sidebar || !main) return;

  sidebar.dataset.previewSidebar = "";
  main.dataset.previewMain = "";

  const menu = document.createElement("button");
  menu.type = "button";
  menu.className = "preview-menu";
  menu.dataset.previewMenu = "";
  menu.setAttribute("aria-label", "功能导航");
  menu.setAttribute("aria-expanded", "false");
  menu.textContent = "☰";

  const overlay = document.createElement("button");
  overlay.type = "button";
  overlay.className = "preview-drawer-overlay";
  overlay.dataset.previewOverlay = "";
  overlay.setAttribute("aria-label", "关闭功能导航");
  overlay.hidden = true;

  const media = window.matchMedia("(max-width: 900px)");
  const setOpen = (open, restoreFocus = false) => {
    const mobile = media.matches;
    const nextOpen = mobile && open;
    sidebar.dataset.open = String(nextOpen);
    sidebar.inert = mobile && !nextOpen;
    menu.setAttribute("aria-expanded", String(nextOpen));
    overlay.hidden = !nextOpen;
    document.body.classList.toggle("preview-drawer-open", nextOpen);
    if (!nextOpen && restoreFocus) menu.focus();
  };

  menu.addEventListener("click", () => {
    setOpen(menu.getAttribute("aria-expanded") !== "true");
  });
  overlay.addEventListener("click", () => setOpen(false, true));
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menu.getAttribute("aria-expanded") === "true"
    ) {
      setOpen(false, true);
    }
  });
  sidebar.addEventListener("click", (event) => {
    if (
      media.matches &&
      event.target.closest(".nav-item, .nav-subitem, [data-site-home]")
    ) {
      setOpen(false);
    }
  });
  media.addEventListener("change", () => setOpen(false));

  document.body.prepend(overlay);
  document.body.prepend(menu);
  setOpen(false);
}

document.documentElement.dataset.previewMode = "local";
document.title = "AXIO 智核 - 在线体验";
mountSiteHome();
mountMobileDrawer();
