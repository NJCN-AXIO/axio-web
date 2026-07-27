import type {CSSProperties, FC, ReactNode} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {V2, range} from './theme';

export const Stage: FC<{
  children: ReactNode;
  dark?: boolean;
  orange?: boolean;
  portrait?: boolean;
}> = ({children, dark = false, orange = false, portrait = false}) => {
  const background = orange ? V2.orange : dark ? V2.ink : V2.warm;
  const color = orange || dark ? V2.paper : V2.ink;
  return (
    <AbsoluteFill
      style={{
        background,
        color,
        fontFamily: V2.font,
        letterSpacing: 0,
        overflow: 'hidden',
      }}
    >
      {!dark && !orange ? <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(17,17,17,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,.045) 1px, transparent 1px)',
        backgroundSize: portrait ? '72px 72px' : '120px 120px',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,.5), transparent 78%)',
      }} /> : null}
      <div style={{position: 'absolute', inset: 0}}>{children}</div>
    </AbsoluteFill>
  );
};

export const BrandMark: FC<{portrait?: boolean; light?: boolean}> = ({
  portrait = false,
  light = false,
}) => (
  <div style={{
    position: 'absolute',
    top: portrait ? 42 : 62,
    right: portrait ? 62 : 100,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    fontSize: portrait ? 24 : 30,
    fontWeight: 900,
    color: light ? V2.paper : V2.ink,
    zIndex: 20,
  }}>
    <span style={{width: 18, height: 18, background: V2.orange, display: 'inline-block'}} />
    AXIO 智核
  </div>
);

export const Kicker: FC<{children: ReactNode; light?: boolean}> = ({
  children,
  light = false,
}) => (
  <div style={{
    color: light ? V2.orangeSoft : V2.orange,
    fontSize: 28,
    lineHeight: 1,
    fontWeight: 900,
    textTransform: 'uppercase',
    marginBottom: 28,
  }}>
    {children}
  </div>
);

export const VoiceCaption: FC<{
  children: ReactNode;
  portrait?: boolean;
  light?: boolean;
}> = ({children, portrait = false, light = false}) => (
  <div style={{
    position: 'absolute',
    left: portrait ? 70 : 150,
    right: portrait ? 70 : 150,
    bottom: portrait ? 36 : 48,
    paddingTop: portrait ? 14 : 18,
    borderTop: `2px solid ${light ? 'rgba(255,255,255,.36)' : 'rgba(17,17,17,.18)'}`,
    color: light ? 'rgba(255,255,255,.9)' : '#353330',
    fontSize: portrait ? 24 : 32,
    lineHeight: 1.45,
    fontWeight: 600,
    zIndex: 30,
  }}>
    {children}
  </div>
);

export const ImpactText: FC<{
  children: ReactNode;
  style?: CSSProperties;
  delay?: number;
}> = ({children, style, delay = 0}) => {
  const frame = useCurrentFrame();
  const p = range(frame, delay, delay + 14);
  return (
    <div style={{
      opacity: p,
      transform: `translateY(${interpolate(p, [0, 1], [42, 0])}px)`,
      ...style,
    }}>
      {children}
    </div>
  );
};

export const OrangeRule: FC<{progress: number; vertical?: boolean}> = ({
  progress,
  vertical = false,
}) => (
  <div style={{
    width: vertical ? 10 : `${progress * 100}%`,
    height: vertical ? `${progress * 100}%` : 10,
    background: V2.orange,
    transformOrigin: 'left top',
  }} />
);
