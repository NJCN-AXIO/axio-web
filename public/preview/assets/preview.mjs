import { PREVIEW_WORKSPACES } from "./preview-data.mjs";
import {
  assertValidWorkspace,
  WORKFLOW_STAGES,
  createPreviewState,
  deriveSiteRoot,
  reducePreviewState,
} from "./preview-state.mjs";

let state = createPreviewState();
const nav = document.querySelector("[data-preview-nav]");
const main = document.querySelector("[data-preview-main]");
const sidebar = document.querySelector("[data-preview-sidebar]");
const menuButton = document.querySelector("[data-menu-button]");
const toast = document.querySelector("[data-preview-toast]");
const mobileNavigation = window.matchMedia("(max-width: 680px)");
const backgroundLinks = document.querySelectorAll(
  "[data-site-home], [data-book-demo]",
);

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function renderNav() {
  nav.replaceChildren();
  nav.id = "preview-navigation";
  for (const workspace of PREVIEW_WORKSPACES) {
    const button = element("button", "preview-nav-item", workspace.navLabel);
    button.type = "button";
    button.dataset.workspace = workspace.id;
    button.setAttribute(
      "aria-current",
      state.activeWorkspace === workspace.id ? "page" : "false",
    );
    nav.append(button);
  }
  sidebar.dataset.open = String(state.navOpen);
  menuButton.setAttribute("aria-expanded", String(state.navOpen));
  const drawerOpen = mobileNavigation.matches && state.navOpen;
  sidebar.inert = mobileNavigation.matches && !state.navOpen;
  main.inert = drawerOpen;
  backgroundLinks.forEach((link) => {
    link.inert = drawerOpen;
  });
}

function renderWorkspace() {
  const workspace = PREVIEW_WORKSPACES.find(
    ({ id }) => id === state.activeWorkspace,
  );
  if (!workspace) {
    const failure = element("section", "preview-empty");
    failure.append(
      element("h1", "", "预览数据暂不可用"),
      element("p", "", "请返回运营总览继续浏览。"),
    );
    main.replaceChildren(failure);
    return;
  }

  try {
    assertValidWorkspace(workspace);
  } catch {
    const failure = element("section", "preview-empty");
    failure.append(
      element("h1", "", "预览数据暂不可用"),
      element("p", "", "请返回运营总览继续浏览。"),
    );
    main.replaceChildren(failure);
    return;
  }

  const header = element("header", "workspace-header");
  header.append(
    element("p", "workspace-eyebrow", workspace.eyebrow),
    element("h1", "", workspace.title),
    element("p", "workspace-description", workspace.description),
  );

  const stats = element("section", "stats-grid");
  stats.setAttribute("aria-label", "关键指标");
  for (const [label, value] of workspace.stats) {
    const card = element("article", "stat-card");
    card.append(element("span", "", label), element("strong", "", value));
    stats.append(card);
  }

  const table = element("section", "workspace-table");
  table.append(element("h2", "", "当前工作区"));
  const rows = element("div", "workspace-rows");
  for (const [label, status, detail] of workspace.rows) {
    const row = element("article", "workspace-row");
    row.append(
      element("strong", "", label),
      element("span", "workspace-status", status),
      element("p", "", detail),
    );
    rows.append(row);
  }
  table.append(rows);

  const children = [header, stats, table];
  if (workspace.id === "task") {
    const workflow = element("section", "task-workflow");
    workflow.append(element("h2", "", "模拟任务状态"));
    const stages = element("ol", "task-stages");
    const activeIndex = WORKFLOW_STAGES.indexOf(state.taskStage);
    const labels = ["草稿", "预览", "已确认", "已回读"];
    WORKFLOW_STAGES.forEach((stage, index) => {
      const item = element(
        "li",
        index <= activeIndex ? "is-complete" : "",
        labels[index],
      );
      item.dataset.stage = stage;
      stages.append(item);
    });
    const action = element(
      "button",
      "button button--primary",
      state.taskStage === "verified" ? "模拟回读已完成" : "推进模拟任务",
    );
    action.type = "button";
    action.dataset.taskAction = "";
    action.disabled = state.taskStage === "verified";
    workflow.append(stages, action);
    children.push(workflow);
  }
  main.replaceChildren(...children);
}

function render() {
  renderNav();
  renderWorkspace();
}

const siteRoot = deriveSiteRoot(window.location.pathname);
document.querySelectorAll("[data-site-home]").forEach((link) => {
  link.href = siteRoot;
});
document.querySelector("[data-book-demo]").href = `${siteRoot}demo/`;

document.addEventListener("click", (event) => {
  const workspaceButton = event.target.closest("[data-workspace]");
  if (workspaceButton) {
    state = reducePreviewState(state, {
      type: "select-workspace",
      id: workspaceButton.dataset.workspace,
    });
    render();
    main.focus({ preventScroll: true });
    return;
  }
  if (event.target.closest("[data-menu-button]")) {
    state = reducePreviewState(state, { type: "toggle-nav" });
    renderNav();
    if (mobileNavigation.matches && state.navOpen) {
      nav.querySelector('[aria-current="page"]')?.focus();
    } else {
      menuButton.focus();
    }
    return;
  }
  if (event.target.closest("[data-task-action]")) {
    state = reducePreviewState(state, { type: "advance-task" });
    renderWorkspace();
    showToast("模拟状态已更新，不会执行真实任务");
  }
});

document.addEventListener("keydown", (event) => {
  if (!mobileNavigation.matches || !state.navOpen) return;

  if (event.key === "Escape") {
    event.preventDefault();
    state = reducePreviewState(state, { type: "close-nav" });
    renderNav();
    menuButton.focus();
    return;
  }

  if (event.key !== "Tab") return;
  const focusable = [
    menuButton,
    ...nav.querySelectorAll("button:not(:disabled)"),
  ];
  const currentIndex = focusable.indexOf(document.activeElement);
  const nextIndex = event.shiftKey
    ? (currentIndex - 1 + focusable.length) % focusable.length
    : (currentIndex + 1) % focusable.length;
  event.preventDefault();
  focusable[nextIndex].focus();
});

mobileNavigation.addEventListener("change", () => {
  if (!mobileNavigation.matches && state.navOpen) {
    state = reducePreviewState(state, { type: "close-nav" });
  }
  renderNav();
});

render();
