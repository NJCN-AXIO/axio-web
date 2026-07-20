import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const PRODUCT_COMMIT = "eef0f87";

export const PAGE_IDS = Object.freeze([
  "dashboard",
  "history",
  "task",
  "stores",
  "selection",
  "hotpick",
  "keywords",
  "orders",
  "tianji",
  "scoring",
  "shopboard",
  "optimize",
  "titlelearn",
  "ipcontrol",
  "config",
]);

const PRODUCT_FILES = Object.freeze({
  index: "web/templates/index.html",
  productCss: "web/static/css/style.css",
  supervisorCss: "web/static/css/supervisor.css",
  productMain: "web/static/js/main.js",
  productSupervisor: "web/static/js/supervisor.js",
  matrix: "web/static/116shop_dashboard.html",
});

const GENERATED_FILES = Object.freeze([
  "index.html",
  "assets/product.css",
  "assets/supervisor.css",
  "assets/product-main.js",
  "assets/product-supervisor.js",
  "assets/matrix.html",
]);

function sanitizeProviderReferences(source) {
  return source
    .replaceAll("AIGCFox", "本地演示 A")
    .replaceAll("GPT 6USS", "本地演示 B")
    .replaceAll("ShitAPI", "本地演示 C")
    .replaceAll("DeepSeek", "本地演示兜底")
    .replaceAll("Agnes", "本地演示图文")
    .replace(/aigcfox/gi, "demo_text_a")
    .replace(/gpt_6uss/gi, "demo_text_b")
    .replace(/6uss/gi, "演示 B")
    .replace(/shitapi/gi, "demo_text_c")
    .replace(/deepseek/gi, "demo_fallback")
    .replace(/agnes/gi, "demo_vision");
}

export function readCommittedFile(repo, commit, path) {
  return execFileSync("git", ["-C", repo, "show", `${commit}:${path}`], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
  });
}

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  const second = first < 0 ? -1 : source.indexOf(before, first + before.length);

  if (first < 0 || second >= 0) {
    throw new Error(`Expected exactly one ${label}`);
  }

  return source.slice(0, first) + after + source.slice(first + before.length);
}

function replacePatternOnce(source, pattern, after, label) {
  const matches = [...source.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${label}`);
  }
  return source.replace(pattern, after);
}

const PRODUCT_BOOTSTRAP = `<script type="module">
import "./assets/demo-transport.mjs";
import "./assets/preview-shell.mjs";

function loadProductScript(source) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = source;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load " + source));
    document.body.append(script);
  });
}

await loadProductScript("./assets/product-main.js");
await loadProductScript("./assets/product-supervisor.js");
const taskNav = document.querySelector('[data-page="task"]');
if (taskNav && typeof globalThis.showPage === "function") {
  globalThis.showPage("task", taskNav);
}
</script>`;

export function transformProductScript(source, label = "product script") {
  const transformed = source
    .replace(/\bfetch\s*\(/g, "demoRequest(")
    .replaceAll("/static/116shop_dashboard.html", "./assets/matrix.html");
  if (transformed === source) {
    throw new Error(`Expected at least one fetch call in ${label}`);
  }
  if (/\bfetch\s*\(/.test(transformed)) {
    throw new Error(`Failed to replace every fetch call in ${label}`);
  }
  return sanitizeProviderReferences(transformed);
}

export function transformIndex(source) {
  let html = replacePatternOnce(
    source,
    /href="\/static\/css\/style\.css[^"]*"/g,
    'href="./assets/product.css"',
    "product stylesheet",
  );
  html = replacePatternOnce(
    html,
    /href="\/static\/css\/supervisor\.css[^"]*"/g,
    'href="./assets/supervisor.css"',
    "supervisor stylesheet",
  );
  html = replacePatternOnce(
    html,
    /src="\/static\/116shop_dashboard\.html"/g,
    'src="./assets/matrix.html"',
    "matrix iframe",
  );
  html = replacePatternOnce(
    html,
    /<script src="\/static\/js\/main\.js[^"]*"><\/script>/g,
    PRODUCT_BOOTSTRAP,
    "product script",
  );
  html = replacePatternOnce(
    html,
    /<script src="\/static\/js\/supervisor\.js[^"]*"><\/script>/g,
    "",
    "supervisor script",
  );
  for (const providerUrl of [
    "https://api.aigcfox.net/v1",
    "https://kt.6uss.top/v1",
    "https://www.shitapi.cn/v1",
  ]) {
    html = replaceOnce(
      html,
      providerUrl,
      "本地模拟地址",
      `provider URL ${providerUrl}`,
    );
  }
  html = html.replaceAll("Shopee Auto", "AXIO 智核");
  html = replaceOnce(
    html,
    'class="nav-item active" data-page="dashboard"',
    'class="nav-item" data-page="dashboard"',
    "dashboard navigation state",
  );
  html = replaceOnce(
    html,
    'class="nav-item" data-page="task"',
    'class="nav-item active" data-page="task"',
    "task navigation state",
  );
  html = replaceOnce(
    html,
    'id="page-dashboard" class="page active dashboard-page"',
    'id="page-dashboard" class="page dashboard-page"',
    "dashboard page state",
  );
  html = replaceOnce(
    html,
    'id="page-task" class="page page-width-normal task-workspace"',
    'id="page-task" class="page active page-width-normal task-workspace"',
    "task page state",
  );

  for (const pageId of PAGE_IDS) {
    const matches = html.match(new RegExp(`id="page-${pageId}"`, "g")) ?? [];
    if (matches.length !== 1) {
      throw new Error(`Expected exactly one page root for ${pageId}`);
    }
  }

  return sanitizeProviderReferences(html);
}

export function transformMatrix(source) {
  let html = replacePatternOnce(
    source,
    /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/xlsx@[^<]+<\/script>\s*/g,
    "",
    "matrix XLSX CDN script",
  );
  html = transformProductScript(html, "matrix page");
  const scriptPattern = /<script>\s*([\s\S]*?)<\/script>\s*<\/body>/g;
  const scripts = [...html.matchAll(scriptPattern)];
  if (scripts.length !== 1) {
    throw new Error("Expected exactly one matrix product script");
  }
  const [match, productSource] = scripts[0];
  const bootstrap = `<script type="text/plain" id="matrix-product-source">
