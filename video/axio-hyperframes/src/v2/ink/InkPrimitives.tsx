import type {ReactNode} from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {getOutroLocalActionFrames} from '../action-contract';
import {PageCam, type CamKey} from './PageCam';

export const INK = {
  accent: '#EE4D2D', ink: '#111111', page: '#F4F6F9', surface: '#FFFFFF',
  muted: '#65758B', verified: '#0D7657',
} as const;

export const FLASH_CUT_FRAMES = 10;
export const TITLE_HOLD_FRAMES = 30;
export const BATCH_SETTLE_FRAMES = 15;
export const BRAND_HOLD_FRAMES = 30;
export const NARRATIVE_TEXT_RATIO = 0.052;
export const SUPPORT_TEXT_RATIO = 0.03;

const SANS = 'Inter, "Microsoft YaHei", "PingFang SC", sans-serif';
const FLY_EASE = Easing.bezier(0.34, 1.4, 0.44, 1);
const PRESS_EASE = Easing.bezier(0.2, 0.75, 0.3, 1);
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value), 3);
const progressAt = (frame: number, start: number, duration: number) => easeOut((frame - start) / duration);

export const textSizeForFrame = (height: number, role: 'narrative' | 'support') =>
  Math.ceil(height * (role === 'narrative' ? NARRATIVE_TEXT_RATIO : SUPPORT_TEXT_RATIO));

export const dealMotionAt = (frame: number, duration: number, cardCount: number, queryLength: number) => {
  const cardCues = Array.from({length: cardCount}, (_, index) => 16 + 5 * index - 0.3 * index * (index - 1));
  const cardProgress = cardCues.map((cue) => progressAt(frame, cue, 12));
  const typeStart = Math.round(duration * 0.45);
  const typedChars = Math.min(queryLength, Math.max(0, Math.floor((frame - typeStart) / 3) + 1));
  const filterStart = typeStart + queryLength * 3 + 11;
  const filter = progressAt(frame, filterStart, 10);
  const click = progressAt(frame, filterStart + 24, 8);
  return {cardCues, cardProgress, typedChars, filtered: filter >= 0.999, filter, click, anticipation: progressAt(frame, 0, 10)};
};

export const rowEmbedAt = (frame: number, _duration: number, rowCount: number) =>
  Array.from({length: rowCount}, (_, index) => progressAt(frame, 10 + index * 9, 12));

export const stackPressAt = (frame: number, _duration: number, rowCount: number) =>
  Array.from({length: rowCount}, (_, index) => {
    const cue = 12 + index * 10;
    const progress = progressAt(frame, cue, 18);
    const nextCue = 12 + (index + 1) * 10;
    const press = index === rowCount - 1 ? 0 : Math.max(0, 1 - Math.abs(frame - nextCue) / 6) * (progress >= 0.999 ? 1 : 0);
    return {progress, press};
  });

export const documentRevealAt = (frame: number, duration: number, rowCount: number) => {
  const rows = Array.from({length: rowCount}, (_, index) => progressAt(frame, 8 + index * 9, 12));
  const rowsSettled = rows.filter((value) => value >= 0.999).length;
  const finalSettle = 8 + (rowCount - 1) * 9 + 12;
  const verifiedStart = Math.min(duration - 24, finalSettle + 12);
  const verifyProgress = progressAt(frame, verifiedStart, 8);
  return {rows, rowsSettled, verified: rowsSettled === rowCount && verifyProgress >= 0.999, verifyProgress};
};

export const outroMotionAt = (frame: number, duration: number, itemCount: number, holdFrames: number) => {
  const actions = getOutroLocalActionFrames(duration, holdFrames, itemCount);
  const stableFrom = actions.stable;
  const visualFrame = Math.min(frame, stableFrom);
  const lastCue = actions.settle - 12;
  const itemProgress = Array.from({length: itemCount}, (_, index) => {
    const cue = 4 + (index / Math.max(1, itemCount - 1)) * (lastCue - 4);
    return progressAt(visualFrame, cue, 12);
  });
  const brand = progressAt(visualFrame, actions.brand, 14);
  const rule = progressAt(visualFrame, actions.sparkle, 10);
  return {stable: frame >= stableFrom, stableFrom, visualFrame, itemProgress, brand, rule};
};

