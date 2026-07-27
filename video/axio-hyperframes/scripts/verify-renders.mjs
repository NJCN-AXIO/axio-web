import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  readFileSync(join(root, "public", "data", "manifest.json"), "utf8"),
);
const renders = [
  {
    id: "website",
    path: join(root, "out", "AXIO-website-4k.mp4"),
    width: 3840,
    height: 2160,
    duration: [82, 88],
    sampleFrames: [0, 300, 720, 1080, 1500, 1920, 2190, 2430, 2540],
  },
  {
    id: "wechat",
    path: join(root, "out", "AXIO-wechat-vertical.mp4"),
    width: 1080,
    height: 1920,
    duration: [48, 52],
    sampleFrames: [0, 210, 600, 960, 1290, 1490],
  },
];

function run(command, args, binary = false) {
  const result = spawnSync(command, args, {
    encoding: binary ? null : "utf8",
    windowsHide: true,
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`${command} failed: ${String(result.stderr || result.stdout)}`);
  }
  return result;
}

function probe(path) {
  return JSON.parse(
    run("ffprobe", [
      "-v", "error",
      "-show_entries",
      "format=duration,size:stream=codec_name,codec_type,width,height,pix_fmt,r_frame_rate,sample_rate",
      "-of", "json", path,
    ]).stdout,
  );
}

function analyzeLoudness(path) {
  const result = run("ffmpeg", [
    "-hide_banner", "-nostats", "-i", path,
    "-af", "loudnorm=I=-16:TP=-1:LRA=11:print_format=json",
    "-f", "null", "NUL",
  ]);
  const match = result.stderr.match(/\{[\s\S]*?"target_offset"\s*:\s*"[^"]+"\s*\}/);
  if (!match) throw new Error(`No loudness report for ${path}`);
  const data = JSON.parse(match[0]);
  return {
    integratedLufs: Number(data.input_i),
    truePeakDbtp: Number(data.input_tp),
  };
}

function analyzeFrame(path, frame) {
  const raw = run(
    "ffmpeg",
    [
      "-hide_banner", "-loglevel", "error",
      "-ss", (frame / 30).toFixed(3), "-i", path,
      "-frames:v", "1",
      "-vf", "scale=64:64,format=gray",
      "-f", "rawvideo", "pipe:1",
    ],
    true,
  ).stdout;
  if (!raw || raw.length !== 4096) {
    throw new Error(`Could not sample frame ${frame} from ${path}`);
  }
  let sum = 0;
  let sumSquares = 0;
  let min = 255;
  let max = 0;
  for (const value of raw) {
    sum += value;
    sumSquares += value * value;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  const mean = sum / raw.length;
  const deviation = Math.sqrt(sumSquares / raw.length - mean * mean);
  if (deviation < 4 || max - min < 20) {
    throw new Error(`Frame ${frame} appears blank or flat in ${path}`);
  }
  return { frame, deviation: Number(deviation.toFixed(2)), range: max - min };
}

const report = {
  checkedAt: new Date().toISOString(),
  platformWrite: manifest.capture.platform_write,
  renders: [],
};
if (report.platformWrite !== false) {
  throw new Error("Capture manifest must report platform_write=false");
}

for (const render of renders) {
  const metadata = probe(render.path);
  const video = metadata.streams.find((stream) => stream.codec_type === "video");
  const audio = metadata.streams.find((stream) => stream.codec_type === "audio");
  const duration = Number(metadata.format.duration);
  if (
    video?.codec_name !== "h264" ||
    video.width !== render.width ||
    video.height !== render.height ||
    video.pix_fmt !== "yuv420p" ||
    video.r_frame_rate !== "30/1"
  ) {
    throw new Error(`${render.id} video metadata does not match delivery contract`);
  }
  if (audio?.codec_name !== "aac" || audio.sample_rate !== "48000") {
    throw new Error(`${render.id} audio must be AAC at 48 kHz`);
  }
  if (duration < render.duration[0] || duration > render.duration[1]) {
    throw new Error(`${render.id} duration ${duration} is outside contract`);
  }

  const bytes = readFileSync(render.path);
  const moov = bytes.indexOf(Buffer.from("moov"));
  const mdat = bytes.indexOf(Buffer.from("mdat"));
  if (moov < 0 || mdat < 0 || moov > mdat) {
    throw new Error(`${render.id} is not faststart`);
  }

  const loudness = analyzeLoudness(render.path);
  if (
    loudness.integratedLufs < -17 ||
    loudness.integratedLufs > -15 ||
    loudness.truePeakDbtp > -1
  ) {
    throw new Error(
      `${render.id} loudness is outside target: ${JSON.stringify(loudness)}`,
    );
  }
  const frameChecks = render.sampleFrames.map((frame) =>
    analyzeFrame(render.path, frame),
  );
  report.renders.push({
    id: render.id,
    duration,
    sizeBytes: Number(metadata.format.size),
    width: video.width,
    height: video.height,
    codec: video.codec_name,
    pixelFormat: video.pix_fmt,
    audioCodec: audio.codec_name,
    sampleRate: Number(audio.sample_rate),
    faststart: true,
    ...loudness,
    frameChecks,
  });
}

writeFileSync(
  join(root, "out", "acceptance-report.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
