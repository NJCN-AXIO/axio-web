import { mkdir, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1440;

const root = resolve(import.meta.dirname, "..");
const outputDir = join(root, "public", "images", "campaigns");
const screenshotPath = join(
  root,
  "public",
  "images",
  "product-evidence",
  "task-pricing.webp",
);
const qrPath = join(root, "public", "images", "contact", "wechat-nay.webp");

export const campaigns = [
  {
    key: "launch-price",
    showPrice: true,
    title: "让重复运营，交给系统执行",
    subtitle: [
      "面向 Shopee 店群，借助妙手 ERP 承接批量执行",
      "可预览 · 可确认 · 可回读",
    ],
  },
  {
    key: "capabilities",
    showPrice: false,
    title: "从经营意图，到业务回读",
    subtitle: [
      "把选品、精准定价、批量上架与存量经营",
      "编排成可预览、可确认、可回读的自动化闭环",
    ],
  },
];

const capabilities = [
  {
    title: "Shopee 店群运营",
    detail: "围绕站点、店群与经营任务组织流程",
  },
  {
    title: "自然语言任务编排",
    detail: "拆解商品来源、数量、站点与策略",
  },
  {
    title: "透明公式精准控价",
    detail: "逐项反算成本、费率、物流与利润",
  },
  {
    title: "妙手 ERP 批量执行",
    detail: "承接上架、改价与存量经营动作",
  },
  {
    title: "违禁与图片风险管控",
    detail: "执行前集中校验品牌、危险词与图片",
  },
  {
    title: "结果回读与矩阵经营",
    detail: "回收结果与异常，驱动下一轮运营",
  },
];

const flow = [
  "市场信号",
  "关键词与商品",
  "任务与定价",
  "预览确认",
  "脚本执行",
  "结果回读",
];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function text(value, x, y, size, color, weight = 400, extra = "") {
  return (
    '<text x="' +
    x +
    '" y="' +
    y +
    '" fill="' +
    color +
    '" font-family="Microsoft YaHei, PingFang SC, Noto Sans CJK SC, Arial, sans-serif" font-size="' +
    size +
    '" font-weight="' +
    weight +
    '" ' +
    extra +
    ">" +
    escapeXml(value) +
    "</text>"
  );
}

function rect(x, y, width, height, fill, stroke = "none") {
  return (
    '<rect x="' +
    x +
    '" y="' +
    y +
    '" width="' +
    width +
    '" height="' +
    height +
    '" rx="6" fill="' +
    fill +
    '" stroke="' +
    stroke +
    '"/>'
  );
}

function capabilityCards(startY) {
  return capabilities
    .map((item, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const x = 60 + column * 326;
      const y = startY + row * 126;
      return [
        rect(x, y, 306, 108, "#14181d", "#2b3138"),
        text(
          String(index + 1).padStart(2, "0"),
          x + 18,
          y + 28,
          13,
          "#ff5a36",
          800,
        ),
        text(item.title, x + 18, y + 57, 20, "#f5f7fa", 700),
        text(item.detail, x + 18, y + 84, 13, "#9fa8b3", 400),
      ].join("");
    })
    .join("");
}

function priceSection() {
  return [
    rect(60, 744, 960, 168, "#11151a", "#343b44"),
    text("PROFESSIONAL / 专业版", 86, 782, 17, "#f5f7fa", 700),
    text("首发限量价", 86, 814, 14, "#ff8b72", 700),
    text("¥699", 82, 886, 74, "#ff5a36", 800),
    text("/ 年", 288, 882, 19, "#b9c0c8", 500),
    text("正式售价  ¥1,999 / 年", 430, 800, 18, "#d7dce2", 600),
    text("仅限首发 20 席", 430, 842, 24, "#f5f7fa", 750),
    text(
      "Starter ¥399 / 年   ·   Team ¥1,999 / 年",
      430,
      878,
      16,
      "#b9c0c8",
      500,
    ),
    text(
      "定制部署 ¥6,800 起   ·   源码交付单独报价",
      60,
      1214,
      16,
      "#d7dce2",
      600,
    ),
  ].join("");
}

function flowSection() {
  const cells = flow
    .map((item, index) => {
      const x = 60 + index * 160;
      return [
        text(String(index + 1).padStart(2, "0"), x, 774, 12, "#ff5a36", 800),
        text(item, x, 807, 17, "#f5f7fa", 700),
        index < flow.length - 1
          ? text("→", x + 132, 805, 19, "#59636e", 500)
          : "",
      ].join("");
    })
    .join("");
  return [
    rect(42, 740, 996, 92, "#11151a", "#343b44"),
    cells,
    text(
      "看得见的判断 · 受控的执行 · 可追溯的结果",
      60,
      1190,
      21,
      "#56b98a",
      700,
    ),
  ].join("");
}

function buildPosterSvg(campaign) {
  const cardsY = campaign.showPrice ? 936 : 858;
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440">',
    "<defs>",
    '<pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">',
    '<path d="M 48 0 L 0 0 0 48" fill="none" stroke="#242a31" stroke-width="1" opacity="0.28"/>',
    "</pattern>",
    "</defs>",
    '<rect width="1080" height="1440" fill="#0b0d10"/>',
    '<rect width="1080" height="1440" fill="url(#grid)"/>',
    '<rect x="0" y="0" width="8" height="1440" fill="#ff5a36"/>',
    text("AXIO 智核", 60, 66, 28, "#ff5a36", 800),
    text("SHOPEE OPERATIONS SYSTEM", 292, 64, 14, "#8e98a4", 700),
    text(campaign.title, 60, 142, 54, "#f5f7fa", 800),
    text(campaign.subtitle[0], 60, 194, 20, "#c8ced5", 500),
    text(campaign.subtitle[1], 60, 226, 18, "#8e98a4", 500),
    rect(60, 252, 960, 464, "#11151a", "#3a424c"),
    text("实机界面 · 新建上架任务与精准定价", 80, 282, 15, "#d7dce2", 650),
    campaign.showPrice ? priceSection() : flowSection(),
    capabilityCards(cardsY),
    rect(42, 1236, 996, 164, "#11151a", "#343b44"),
    text("WINDOWS 本地客户端", 66, 1276, 15, "#56b98a", 800),
    text("敏感凭证留在客户环境", 66, 1310, 22, "#f5f7fa", 700),
    text("扫码添加微信，预约产品演示", 66, 1350, 17, "#aeb6bf", 500),
    text("楠 Nay", 760, 1324, 17, "#f5f7fa", 700),
    "</svg>",
  ].join("");
}