export type InkSegment = {text: string; accent?: boolean};
export const InkTitleCard = ({duration, segments, sub}: {duration: number; segments: readonly InkSegment[]; sub?: string}) => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const settleAt = Math.min(4 + Math.max(0, segments.length - 1) * 4 + 9, duration - TITLE_HOLD_FRAMES);
  const fadeOut = interpolate(frame, [duration - 7, duration], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rule = interpolate(frame, [Math.max(12, settleAt - 8), settleAt], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.3, 0, 0.2, 1)});
  return <AbsoluteFill style={{backgroundColor: INK.page, justifyContent: 'center', alignItems: 'center', opacity: fadeOut}}>
    <div style={{width: '84%', textAlign: 'center'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.28em', fontFamily: SANS, fontSize: textSizeForFrame(height, 'narrative'), fontWeight: 700, lineHeight: 1.16, letterSpacing: 0, color: INK.ink}}>
        {segments.map((segment, index) => {
          const start = 4 + index * 4;
          const progress = interpolate(frame, [start, start + 9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: PRESS_EASE});
          return <span key={`${segment.text}-${index}`} style={{display: 'inline-block', opacity: 0.14 + progress * 0.86, transform: `scale(${1.18 - 0.18 * progress})`, filter: `blur(${(1 - progress) * 4}px)`, color: segment.accent ? INK.accent : INK.ink}}>{segment.text}</span>;
        })}
      </div>
      <div style={{height: 8, width: 260, margin: '40px auto 0', backgroundColor: INK.accent, transform: `scaleX(${rule})`}} />
      {sub ? <div style={{fontFamily: SANS, fontSize: textSizeForFrame(height, 'support'), fontWeight: 700, letterSpacing: 0, color: INK.muted, marginTop: 32}}>{sub}</div> : null}
    </div>
  </AbsoluteFill>;
};

export const FlashCut = ({duration = FLASH_CUT_FRAMES}: {duration?: number}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, duration * 0.4, duration], [0, 0.88, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{pointerEvents: 'none', opacity, backgroundColor: INK.surface}} />;
};

export const InkCaption = ({text, duration, bottom = 72}: {text: string; duration: number; bottom?: number}) => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const enter = interpolate(frame, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const leave = interpolate(frame, [duration - 8, duration], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{position: 'absolute', left: '7%', right: '7%', bottom, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, fontFamily: SANS, fontSize: textSizeForFrame(height, 'narrative'), lineHeight: 1.18, fontWeight: 700, letterSpacing: 0, color: INK.ink, textAlign: 'center', opacity: enter * leave, transform: `translateY(${(1 - enter) * 8}px)`, pointerEvents: 'none', backgroundColor: 'rgba(244,246,249,0.94)', borderTop: `6px solid ${INK.accent}`, padding: '20px 30px 24px'}}>
    <span style={{width: 14, height: 14, backgroundColor: INK.accent, flex: '0 0 auto'}} /><span>{text}</span>
  </div>;
};

const DIGITS = '0123456789';
export const DigitRoll = ({value, delay = 0, fontSize = 64, color = INK.accent}: {value: string; delay?: number; fontSize?: number; color?: string}) => {
  const frame = useCurrentFrame();
  const lineHeight = fontSize * 1.15;
  return <span style={{display: 'inline-flex', overflow: 'hidden', height: lineHeight, verticalAlign: 'bottom'}}>{value.split('').map((character, index) => {
    const target = DIGITS.indexOf(character);
    if (target < 0) return <span key={index} style={{fontFamily: SANS, fontSize, lineHeight: `${lineHeight}px`, color}}>{character}</span>;
    const progress = interpolate(frame, [delay + index * 4, delay + index * 4 + 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.25, 0.8, 0.25, 1)});
    return <span key={index} style={{display: 'inline-block', height: lineHeight}}><span style={{display: 'block', transform: `translateY(${-(10 + target) * progress * lineHeight}px)`}}>{(DIGITS + DIGITS).split('').map((digit, digitIndex) => <span key={digitIndex} style={{display: 'block', fontFamily: SANS, fontSize, fontWeight: 700, lineHeight: `${lineHeight}px`, color, fontVariantNumeric: 'tabular-nums'}}>{digit}</span>)}</span></span>;
  })}</span>;
};

