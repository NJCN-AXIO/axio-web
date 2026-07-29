import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join, resolve} from 'node:path';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill} from '@remotion/renderer';
import sharp from 'sharp';
import ts from 'typescript';

export const WEBSITE_FRAMES = [
  [0, 120, 195], [210, 234, 258], [264, 350, 429], [444, 486, 531],
  [540, 566, 588], [594, 650, 699], [714, 770, 819], [834, 860, 882],
  [888, 942, 993], [1008, 1034, 1056], [1062, 1125, 1185],
  [1200, 1228, 1252], [1260, 1365, 1500],
];
const PHASES = ['ingress', 'peak', 'settled'];
const FORMAT_META = {
  website: {compositionId: 'AXIO-Website-V2-4K', width: 3840, height: 2160},
  wechat: {compositionId: 'AXIO-WeChat-V2-Vertical', width: 1080, height: 1920},
};

const property = (object, name) => object.properties.find((item) =>
  ts.isPropertyAssignment(item) && item.name.getText().replaceAll(/['"]/g, '') === name);
const numberValue = (node) => Number(node.getText());
const stringValue = (node) => node.text;

export const loadTimelines = (path = 'src/v2/timeline.ts') => {
  const source = readFileSync(path, 'utf8');
  const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const result = {};
  file.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      const name = declaration.name.getText();
      if (!['websiteV2', 'wechatV2'].includes(name) || !ts.isObjectLiteralExpression(declaration.initializer)) continue;
      const frames = numberValue(property(declaration.initializer, 'frames').initializer);
      const shotsNode = property(declaration.initializer, 'shots').initializer;
      const shots = shotsNode.elements.map((shot) => ({
        id: stringValue(property(shot, 'id').initializer),
        from: numberValue(property(shot, 'from').initializer),
        duration: numberValue(property(shot, 'duration').initializer),
      }));
      result[name === 'websiteV2' ? 'website' : 'wechat'] = {frames, shots};
    }
  });
  if (!result.website || !result.wechat) throw new Error('Could not parse both V2 timelines');
  return result;
};

export const buildStillPlan = (timelines, selected = 'all') => {
  const entries = [];
  for (const format of ['website', 'wechat']) {
    if (selected !== 'all' && selected !== format) continue;
    const timeline = timelines[format];
    timeline.shots.forEach((shot, shotIndex) => {
      const frames = format === 'website'
        ? WEBSITE_FRAMES[shotIndex]
        : [shot.from, shot.from + Math.floor(shot.duration * 0.55), shot.from + shot.duration - 8];
      frames.forEach((frame, phaseIndex) => entries.push({
        format, compositionId: FORMAT_META[format].compositionId, shotId: shot.id,
        phase: PHASES[phaseIndex], frame,
        filename: format + '-' + String(shotIndex).padStart(2, '0') + '-' + shot.id + '-' + PHASES[phaseIndex] + '-f' + String(frame).padStart(4, '0') + '.png',
        width: FORMAT_META[format].width, height: FORMAT_META[format].height,
      }));
    });
  }
  return entries;
};

export const validateFramePlan = (entries, timelines) => {
  if (new Set(entries.map((entry) => entry.filename)).size !== entries.length) throw new Error('Still output names are not unique');
  for (const entry of entries) {
    const timeline = timelines[entry.format];
    const shot = timeline.shots.find((item) => item.id === entry.shotId);
    if (!shot || entry.frame < shot.from || entry.frame >= shot.from + shot.duration || entry.frame >= timeline.frames) {
      throw new Error('Frame out of range: ' + entry.filename);
    }
  }
  return entries;
};

export const measurePixels = async (path) => {
  const [metadata, stats] = await Promise.all([sharp(path).metadata(), sharp(path).stats()]);
  const pixelVariance = Math.max(...stats.channels.map((channel) => channel.stdev));
  return {width: metadata.width, height: metadata.height, pixelVariance};
};

