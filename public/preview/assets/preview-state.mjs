import { PREVIEW_WORKSPACES } from "./preview-data.mjs";

export const WORKFLOW_STAGES = Object.freeze([
  "draft",
  "preview",
  "confirmed",
  "verified",
]);

const workspaceIds = new Set(PREVIEW_WORKSPACES.map(({ id }) => id));

function isText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function assertValidWorkspace(workspace) {
  if (!workspace || typeof workspace !== "object") {
    throw new TypeError("Invalid workspace");
  }
  for (const field of ["id", "navLabel", "eyebrow", "title", "description"]) {
    if (!isText(workspace[field])) {
      throw new TypeError(`Invalid workspace ${field}`);
    }
  }
  if (!Array.isArray(workspace.stats) || workspace.stats.length === 0) {
    throw new TypeError("Invalid workspace stats");
  }
  if (
    workspace.stats.some(
      (pair) =>
        !Array.isArray(pair) ||
        pair.length !== 2 ||
        pair.some((value) => !isText(value)),
    )
  ) {
    throw new TypeError("Invalid workspace stats");
  }
  if (!Array.isArray(workspace.rows) || workspace.rows.length === 0) {
    throw new TypeError("Invalid workspace rows");
  }
  if (
    workspace.rows.some(
      (row) =>
        !Array.isArray(row) ||
        row.length !== 3 ||
        row.some((value) => !isText(value)),
    )
  ) {
    throw new TypeError("Invalid workspace rows");
  }
  return workspace;
}

export function createPreviewState() {
  return { activeWorkspace: "dashboard", navOpen: false, taskStage: "draft" };
}

export function reducePreviewState(state, action) {
  if (action.type === "select-workspace") {
    if (!workspaceIds.has(action.id)) {
      throw new Error(`Unknown workspace: ${action.id}`);
    }
    return { ...state, activeWorkspace: action.id, navOpen: false };
  }
  if (action.type === "toggle-nav") {
    return { ...state, navOpen: !state.navOpen };
  }
  if (action.type === "close-nav") {
    return { ...state, navOpen: false };
  }
  if (action.type === "advance-task") {
    const index = WORKFLOW_STAGES.indexOf(state.taskStage);
    const next =
      WORKFLOW_STAGES[Math.min(index + 1, WORKFLOW_STAGES.length - 1)];
    return { ...state, taskStage: next };
  }
  throw new Error(`Unknown preview action: ${action.type}`);
}

export function deriveSiteRoot(pathname) {
  const marker = "/preview/";
  const index = pathname.indexOf(marker);
  if (index < 0) throw new Error(`Expected preview path: ${pathname}`);
  return pathname.slice(0, index + 1) || "/";
}
