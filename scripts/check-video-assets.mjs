import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const privatePath = ["D:", "文件传输助手", "lv_0_20260703211804.mp4"].join(
  "\\",
);
const videoAssets = [
  {
    path: join(root, "public", "videos", "axio-product-presentation.mp4"),
    width: 3840,
    height: 2160,
    duration: 51.1,
    label: "Product presentation",
  },
  {
    path: join(root, "public", "videos", "axio-core-task-workflow.mp4"),
    width: 1280,
    height: 696,
    duration: 56.7,
    label: "Core workflow",
  },
];
const posterAssets = [
  {
    path: join(
      root,
      "public",
      "images",
      "video-posters",
      "axio-product-presentation.webp",
    ),
    width: 1280,
    height: 720,
  },
  {
    path: join(
      root,
      "public",
      "images",
      "video-posters",
      "axio-core-task-workflow.webp",
    ),
    width: 1280,
    height: 696,
  },
];

function fail(message) {
  throw new Error(message);
}

function assertFile(path) {
  if (!existsSync(path) || statSync(path).size === 0) {
    fail(`Missing or empty asset: ${relative(root, path)}`);
  }
}

function walk(path) {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? walk(child) : [child];
  });
}

for (const asset of videoAssets) {
  assertFile(asset.path);
  const probe = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration:stream=codec_name,codec_type,width,height,pix_fmt",
      "-of",
      "json",
      asset.path,
    ],
    { encoding: "utf8", windowsHide: true },
  );
  if (probe.status !== 0) fail(probe.stderr || "ffprobe failed");
  const metadata = JSON.parse(probe.stdout);
  const video = metadata.streams.find(
    (stream) => stream.codec_type === "video",
  );
  const audio = metadata.streams.find(
    (stream) => stream.codec_type === "audio",
  );

  if (
    video?.codec_name !== "h264" ||
    video.width !== asset.width ||
    video.height !== asset.height ||
    video.pix_fmt !== "yuv420p"
  ) {
    fail(`${asset.label} must be H.264 ${asset.width}x${asset.height} yuv420p`);
  }
  if (audio?.codec_name !== "aac") fail(`${asset.label} audio must be AAC`);
  if (Math.abs(Number(metadata.format.duration) - asset.duration) > 0.2) {
    fail(`${asset.label} duration drift exceeds 0.2 seconds`);
  }

  const bytes = readFileSync(asset.path);
  const moov = bytes.indexOf(Buffer.from("moov"));
  const mdat = bytes.indexOf(Buffer.from("mdat"));
  if (moov < 0 || mdat < 0 || moov > mdat) {
    fail(`${asset.label} MP4 faststart metadata is not front-loaded`);
  }
  if (bytes.includes(Buffer.from(privatePath, "utf8"))) {
    fail(`Private ingestion path leaked into ${relative(root, asset.path)}`);
  }
}

for (const poster of posterAssets) {
  assertFile(poster.path);
  const metadata = await sharp(poster.path).metadata();
  if (
    metadata.format !== "webp" ||
    metadata.width !== poster.width ||
    metadata.height !== poster.height
  ) {
    fail(
      `${relative(root, poster.path)} must be a ${poster.width}x${poster.height} WebP`,
    );
  }
}

const textExtensions = new Set([
  ".css",
  ".js",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
  ".json",
]);
const publicFiles = [join(root, "src"), join(root, "scripts")]
  .flatMap(walk)
  .filter((path) => textExtensions.has(extname(path)));
for (const path of publicFiles) {
  if (readFileSync(path, "utf8").includes(privatePath)) {
    fail(`Private ingestion path leaked into ${relative(root, path)}`);
  }
}

console.log(
  "Video assets verified: product presentation and legacy workflow are H.264/AAC yuv420p faststart with matching WebP posters.",
);