export const validateTextBounds = (boxes, viewport, captionSafeTop) => {
  for (const box of boxes) {
    if (box.x < 0 || box.y < 0 || box.x + box.width > viewport.width || box.y + box.height > viewport.height) throw new Error('Text outside viewport: ' + box.id);
    if (box.y + box.height > captionSafeTop) throw new Error('Text overlaps caption safe area: ' + box.id);
  }
  return true;
};

const buildContactSheet = async (entries, outputDir, outputName, tileWidth, columns) => {
  const tiles = [];
  for (const entry of entries) {
    const videoHeight = Math.round(tileWidth * entry.height / entry.width);
    const labelHeight = 34;
    const label = entry.shotId + ' / ' + entry.phase + ' / f' + entry.frame;
    const svg = Buffer.from('<svg width="' + tileWidth + '" height="' + labelHeight + '" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ffffff"/><text x="10" y="23" font-family="Arial" font-size="15" fill="#111111">' + label + '</text></svg>');
    const input = await sharp(join(outputDir, entry.filename)).resize(tileWidth, videoHeight).extend({bottom: labelHeight, background: '#ffffff'}).composite([{input: svg, top: videoHeight, left: 0}]).png().toBuffer();
    tiles.push({input, width: tileWidth, height: videoHeight + labelHeight});
  }
  const tileHeight = Math.max(...tiles.map((tile) => tile.height));
  const rows = Math.ceil(tiles.length / columns);
  const composite = tiles.map((tile, index) => ({input: tile.input, left: (index % columns) * tileWidth, top: Math.floor(index / columns) * tileHeight}));
  await sharp({create: {width: columns * tileWidth, height: rows * tileHeight, channels: 3, background: '#e8ebef'}}).composite(composite).jpeg({quality: 88}).toFile(join(outputDir, outputName));
};

export const main = async () => {
  const args = process.argv.slice(2);
  const selected = args.find((arg) => arg === 'website' || arg === 'wechat') ?? 'all';
  const outputDir = 'out/qa';
  const force = args.includes('--force');
  mkdirSync(outputDir, {recursive: true});
  const timelines = loadTimelines();
  const entries = validateFramePlan(buildStillPlan(timelines, selected), timelines);
  const serveUrl = await bundle({entryPoint: resolve('src/index.ts'), enableCaching: true, onProgress: () => undefined});
  const compositions = await getCompositions({serveUrl, inputProps: {bgm: true}, logLevel: 'error'});
  for (const entry of entries) {
    const output = join(outputDir, entry.filename);
    const composition = compositions.find((item) => item.id === entry.compositionId);
    if (!composition) throw new Error('Missing composition: ' + entry.compositionId);
    if (existsSync(output)) Object.assign(entry, await measurePixels(output));
    if (force || !existsSync(output) || entry.pixelVariance <= 0.5) {
      await renderStill({serveUrl, composition, output, frame: entry.frame, imageFormat: 'png', inputProps: {bgm: true}, overwrite: true, logLevel: 'error'});
      Object.assign(entry, await measurePixels(output));
    }
    if (entry.width !== FORMAT_META[entry.format].width || entry.height !== FORMAT_META[entry.format].height) throw new Error('Wrong dimensions: ' + entry.filename);
    if (entry.pixelVariance <= 0.5) throw new Error('Blank or flat still: ' + entry.filename);
  }
  if (selected === 'all' || selected === 'website') await buildContactSheet(entries.filter((entry) => entry.format === 'website'), outputDir, 'website-contact-sheet.jpg', 480, 3);
  if (selected === 'all' || selected === 'wechat') await buildContactSheet(entries.filter((entry) => entry.format === 'wechat'), outputDir, 'wechat-contact-sheet.jpg', 240, 3);
  writeFileSync(join(outputDir, 'v2-still-manifest.json'), JSON.stringify({entries}, null, 2) + '\n', 'utf8');
  process.stdout.write('Rendered ' + entries.length + ' validated stills to ' + outputDir + '\n');
};

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) await main();
