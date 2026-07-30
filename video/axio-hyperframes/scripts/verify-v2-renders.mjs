import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const RENDER_CANDIDATES = [
  {
    id: "website-bgm",
    format: "website",
    file: "AXIO-website-v2-4k.mp4",
    width: 3840,
    height: 2160,
    duration: [50.9, 51.1],
    bgm: true,
  },
  {
    id: "website-nobgm",
    format: "website",
    file: "AXIO-website-v2-4k-nobgm.mp4",
    width: 3840,
    height: 2160,
    duration: [50.9, 51.1],
    bgm: false,
  },
  {
    id: "wechat-bgm",
    format: "wechat",
    file: "AXIO-wechat-v2-vertical.mp4",
    width: 1080,
    height: 1920,
    duration: [38.9, 39.1],
    bgm: true,
  },
  {
    id: "wechat-nobgm",
    format: "wechat",
    file: "AXIO-wechat-v2-vertical-nobgm.mp4",
    width: 1080,
    height: 1920,
    duration: [38.9, 39.1],
    bgm: false,
  },
];
export const RENDER_SAMPLE_FRAMES = {
  website: [12, 234, 350, 486, 650, 770, 942, 1125, 1228, 1365, 1500],
  wechat: [12, 202, 315, 435, 502, 592, 682, 772, 862, 952, 1080, 1150],
};

const parseRate = (value) => {
  const [numerator, denominator] = String(value).split("/").map(Number);
  return denominator ? numerator / denominator : Number(value);
};

export function validateRenderMetadata(candidate, metadata) {
  const video = metadata.streams?.find((stream) => stream.codec_type === "video");
  const audio = metadata.streams?.find((stream) => stream.codec_type === "audio");
  const duration = Number(metadata.format?.duration);
  if (
    video?.codec_name !== "h264" ||
    video.width !== candidate.width ||
    video.height !== candidate.height ||
    video.pix_fmt !== "yuv420p" ||
    parseRate(video.r_frame_rate) !== 30
  ) {
    throw new Error(`${candidate.id} video metadata does not match delivery contract`);
  }
  if (
    video.color_space !== "bt709" ||
    video.color_transfer !== "bt709" ||
    video.color_primaries !== "bt709"
  ) {
    throw new Error(`${candidate.id} video must declare BT.709 color metadata`);
  }
  if (audio?.codec_name !== "aac" || audio.sample_rate !== "48000") {
    throw new Error(`${candidate.id} audio must be AAC at 48 kHz`);
  }
  if (!Number.isFinite(duration) || duration < candidate.duration[0] || duration > candidate.duration[1]) {
    throw new Error(`${candidate.id} duration ${duration} is outside contract`);
  }
  return {
    duration,
    sizeBytes: Number(metadata.format.size),
    width: video.width,
    height: video.height,
    codec: video.codec_name,
    pixelFormat: video.pix_fmt,
    colorSpace: video.color_space,
    fps: parseRate(video.r_frame_rate),
    audioCodec: audio.codec_name,
    sampleRate: Number(audio.sample_rate),
  };
}

export function validateFaststart(bytes) {
  const moov = bytes.indexOf(Buffer.from("moov"));
  const mdat = bytes.indexOf(Buffer.from("mdat"));
  if (moov < 0 || mdat < 0 || moov > mdat) {
    throw new Error("Candidate is not faststart");
  }
  return true;
}

export function validatePlatformReadback(manifest) {
  if (manifest?.platform_write !== false) {
    throw new Error("Capture manifest must report platform_write=false");
  }
  return false;
}

export function validateLoudness(loudness) {
  if (loudness.integratedLufs < -17 || loudness.integratedLufs > -15) {
    throw new Error(`Integrated loudness is outside -17..-15 LUFS: ${loudness.integratedLufs}`);
  }
  if (loudness.truePeakDbtp > -1) {
    throw new Error(`Audio true peak exceeds -1 dBTP: ${loudness.truePeakDbtp}`);
  }
  return loudness;
}

