import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const videoPath = join(root, "public", "videos", "axio-core-task-workflow.mp4");
const posters = [
  join(
    root,
    "public",
    "images",
    "video-posters",
    "axio-core-task-workflow.webp",
  ),
  join(root, "public", "images", "video-posters", "axio-overview-cover.webp"),
];
const privatePath = ["D:", "文件传输助手", "lv_0_20260703211804.mp4"].join(
  "\\",
);

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

assertFile(videoPath);
posters.forEach(assertFile);

const probe = spawnSync(
  "ffprobe",
  [
    "-v",
    "error",
    "-show_entries",
    "format=duration,size:stream=codec_name,codec_type,width,height,pix_fmt",
    "-of",
    "json",
    videoPath,
  ],
  { encoding: "utf8", windowsHide: true },
);
if (probe.status !== 0) fail(probe.stderr || "ffprobe failed");
const metadata = JSON.parse(probe.stdout);
const video = metadata.streams.find((stream) => stream.codec_type === "video");
const audio = metadata.streams.find((stream) => stream.codec_type === "audio");

if (
  video?.codec_name !== "h264" ||
  video.width !== 1280 ||
  video.height !== 696 ||
  video.pix_fmt !== "yuv420p"
) {
  fail("Core workflow video must be H.264 1280x696 yuv420p");
}
if (audio?.codec_name !== "aac") fail("Core workflow audio must be AAC");
if (Math.abs(Number(metadata.format.duration) - 56.7) > 0.2) {
  fail("Core workflow duration drift exceeds 0.2 seconds");
}

const videoBytes = readFileSync(videoPath);
const moov = videoBytes.indexOf(Buffer.from("moov"));
const mdat = videoBytes.indexOf(Buffer.from("mdat"));
if (moov < 0 || mdat < 0 || moov > mdat)
  fail("MP4 faststart metadata is not front-loaded");
if (videoBytes.includes(Buffer.from(privatePath, "utf8"))) {
  fail("Private ingestion path leaked into video metadata");
}

for (const poster of posters) {
  const metadata = await sharp(poster).metadata();
  if (
    metadata.format !== "webp" ||
    metadata.width !== 1280 ||
    metadata.height !== 696
  ) {
    fail(`${relative(root, poster)} must be a 1280x696 WebP`);
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
  "Video assets verified: H.264/AAC 1280x696, faststart, 56.7s, WebP posters.",
);