async function prepareScreenshot() {
  return sharp(screenshotPath)
    .extract({ left: 0, top: 650, width: 1600, height: 1173 })
    .resize(920, 400, { fit: "cover", position: "centre" })
    .webp({ quality: 94 })
    .toBuffer();
}

async function prepareQr() {
  return sharp(qrPath)
    .resize(150, 150, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      kernel: "nearest",
    })
    .png()
    .toBuffer();
}

export async function renderCampaignPosters() {
  await mkdir(outputDir, { recursive: true });
  const [screenshot, qr] = await Promise.all([
    prepareScreenshot(),
    prepareQr(),
  ]);
  const outputs = [];

  for (const campaign of campaigns) {
    const composed = await sharp(Buffer.from(buildPosterSvg(campaign)))
      .composite([
        { input: screenshot, left: 80, top: 298 },
        { input: qr, left: 860, top: 1238 },
      ])
      .png({ compressionLevel: 9 })
      .toBuffer();
    const baseName =
      campaign.key === "launch-price"
        ? "axio-launch-price-poster"
        : "axio-capabilities-poster";
    const pngPath = join(outputDir, baseName + ".png");
    const jpegPath = join(outputDir, baseName + ".jpg");

    await sharp(composed).png({ compressionLevel: 9 }).toFile(pngPath);
    await sharp(composed)
      .flatten({ background: "#0b0d10" })
      .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
      .toFile(jpegPath);

    outputs.push(
      { path: pngPath, format: "png" },
      { path: jpegPath, format: "jpeg" },
    );
  }

  return outputs;
}

export async function assertCampaignAssets(outputs) {
  if (outputs.length !== 4) {
    throw new Error("Campaign renderer must produce exactly four assets.");
  }

  for (const output of outputs) {
    const file = await stat(output.path);
    const metadata = await sharp(output.path).metadata();
    const expectedFormat = extname(output.path) === ".png" ? "png" : "jpeg";

    if (file.size < 40 * 1024) {
      throw new Error("Campaign asset must be at least 40KB: " + output.path);
    }
    if (
      metadata.width !== POSTER_WIDTH ||
      metadata.height !== POSTER_HEIGHT ||
      metadata.format !== expectedFormat ||
      output.format !== expectedFormat
    ) {
      throw new Error(
        "Campaign asset must match the 1080x1440 PNG/JPEG manifest: " +
          output.path,
      );
    }
    if (metadata.exif || metadata.icc || metadata.xmp) {
      throw new Error("Campaign asset contains metadata: " + output.path);
    }
  }
}

const isDirect =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirect) {
  const outputs = await renderCampaignPosters();
  await assertCampaignAssets(outputs);
  console.log(
    "Campaign posters generated: two 1080x1440 PNG/JPEG pairs with verified metadata.",
  );
}