export function validateCandidatePair(analysis) {
  if (analysis.visualDigestBgm !== analysis.visualDigestNoBgm) {
    throw new Error(`${analysis.format} BGM/no-BGM visual frames are not identical`);
  }
  if (
    analysis.bgm.sampleFrames !== analysis.noBgm.sampleFrames ||
    !analysis.narrationSfxWindowsActive ||
    analysis.noBgm.activeCoverage < 0.05 ||
    analysis.noBgm.rmsDb < -45
  ) {
    throw new Error(`${analysis.format} no-BGM narration/SFX was not retained`);
  }
  if (
    analysis.residual.activeCoverage < 0.75 ||
    analysis.residual.rmsDb < -45 ||
    analysis.bgm.rmsDb < analysis.noBgm.rmsDb + 0.25
  ) {
    throw new Error(`${analysis.format} BGM render has no verified extra music bed`);
  }
  return {
    format: analysis.format,
    visualFramesIdentical: true,
    narrationSfxRetained: true,
    extraMusicBed: true,
    bgm: analysis.bgm,
    noBgm: analysis.noBgm,
    residual: analysis.residual,
  };
}

export function buildAcceptanceReport({platformWrite, renders, pairs}) {
  return {version: 1, platformWrite, renders, pairs};
}

export function buildMediaCommands(path) {
  return {
    fullDecode: ["-v", "error", "-i", path, "-map", "0:v:0", "-map", "0:a:0", "-f", "null", "NUL"],
    visualDigest: ["-v", "error", "-i", path, "-map", "0:v:0", "-an", "-f", "framemd5", "pipe:1"],
    audioPcm: ["-v", "error", "-i", path, "-map", "0:a:0", "-ac", "2", "-ar", "48000", "-f", "s16le", "pipe:1"],
  };
}

const pcmSamples = (bytes) => {
  if (bytes.length % 4 !== 0) throw new Error("Decoded PCM is not complete stereo s16le data");
  const samples = new Float64Array(bytes.length / 2);
  for (let offset = 0; offset < bytes.length; offset += 2) {
    samples[offset / 2] = bytes.readInt16LE(offset) / 32768;
  }
  return samples;
};

const metricsFromSamples = (samples) => {
  const stereoFrames = samples.length / 2;
  let sumSquares = 0;
  for (const sample of samples) sumSquares += sample * sample;
  const rms = Math.sqrt(sumSquares / Math.max(1, samples.length));
  const windowFrames = 4800;
  let activeWindows = 0;
  let windows = 0;
  for (let start = 0; start < stereoFrames; start += windowFrames) {
    const end = Math.min(stereoFrames, start + windowFrames);
    let windowSquares = 0;
    for (let frame = start; frame < end; frame += 1) {
      windowSquares += samples[frame * 2] ** 2 + samples[frame * 2 + 1] ** 2;
    }
    const windowRms = Math.sqrt(windowSquares / Math.max(1, (end - start) * 2));
    if (20 * Math.log10(Math.max(windowRms, Number.EPSILON)) > -50) activeWindows += 1;
    windows += 1;
  }
  return {
    sampleFrames: stereoFrames,
    rmsDb: Number((20 * Math.log10(Math.max(rms, Number.EPSILON))).toFixed(2)),
    activeCoverage: Number((activeWindows / Math.max(1, windows)).toFixed(4)),
  };
};

const windowRmsDb = (samples, fromFrame, durationFrames) => {
  const start = Math.floor(fromFrame / 30 * 48000);
  const end = Math.min(samples.length / 2, Math.ceil((fromFrame + durationFrames) / 30 * 48000));
  let sumSquares = 0;
  for (let frame = start; frame < end; frame += 1) {
    sumSquares += samples[frame * 2] ** 2 + samples[frame * 2 + 1] ** 2;
  }
  const rms = Math.sqrt(sumSquares / Math.max(1, (end - start) * 2));
  return 20 * Math.log10(Math.max(rms, Number.EPSILON));
};

