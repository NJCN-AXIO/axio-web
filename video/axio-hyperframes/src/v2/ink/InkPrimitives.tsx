import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {getOutroLocalActionFrames} from '../action-contract';

export const INK = {
  accent: '#EE4D2D',
  ink: '#111111',
  page: '#F4F6F9',
  surface: '#FFFFFF',
  muted: '#65758B',
  verified: '#0D7657',
} as const;

export const FLASH_CUT_FRAMES = 10;
export const TITLE_HOLD_FRAMES = 30;
export const BATCH_SETTLE_FRAMES = 15;
export const BRAND_HOLD_FRAMES = 30;

const SANS = 'Inter, "Microsoft YaHei", "PingFang SC", sans-serif';
const FLY_EASE = Easing.bezier(0.34, 1.4, 0.44, 1);
const PRESS_EASE = Easing.bezier(0.2, 0.75, 0.3, 1);

export type InkSegment = {text: string; accent?: boolean};

export const InkTitleCard = ({duration, segments, sub}: {
  duration: number;
  segments: readonly InkSegment[];
  sub?: string;
}) => {
  const frame = useCurrentFrame();
  const settleAt = Math.min(4 + Math.max(0, segments.length - 1) * 4 + 9, duration - TITLE_HOLD_FRAMES);
  const fadeOut = interpolate(frame, [duration - 8, duration], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const rule = interpolate(frame, [Math.max(12, settleAt - 8), settleAt], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.3, 0, 0.2, 1),
  });

  return (
    <AbsoluteFill style={{backgroundColor: INK.page, justifyContent: 'center', alignItems: 'center', opacity: fadeOut}}>
      <div style={{width: '84%', textAlign: 'center'}}>
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.28em',
          fontFamily: SANS, fontSize: 112, fontWeight: 700, lineHeight: 1.16,
          letterSpacing: 0, color: INK.ink,
        }}>
          {segments.map((segment, index) => {
            const start = 4 + index * 4;
            const progress = interpolate(frame, [start, start + 9], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: PRESS_EASE,
            });
            return (
              <span key={`${segment.text}-${index}`} style={{
                display: 'inline-block', opacity: 0.14 + progress * 0.86,
                transform: `scale(${1.18 - 0.18 * progress})`,
                filter: `blur(${(1 - progress) * 4}px)`,
                color: segment.accent ? INK.accent : INK.ink,
              }}>{segment.text}</span>
            );
          })}
        </div>
        <div style={{height: 8, width: 260, margin: '40px auto 0', backgroundColor: INK.accent, transform: `scaleX(${rule})`}} />
        {sub ? <div style={{fontFamily: SANS, fontSize: 30, fontWeight: 700, letterSpacing: 0, color: INK.muted, marginTop: 32}}>{sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

export const FlashCut = ({duration = FLASH_CUT_FRAMES}: {duration?: number}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, duration * 0.4, duration], [0, 0.88, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return <AbsoluteFill style={{pointerEvents: 'none', opacity, backgroundColor: INK.surface}} />;
};

export const InkCaption = ({text, duration, bottom = 72}: {text: string; duration: number; bottom?: number}) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const leave = interpolate(frame, [duration - 8, duration], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{
      position: 'absolute', left: '8%', right: '8%', bottom,
      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18,
      fontFamily: SANS, fontSize: 34, fontWeight: 700, letterSpacing: 0, color: INK.ink,
      opacity: enter * leave, transform: `translateY(${(1 - enter) * 8}px)`, pointerEvents: 'none',
    }}>
      <span style={{width: 10, height: 10, backgroundColor: INK.accent, flex: '0 0 auto'}} />
      <span>{text}</span>
    </div>
  );
};

const DIGITS = '0123456789';

