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

document.documentElement.dataset.previewMode = "local";
document.title = "AXIO 智核 - 在线体验";
mountSiteHome();