export function analyzeDecodedAudioPair(format, bgmBytes, noBgmBytes, narrationSfxWindows) {
  const bgmSamples = pcmSamples(bgmBytes);
  const noBgmSamples = pcmSamples(noBgmBytes);
  if (bgmSamples.length !== noBgmSamples.length) {
    throw new Error(`${format} BGM/no-BGM decoded audio lengths differ`);
  }
  const residualSamples = new Float64Array(bgmSamples.length);
  for (let index = 0; index < residualSamples.length; index += 1) {
    residualSamples[index] = bgmSamples[index] - noBgmSamples[index];
  }
  return {
    format,
    bgm: metricsFromSamples(bgmSamples),
    noBgm: metricsFromSamples(noBgmSamples),
    residual: metricsFromSamples(residualSamples),
    narrationSfxWindowsActive: narrationSfxWindows.every(({from, duration}) =>
      windowRmsDb(noBgmSamples, from, duration) > -50),
  };
}

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
      "format=duration,size:stream=codec_name,codec_type,width,height,pix_fmt,r_frame_rate,sample_rate,color_space,color_transfer,color_primaries",
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

function main() {
  const manifest = JSON.parse(
    readFileSync(join(root, "public", "evidence", "ink", "capture-manifest.json"), "utf8"),
  );
  const renders = RENDER_CANDIDATES.map((candidate) => ({
    ...candidate,
    path: join(root, "out", "candidates", candidate.file),
    sampleFrames: RENDER_SAMPLE_FRAMES[candidate.format],
  }));
  const platformWrite = validatePlatformReadback(manifest);
  const renderReports = [];
  const media = new Map();

  for (const render of renders) {
    const metadataReport = validateRenderMetadata(render, probe(render.path));
    validateFaststart(readFileSync(render.path));
    const commands = buildMediaCommands(render.path);
    run("ffmpeg", commands.fullDecode);
    const visualFrames = run("ffmpeg", commands.visualDigest).stdout;
    const visualDigest = createHash("sha256").update(visualFrames).digest("hex");
    const audioPcm = run("ffmpeg", commands.audioPcm, true).stdout;
    const loudness = validateLoudness(analyzeLoudness(render.path));
    const frameChecks = render.sampleFrames.map((frame) => analyzeFrame(render.path, frame));
    media.set(render.id, {audioPcm, visualDigest});
    renderReports.push({
      id: render.id,
      file: render.file,
      bgm: render.bgm,
      ...metadataReport,
      faststart: true,
      fullDecode: true,
      visualDigest,
      ...loudness,
      frameChecks,
    });
  }

  const narrationSfxWindows = {
    website: [
      {from: 0, duration: 180}, {from: 180, duration: 360}, {from: 540, duration: 294},
      {from: 888, duration: 120}, {from: 1008, duration: 252}, {from: 1260, duration: 270},
    ],
    wechat: [
      {from: 0, duration: 180}, {from: 180, duration: 300}, {from: 480, duration: 180},
      {from: 660, duration: 45}, {from: 705, duration: 135}, {from: 840, duration: 180},
      {from: 1020, duration: 150},
    ],
  };
  const pairs = ["website", "wechat"].map((format) => {
    const bgm = media.get(`${format}-bgm`);
    const noBgm = media.get(`${format}-nobgm`);
    return validateCandidatePair({
      ...analyzeDecodedAudioPair(format, bgm.audioPcm, noBgm.audioPcm, narrationSfxWindows[format]),
      visualDigestBgm: bgm.visualDigest,
      visualDigestNoBgm: noBgm.visualDigest,
    });
  });
  const report = buildAcceptanceReport({platformWrite, renders: renderReports, pairs});

  writeFileSync(
    join(root, "out", "v2-acceptance-report.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
}

const isMain = process.argv[1]
  ? import.meta.url === pathToFileURL(resolve(process.argv[1])).href
  : false;
if (isMain) main();