export const DigitRoll = ({value, delay = 0, fontSize = 64, color = INK.accent}: {
  value: string; delay?: number; fontSize?: number; color?: string;
}) => {
  const frame = useCurrentFrame();
  const lineHeight = fontSize * 1.15;
  return (
    <span style={{display: 'inline-flex', overflow: 'hidden', height: lineHeight, verticalAlign: 'bottom'}}>
      {value.split('').map((character, index) => {
        const target = DIGITS.indexOf(character);
        if (target < 0) return <span key={index} style={{fontFamily: SANS, fontSize, lineHeight: `${lineHeight}px`, color}}>{character}</span>;
        const progress = interpolate(frame, [delay + index * 4, delay + index * 4 + 22], [0, 1], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.25, 0.8, 0.25, 1),
        });
        const offset = (10 + target) * progress * lineHeight;
        return (
          <span key={index} style={{display: 'inline-block', height: lineHeight}}>
            <span style={{display: 'block', transform: `translateY(${-offset}px)`}}>
              {(DIGITS + DIGITS).split('').map((digit, digitIndex) => (
                <span key={digitIndex} style={{display: 'block', fontFamily: SANS, fontSize, fontWeight: 700, lineHeight: `${lineHeight}px`, color, fontVariantNumeric: 'tabular-nums'}}>{digit}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
};

export const BrandInkOpen = ({duration, brand = 'AXIO', kicker = 'AI 经营组织'}: {
  duration: number; brand?: string; kicker?: string;
}) => {
  const frame = useCurrentFrame();
  const settledAt = Math.min(48, duration - BRAND_HOLD_FRAMES);
  const cross = interpolate(frame, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: PRESS_EASE});
  const kickerProgress = interpolate(frame, [24, settledAt], [0, kicker.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: INK.page, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <div style={{position: 'relative', width: 70, height: 70, margin: '0 auto 34px', opacity: cross}}>
          <span style={{position: 'absolute', left: 32, top: 0, width: 6, height: 70, backgroundColor: INK.accent, transform: `scaleY(${cross})`}} />
          <span style={{position: 'absolute', left: 0, top: 32, width: 70, height: 6, backgroundColor: INK.accent, transform: `scaleX(${cross})`}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'center', fontFamily: SANS, fontSize: 150, fontWeight: 700, letterSpacing: 0, color: INK.ink}}>
          {brand.split('').map((character, index) => {
            const start = 8 + index * 4;
            const progress = interpolate(frame, [start, start + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: PRESS_EASE});
            return <span key={index} style={{display: 'inline-block', opacity: 0.18 + progress * 0.82, transform: `scale(${1.35 - 0.35 * progress})`, filter: `blur(${(1 - progress) * 3}px)`}}>{character}</span>;
          })}
        </div>
        <div style={{height: 36, marginTop: 30, fontFamily: SANS, fontSize: 30, fontWeight: 700, letterSpacing: 0, color: INK.muted}}>
          {kicker.slice(0, Math.floor(kickerProgress))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export type InkOutroItem = {
  key: string; src: string; width: number; height: number;
  x: number; y: number; dx: number; dy: number; rotate?: number;
};

export const InkOutro = ({duration, items, brand = 'AXIO', tagline}: {
  duration: number; items: readonly InkOutroItem[]; brand?: string; tagline: string;
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const {settle: settleAt, brand: brandAt, impact: impactAt, sparkle: sparkleAt} = getOutroLocalActionFrames(duration);
  const riserT = interpolate(frame, [0, settleAt], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const impactT = interpolate(frame, [impactAt, brandAt + 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: PRESS_EASE});
  const sparkleT = interpolate(frame, [sparkleAt, brandAt + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: INK.page, overflow: 'hidden'}}>
      {items.map((item, index) => {
        const cue = index === 0 ? -6 : Math.round((index / Math.max(1, items.length)) * Math.max(1, settleAt - 12));
        const progress = interpolate(frame, [cue, cue + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: FLY_EASE});
        return (
          <div key={item.key} style={{
            position: 'absolute', left: item.x, top: item.y, width: item.width, height: item.height,
            transform: `translate(${item.dx * (1 - progress)}px, ${item.dy * (1 - progress)}px) rotate(${(item.rotate ?? 0) * progress}deg)`,
            opacity: progress * (1 - impactT * 0.18), overflow: 'hidden', backgroundColor: INK.surface,
            boxShadow: '0 16px 40px rgba(17,17,17,0.16)',
          }}><Img src={staticFile(item.src)} style={{width: item.width, height: item.height}} /></div>
        );
      })}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', pointerEvents: 'none'}}>
        <div style={{textAlign: 'center', transform: `scale(${0.94 + impactT * 0.06})`, opacity: impactT}}>
          <div style={{fontFamily: SANS, fontSize: Math.min(width * 0.12, height * 0.16), fontWeight: 700, letterSpacing: 0, color: INK.ink}}>{brand}</div>
          <div style={{width: 280, height: 8, margin: '34px auto 0', backgroundColor: INK.accent, transform: `scaleX(${impactT})`}} />
          <div style={{fontFamily: SANS, fontSize: 32, fontWeight: 700, letterSpacing: 0, color: INK.muted, marginTop: 28}}>{tagline}</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{pointerEvents: 'none', opacity: sparkleT * (1 - sparkleT)}}>
        {Array.from({length: 12}, (_, index) => {
          const angle = (index / 12) * Math.PI * 2;
          const radius = Math.min(width, height) * 0.22 * sparkleT;
          return <span key={index} style={{position: 'absolute', left: width / 2 + Math.cos(angle) * radius, top: height / 2 + Math.sin(angle) * radius, width: 8, height: 8, backgroundColor: index % 2 === 0 ? INK.accent : INK.verified}} />;
        })}
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, backgroundColor: INK.accent, transform: `scaleX(${0.08 + riserT * 0.92})`, transformOrigin: 'left'}} />
    </AbsoluteFill>
  );
};
