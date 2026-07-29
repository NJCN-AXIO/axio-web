import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import actionContract from '../src/v2/action-contract.json' with {type: 'json'};

const input = process.argv[2] ?? 'public/audio/v2/house-vibez.mp3';
const output = process.argv[3] ?? 'out/v2-beat-report.json';
const sampleRate = 8000;
const fps = 30;
const windowSize = 80;
const decoded = spawnSync('ffmpeg', ['-v', 'error', '-i', input, '-t', '75', '-ac', '1', '-ar', String(sampleRate), '-f', 's16le', 'pipe:1'], {encoding: null, maxBuffer: 64 * 1024 * 1024});
if (decoded.status !== 0) throw new Error(decoded.stderr.toString('utf8'));

const samples = new Int16Array(decoded.stdout.buffer, decoded.stdout.byteOffset, Math.floor(decoded.stdout.byteLength / 2));
const energy = [];
for (let start = 0; start + windowSize <= samples.length; start += windowSize) {
  let sum = 0;
  for (let i = start; i < start + windowSize; i++) sum += Math.abs(samples[i]);
  energy.push(sum / windowSize);
}
const onset = energy.map((value, index) => Math.max(0, value - (energy[index - 1] ?? value)));
const windowsPerSecond = sampleRate / windowSize;
let best = {score: -Infinity, lag: 0};
for (let bpm = 100; bpm <= 140; bpm += 0.01) {
  const lag = Math.round(windowsPerSecond * 60 / bpm);
  let score = 0;
  for (let i = lag; i < onset.length; i++) score += onset[i] * onset[i - lag];
  if (score > best.score) best = {score, lag};
}
const beatInterval = best.lag / windowsPerSecond;
const beatSubdivision = actionContract.beatSubdivision;
const pulseInterval = beatInterval / beatSubdivision;
let bestPhase = {score: -Infinity, offset: 0};
for (let offset = 0; offset < best.lag; offset++) {
  let score = 0;
  for (let i = offset; i < onset.length; i += best.lag) score += onset[i];
  if (score > bestPhase.score) bestPhase = {score, offset};
}
const phase = bestPhase.offset / windowsPerSecond;
const residual = (frame) => {
  const time = frame / fps;
  const nearestPulse = Math.round((time - phase) / pulseInterval);
  return {frame, nearestPulse, residualFrames: Number(((time - (phase + nearestPulse * pulseInterval)) * fps).toFixed(2))};
};
const cutResiduals = Object.fromEntries(Object.entries(actionContract.hardCuts).map(([format, frames]) => [format, frames.map(residual)]));
const actionResiduals = Object.fromEntries(Object.entries(actionContract.visualActionFrames).map(([format, actions]) => [format,
  Object.entries(actions).map(([id, frame]) => ({id, ...residual(frame)})),
]));
const report = {
  source: 'house-vibez.mp3',
  bpm: Number((60 / beatInterval).toFixed(2)),
  phaseSeconds: Number(phase.toFixed(4)),
  beatIntervalSeconds: Number(beatInterval.toFixed(5)),
  beatSubdivision,
  analysis: {sampleRate, windowSize, durationSeconds: 75, bpmRange: [100, 140]},
  cutResiduals,
  actionResiduals,
};
mkdirSync(dirname(output), {recursive: true});
writeFileSync(output, JSON.stringify(report, null, 2) + '\n', 'utf8');
process.stdout.write(output + ': ' + report.bpm + ' BPM, phase ' + report.phaseSeconds + 's\n');