${productSource}
</script>
<script type="module">
import "./demo-transport.mjs";

const productSource = document.querySelector("#matrix-product-source");
const script = document.createElement("script");
script.textContent = productSource.textContent;
document.body.append(script);
</script>
</body>`;
  html =
    html.slice(0, scripts[0].index) +
    bootstrap +
    html.slice(scripts[0].index + match.length);
  return sanitizeProviderReferences(
    html.replaceAll("116店矩阵经营看板", "AXIO 矩阵经营看板"),
  );
}

function writeGeneratedFile(output, relativePath, content) {
  const destination = join(output, relativePath);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, content, "utf8");
}

export function buildFaithfulPreview({
  productRepo,
  output,
  commit = PRODUCT_COMMIT,
}) {
  if (!productRepo || !output) {
    throw new Error("productRepo and output are required");
  }

  const source = Object.fromEntries(
    Object.entries(PRODUCT_FILES).map(([key, path]) => [
      key,
      readCommittedFile(productRepo, commit, path),
    ]),
  );

  const generated = {
    "index.html": transformIndex(source.index),
    "assets/product.css": sanitizeProviderReferences(source.productCss),
    "assets/supervisor.css": sanitizeProviderReferences(source.supervisorCss),
    "assets/product-main.js": transformProductScript(
      source.productMain,
      "main product script",
    ),
    "assets/product-supervisor.js": transformProductScript(
      source.productSupervisor,
      "supervisor product script",
    ),
    "assets/matrix.html": transformMatrix(source.matrix),
  };

  for (const relativePath of GENERATED_FILES) {
    writeGeneratedFile(output, relativePath, generated[relativePath]);
  }

  for (const staleFile of [
    "preview.css",
    "preview.mjs",
    "preview-data.mjs",
    "preview-state.mjs",
  ]) {
    rmSync(join(output, "assets", staleFile), { force: true });
  }

  return [...GENERATED_FILES];
}

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag.startsWith("--") || !value || value.startsWith("--")) {
      throw new Error(`Expected a value after ${flag}`);
    }
    options[flag.slice(2)] = value;
    index += 1;
  }
  return options;
}

function runCli() {
  const options = parseArguments(process.argv.slice(2));
  const generated = buildFaithfulPreview({
    productRepo: options["product-repo"],
    output: options.output,
    commit: options.commit ?? PRODUCT_COMMIT,
  });
  process.stdout.write(
    `Generated ${generated.length} faithful preview files.\n`,
  );
}

const invokedPath = process.argv[1]
  ? pathToFileURL(fileURLToPath(pathToFileURL(process.argv[1]))).href
  : "";
if (invokedPath === import.meta.url) {
  runCli();
}
