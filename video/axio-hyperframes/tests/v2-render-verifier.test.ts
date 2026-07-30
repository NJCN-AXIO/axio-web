import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

// @ts-expect-error The production verifier is intentionally plain ESM.
const verifier = await import('../scripts/verify-v2-renders.mjs');

const validMetadata = (width: number, height: number, duration: number) => ({
  format: {duration: String(duration), size: '123456'},
  streams: [
    {
      codec_type: 'video', codec_name: 'h264', width, height,
      pix_fmt: 'yuv420p', r_frame_rate: '30/1',
      color_space: 'bt709', color_transfer: 'bt709', color_primaries: 'bt709',
    },
    {codec_type: 'audio', codec_name: 'aac', sample_rate: '48000'},
  ],
});

const pcm16Stereo = (frames: number, sampleAt: (frame: number) => [number, number]) => {
  const buffer = Buffer.alloc(frames * 4);
  for (let frame = 0; frame < frames; frame += 1) {
    const [left, right] = sampleAt(frame);
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(left * 32767))), frame * 4);
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(right * 32767))), frame * 4 + 2);
  }
  return buffer;
};

describe('AXIO V2 render candidate verifier', () => {
  it('is import-safe and declares the four candidate render contracts', async () => {
    expect(verifier.RENDER_CANDIDATES).toEqual([
      {id: 'website-bgm', format: 'website', file: 'AXIO-website-v2-4k.mp4', width: 3840, height: 2160, duration: [50.9, 51.1], bgm: true},
      {id: 'website-nobgm', format: 'website', file: 'AXIO-website-v2-4k-nobgm.mp4', width: 3840, height: 2160, duration: [50.9, 51.1], bgm: false},
      {id: 'wechat-bgm', format: 'wechat', file: 'AXIO-wechat-v2-vertical.mp4', width: 1080, height: 1920, duration: [38.9, 39.1], bgm: true},
      {id: 'wechat-nobgm', format: 'wechat', file: 'AXIO-wechat-v2-vertical-nobgm.mp4', width: 1080, height: 1920, duration: [38.9, 39.1], bgm: false},
    ]);
    expect(verifier.RENDER_SAMPLE_FRAMES).toEqual({
      website: [12, 234, 350, 486, 650, 770, 942, 1125, 1228, 1365, 1500],
      wechat: [12, 202, 315, 435, 502, 592, 682, 772, 862, 952, 1080, 1150],
    });
  });

  it('accepts only the exact H.264 BT.709 video and AAC 48 kHz audio metadata contract', () => {
    const website = verifier.RENDER_CANDIDATES[0];
    expect(verifier.validateRenderMetadata(website, validMetadata(3840, 2160, 51))).toMatchObject({
      duration: 51, width: 3840, height: 2160, codec: 'h264', pixelFormat: 'yuv420p',
      colorSpace: 'bt709', fps: 30, audioCodec: 'aac', sampleRate: 48000,
    });

    const wrongColor = validMetadata(3840, 2160, 51);
    wrongColor.streams[0].color_primaries = 'bt470bg';
    expect(() => verifier.validateRenderMetadata(website, wrongColor)).toThrow(/BT\.709/);
    expect(() => verifier.validateRenderMetadata(website, validMetadata(3840, 2160, 51.2))).toThrow(/duration/);
  });

  it('requires faststart and authoritative platform_write=false readback', () => {
    expect(verifier.validateFaststart(Buffer.from('....ftyp....moov....mdat....'))).toBe(true);
    expect(() => verifier.validateFaststart(Buffer.from('....ftyp....mdat....moov....'))).toThrow(/faststart/);
    expect(verifier.validatePlatformReadback({platform_write: false})).toBe(false);
    expect(() => verifier.validatePlatformReadback({platform_write: true})).toThrow(/platform_write=false/);
  });

  it('retains the strict delivery loudness and true-peak contract', () => {
    expect(verifier.validateLoudness({integratedLufs: -16, truePeakDbtp: -1.2})).toEqual({integratedLufs: -16, truePeakDbtp: -1.2});
    expect(() => verifier.validateLoudness({integratedLufs: -17.01, truePeakDbtp: -1.2})).toThrow(/loudness/);
    expect(() => verifier.validateLoudness({integratedLufs: -14.99, truePeakDbtp: -1.2})).toThrow(/loudness/);
    expect(() => verifier.validateLoudness({integratedLufs: -16, truePeakDbtp: -0.99})).toThrow(/true peak/);
  });

  it('requires frame-identical visuals and retained no-BGM content plus an extra music bed', () => {
    const analysis = {
      format: 'website',
      visualDigestBgm: 'same-visual-digest',
      visualDigestNoBgm: 'same-visual-digest',
      bgm: {sampleFrames: 4_896_000, rmsDb: -16.2, activeCoverage: 0.98},
      noBgm: {sampleFrames: 4_896_000, rmsDb: -20.5, activeCoverage: 0.42},
      residual: {rmsDb: -22.1, activeCoverage: 0.96},
      narrationSfxWindowsActive: true,
    };
    expect(verifier.validateCandidatePair(analysis)).toMatchObject({
      format: 'website', visualFramesIdentical: true,
      narrationSfxRetained: true, extraMusicBed: true,
    });
    expect(() => verifier.validateCandidatePair({...analysis, visualDigestNoBgm: 'different'})).toThrow(/visual frames/);
    expect(() => verifier.validateCandidatePair({...analysis, narrationSfxWindowsActive: false})).toThrow(/narration\/SFX/);
    expect(() => verifier.validateCandidatePair({...analysis, residual: {rmsDb: -60, activeCoverage: 0.1}})).toThrow(/music bed/);
  });

  it('builds a deterministic report without wall-clock fields', () => {
    const input = {platformWrite: false, renders: [{id: 'website-bgm'}], pairs: [{format: 'website'}]};
    const first = verifier.buildAcceptanceReport(input);
    const second = verifier.buildAcceptanceReport(input);
    expect(first).toEqual(second);
    expect(first).toEqual({version: 1, platformWrite: false, renders: input.renders, pairs: input.pairs});
    expect(JSON.stringify(first)).not.toMatch(/checkedAt|createdAt|generatedAt/);
  });

  it('builds full decode, frame digest, and 48 kHz stereo PCM probe commands', () => {
    expect(verifier.buildMediaCommands('candidate.mp4')).toEqual({
      fullDecode: ['-v', 'error', '-i', 'candidate.mp4', '-map', '0:v:0', '-map', '0:a:0', '-f', 'null', 'NUL'],
      visualDigest: ['-v', 'error', '-i', 'candidate.mp4', '-map', '0:v:0', '-an', '-f', 'framemd5', 'pipe:1'],
      audioPcm: ['-v', 'error', '-i', 'candidate.mp4', '-map', '0:a:0', '-ac', '2', '-ar', '48000', '-f', 's16le', 'pipe:1'],
    });
  });

  it('measures retained intermittent content and a continuous extra music residual from decoded PCM', () => {
    const frames = 48_000;
    const noBgm = pcm16Stereo(frames, (frame) => {
      const active = frame < frames / 2;
      const voice = active ? Math.sin(2 * Math.PI * 440 * frame / 48_000) * 0.12 : 0;
      return [voice, voice];
    });
    const bgm = pcm16Stereo(frames, (frame) => {
      const voice = frame < frames / 2 ? Math.sin(2 * Math.PI * 440 * frame / 48_000) * 0.12 : 0;
      const music = Math.sin(2 * Math.PI * 110 * frame / 48_000) * 0.2;
      return [voice + music, voice + music];
    });
    const analysis = verifier.analyzeDecodedAudioPair('website', bgm, noBgm, [{from: 0, duration: 30}]);
    expect(analysis.narrationSfxWindowsActive).toBe(true);
    expect(analysis.noBgm.activeCoverage).toBeGreaterThan(0.45);
    expect(analysis.noBgm.activeCoverage).toBeLessThan(0.55);
    expect(analysis.residual.activeCoverage).toBeGreaterThan(0.95);
    expect(verifier.validateCandidatePair({...analysis, visualDigestBgm: 'v', visualDigestNoBgm: 'v'}).extraMusicBed).toBe(true);
  });

  it('uses the authoritative Ink capture manifest and contains no wall-clock report source', () => {
    const source = readFileSync('scripts/verify-v2-renders.mjs', 'utf8');
    expect(source).toContain('"public", "evidence", "ink", "capture-manifest.json"');
    expect(source).not.toMatch(/new Date|Date\.now/);
  });
});