export const BrandInkOpen = ({duration, brand = 'AXIO', kicker = 'AI 经营组织'}: {duration: number; brand?: string; kicker?: string}) => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const settledAt = Math.min(48, duration - BRAND_HOLD_FRAMES);
  const cross = interpolate(frame, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: PRESS_EASE});
  const kickerProgress = interpolate(frame, [24, settledAt], [0, kicker.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{backgroundColor: INK.page, justifyContent: 'center', alignItems: 'center'}}><div style={{textAlign: 'center'}}>
    <div style={{position: 'relative', width: 70, height: 70, margin: '0 auto 34px', opacity: cross}}><span style={{position: 'absolute', left: 32, top: 0, width: 6, height: 70, backgroundColor: INK.accent, transform: `scaleY(${cross})`}} /><span style={{position: 'absolute', left: 0, top: 32, width: 70, height: 6, backgroundColor: INK.accent, transform: `scaleX(${cross})`}} /></div>
    <div style={{display: 'flex', justifyContent: 'center', fontFamily: SANS, fontSize: Math.max(150, height * 0.08), fontWeight: 700, letterSpacing: 0, color: INK.ink}}>{brand.split('').map((character, index) => {const start = 8 + index * 4; const progress = interpolate(frame, [start, start + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: PRESS_EASE}); return <span key={index} style={{display: 'inline-block', opacity: 0.18 + progress * 0.82, transform: `scale(${1.35 - 0.35 * progress})`, filter: `blur(${(1 - progress) * 3}px)`}}>{character}</span>;})}</div>
    <div style={{minHeight: textSizeForFrame(height, 'support') * 1.25, marginTop: 30, fontFamily: SANS, fontSize: textSizeForFrame(height, 'support'), fontWeight: 700, letterSpacing: 0, color: INK.muted}}>{kicker.slice(0, Math.floor(kickerProgress))}</div>
  </div></AbsoluteFill>;
};

export type EvidenceBox = {file: string; x: number; y: number; w: number; h: number};
export const EvidenceCutout = ({box, opacity = 1, children}: {box: EvidenceBox; opacity?: number; children?: ReactNode}) => <div style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, opacity, overflow: 'hidden'}}><Img src={staticFile(`evidence/ink/${box.file}`)} style={{position: 'absolute', inset: 0, width: box.w, height: box.h}} />{children}</div>;

type PageMotionProps = {duration: number; pageSrc: string; emptySrc: string; pageH: number; box: EvidenceBox; keys: readonly CamKey[]; caption: string};
export const InkHeroSpotlight = ({duration, pageSrc, pageH, box, keys, caption}: Omit<PageMotionProps, 'emptySrc'>) => {
  const frame = useCurrentFrame();
  const rise = progressAt(frame, 28, 12);
  const reseat = progressAt(frame, duration - 34, 18);
  const lift = rise * (1 - reseat);
  const spot = interpolate(frame, [4, 18, 28], [0.18, 0.32, 0.46], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill><PageCam src={`evidence/ink/${pageSrc}`} pageH={pageH} keys={keys}>
    <div style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, transform: `translateZ(${80 * lift}px) scale(${1 + 0.025 * lift})`, transformStyle: 'preserve-3d', boxShadow: `0 ${36 * lift}px ${80 * lift}px rgba(17,17,17,${0.22 * lift})`, overflow: 'hidden', borderRadius: 8}}><Img src={staticFile(`evidence/ink/${box.file}`)} style={{width: box.w, height: box.h}} /><div style={{position: 'absolute', inset: 0, border: `3px solid ${INK.accent}`, opacity: lift}} /></div>
  </PageCam><AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(700px 520px at 50% 48%, rgba(255,255,255,0), rgba(17,17,17,${spot}))`}} /><InkCaption text={caption} duration={duration} /></AbsoluteFill>;
};

const PLAN_LABELS = ['经营目标', '证据计划', '成本核算', '获批执行', '结果回读', '复盘进化'];
export const InkDealFilter = ({duration, pageSrc, emptySrc, pageH, box, keys, caption, query = '经营目标'}: PageMotionProps & {query?: string}) => {
  const frame = useCurrentFrame();
  const motion = dealMotionAt(frame, duration, PLAN_LABELS.length, query.length);
  const cellW = (box.w - 42) / 3;
  const cellH = (box.h - 30) / 2;
  return <AbsoluteFill><PageCam src={`evidence/ink/${emptySrc}`} pageH={pageH} keys={keys}>
    <div style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, backgroundColor: INK.surface, border: `2px solid ${INK.accent}`, borderRadius: 10, overflow: 'hidden'}}>
      {PLAN_LABELS.map((label, index) => {
        const progress = motion.cardProgress[index];
        const x = 10 + (index % 3) * (cellW + 11);
        const y = 10 + Math.floor(index / 3) * cellH;
        const deckX = box.w * 0.79 - x;
        const deckY = -box.h * 0.8 - y;
        const isMatch = index === 0;
        const filterOpacity = isMatch ? 1 : 1 - motion.filter;
        return <div key={label} style={{position: 'absolute', left: x, top: y, width: cellW, height: cellH - 10, borderRadius: 8, backgroundColor: isMatch ? '#FFF1ED' : INK.page, border: `2px solid ${isMatch ? INK.accent : '#D7DEE8'}`, transform: `translate(${deckX * (1 - progress)}px, ${deckY * (1 - progress)}px) rotate(${(index - 2.5) * 3 * (1 - progress)}deg) scale(${1 + Math.sin(progress * Math.PI) * 0.08})`, opacity: progress * filterOpacity, boxShadow: progress < 0.99 ? '0 18px 38px rgba(17,17,17,0.22)' : '0 3px 9px rgba(17,17,17,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 24, color: INK.ink}}>{label}</div>;
      })}
      <div style={{position: 'absolute', left: 18, right: 18, top: 16, height: 48, backgroundColor: 'rgba(255,255,255,0.96)', border: '2px solid #D7DEE8', borderRadius: 8, padding: '5px 16px', fontFamily: SANS, fontSize: 26, fontWeight: 700, color: INK.ink, opacity: frame >= Math.round(duration * 0.45) - 4 ? 1 : 0}}>{query.slice(0, motion.typedChars)}<span style={{color: INK.accent}}>|</span></div>
      {motion.filter > 0 ? <EvidenceCutout box={{...box, x: 0, y: 0}} opacity={motion.filter} /> : null}
    </div>
  </PageCam><InkCaption text={caption} duration={duration} /></AbsoluteFill>;
};

export const InkRowEmbed = ({duration, pageSrc: _pageSrc, emptySrc, pageH, box, keys, caption, rows = 5}: PageMotionProps & {rows?: number}) => {
  const frame = useCurrentFrame();
  const progress = rowEmbedAt(frame, duration, rows);
  const sliceH = box.h / rows;
  return <AbsoluteFill><PageCam src={`evidence/ink/${emptySrc}`} pageH={pageH} keys={keys}>{progress.map((value, index) => <div key={index} style={{position: 'absolute', left: box.x, top: box.y + index * sliceH, width: box.w, height: sliceH + 1, overflow: 'hidden', transform: `perspective(900px) translateY(${-150 * (1 - value)}px) rotateX(${16 * (1 - value)}deg) scale(${1.05 - 0.05 * value})`, opacity: value, boxShadow: value < 0.999 ? '0 28px 54px rgba(17,17,17,0.22)' : 'none'}}><Img src={staticFile(`evidence/ink/${box.file}`)} style={{position: 'absolute', left: 0, top: -index * sliceH, width: box.w, height: box.h}} /><div style={{position: 'absolute', left: `${(1 - value) * 50}%`, right: `${(1 - value) * 50}%`, bottom: 0, height: 3, backgroundColor: INK.accent}} /></div>)}</PageCam><InkCaption text={caption} duration={duration} /></AbsoluteFill>;
};

export const InkStackPress = ({duration, pageSrc: _pageSrc, emptySrc, pageH, box, keys, caption, labels}: PageMotionProps & {labels: readonly string[]}) => {
  const frame = useCurrentFrame();
  const states = stackPressAt(frame, duration, labels.length);
  const rowH = Math.max(42, box.h);
  return <AbsoluteFill><PageCam src={`evidence/ink/${emptySrc}`} pageH={Math.max(pageH, box.y + rowH * labels.length + 80)} keys={keys}><EvidenceCutout box={box} opacity={0.3} />{labels.map((label, index) => {const state = states[index]; return <div key={label} style={{position: 'absolute', left: box.x, top: box.y + index * (rowH + 8), width: box.w, height: rowH, transform: `translateY(${260 * (1 - state.progress) + state.press * 8}px) rotate(${(index % 2 ? -2 : 2) * (1 - state.progress)}deg) scale(${1.05 - 0.05 * state.progress})`, opacity: state.progress, backgroundColor: INK.surface, borderLeft: `8px solid ${index === 0 ? INK.accent : INK.verified}`, boxShadow: state.progress < 0.999 ? '0 25px 55px rgba(17,17,17,0.20)' : '0 3px 10px rgba(17,17,17,0.10)', display: 'flex', alignItems: 'center', padding: '0 24px', boxSizing: 'border-box', fontFamily: SANS, fontSize: 30, fontWeight: 700, color: INK.ink}}><span style={{color: INK.muted, width: 54}}>{String(index + 1).padStart(2, '0')}</span>{label}</div>;})}</PageCam><div style={{position: 'absolute', top: 90, right: 120, fontFamily: SANS, fontSize: 86, fontWeight: 700, color: INK.accent}}>{states.filter((state) => state.progress >= 0.999).length}<span style={{fontSize: 34, color: INK.muted}}> / {labels.length}</span></div><InkCaption text={caption} duration={duration} /></AbsoluteFill>;
};

export const InkDocumentReveal = ({duration, pageSrc: _pageSrc, emptySrc, pageH, box, keys, caption, rows = 5}: PageMotionProps & {rows?: number}) => {
  const frame = useCurrentFrame();
  const state = documentRevealAt(frame, duration, rows);
  const sliceH = box.h / rows;
  return <AbsoluteFill><PageCam src={`evidence/ink/${emptySrc}`} pageH={pageH} keys={keys}>{state.rows.map((progress, index) => <div key={index} style={{position: 'absolute', left: box.x, top: box.y + index * sliceH, width: box.w, height: sliceH + 1, overflow: 'hidden'}}><Img src={staticFile(`evidence/ink/${box.file}`)} style={{position: 'absolute', left: 0, top: -index * sliceH, width: box.w, height: box.h}} /><div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: `${(1 - progress) * 100}%`, backgroundColor: INK.surface}} />{progress > 0 && progress < 0.999 ? <div style={{position: 'absolute', left: `${progress * 100}%`, top: 4, bottom: 4, width: 3, backgroundColor: INK.accent}} /> : null}</div>)}</PageCam>{state.verified ? <div style={{position: 'absolute', right: '9%', top: '13%', padding: '18px 32px', backgroundColor: INK.verified, color: INK.surface, fontFamily: SANS, fontSize: 72, fontWeight: 700, letterSpacing: 0, transform: `scale(${0.94 + state.verifyProgress * 0.06})`}}>已验证</div> : null}<InkCaption text={`${caption}${state.verified ? ' · 已验证' : ''}`} duration={duration} /></AbsoluteFill>;
};

export type InkOutroItem = {key: string; src: string; width: number; height: number; x: number; y: number; dx: number; dy: number; rotate?: number};
const DUST = Array.from({length: 20}, (_, index) => ({x: (index * 439 + 137) % 1920, y: (index * 613 + 271) % 1080, size: 3 + index % 4}));
export const InkOutro = ({duration, items, brand = 'AXIO', tagline, holdFrames = BRAND_HOLD_FRAMES}: {duration: number; items: readonly InkOutroItem[]; brand?: string; tagline: string; holdFrames?: number}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const motion = outroMotionAt(frame, duration, items.length, holdFrames);
  const crane = progressAt(motion.visualFrame, 0, Math.max(24, motion.stableFrom - 28));
  const sparkle = motion.rule * (1 - progressAt(motion.visualFrame, motion.stableFrom - 8, 8));
  return <AbsoluteFill style={{backgroundColor: INK.page, overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `perspective(1600px) rotateX(${4 * (1 - crane)}deg) scale(${1.06 - 0.06 * crane})`, transformOrigin: '50% 45%'}}>{items.map((item, index) => {const progress = motion.itemProgress[index]; return <div key={item.key} style={{position: 'absolute', left: item.x, top: item.y, width: item.width, height: item.height, transform: `translate(${item.dx * (1 - progress)}px, ${item.dy * (1 - progress)}px) rotate(${(item.rotate ?? 0) * progress}deg) scale(${1.1 - 0.1 * progress})`, opacity: progress * (1 - motion.brand * 0.16), overflow: 'hidden', backgroundColor: INK.surface, borderRadius: 8, boxShadow: '0 18px 48px rgba(17,17,17,0.18)'}}><Img src={staticFile(item.src)} style={{width: item.width, height: item.height}} /></div>;})}</AbsoluteFill>
    <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(${Math.min(width, height) * 0.42}px ${Math.min(width, height) * 0.28}px at 50% 48%, rgba(255,255,255,${0.82 * motion.brand}), transparent 72%)`}} />
    <AbsoluteFill style={{pointerEvents: 'none'}}>{DUST.map((dust, index) => <span key={index} style={{position: 'absolute', left: (dust.x / 1920) * width + Math.sin(motion.visualFrame * 0.025 + index) * 18, top: ((dust.y - motion.visualFrame * (0.4 + index % 3 * 0.12) + height) % height), width: dust.size, height: dust.size, backgroundColor: index % 3 ? INK.accent : INK.verified, opacity: 0.22}} />)}</AbsoluteFill>
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', pointerEvents: 'none'}}><div style={{textAlign: 'center', transform: `scale(${0.92 + motion.brand * 0.08})`, opacity: motion.brand}}><div style={{fontFamily: SANS, fontSize: Math.min(width * 0.12, height * 0.16), fontWeight: 700, letterSpacing: 0, color: INK.ink}}>{brand}</div><div style={{width: Math.min(420, width * 0.28), height: 10, margin: '34px auto 0', backgroundColor: INK.accent, transform: `scaleX(${motion.rule})`}} /><div style={{fontFamily: SANS, fontSize: textSizeForFrame(height, 'support'), fontWeight: 700, letterSpacing: 0, color: INK.muted, marginTop: 28}}>{tagline}</div></div></AbsoluteFill>
    <AbsoluteFill style={{pointerEvents: 'none', opacity: sparkle}}>{Array.from({length: 16}, (_, index) => {const angle = (index / 16) * Math.PI * 2; const radius = Math.min(width, height) * 0.24 * motion.rule; return <span key={index} style={{position: 'absolute', left: width / 2 + Math.cos(angle) * radius, top: height / 2 + Math.sin(angle) * radius, width: 9, height: 9, backgroundColor: index % 2 ? INK.accent : INK.verified}} />;})}</AbsoluteFill>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 12, backgroundColor: INK.accent, transform: `scaleX(${0.08 + motion.rule * 0.92})`, transformOrigin: 'left'}} />
  </AbsoluteFill>;
};
