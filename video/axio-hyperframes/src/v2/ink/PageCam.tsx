import type {ReactNode} from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type CamKey = {
  frame: number;
  cx: number;
  cy: number;
  zoom: number;
  rotX?: number;
  rotY?: number;
  rotZ?: number;
  persp?: number;
};

type PageCamProps = {
  src: string;
  pageW?: number;
  pageH: number;
  keys: readonly CamKey[];
  children?: ReactNode;
  blur?: number;
  saturate?: number;
  ease?: (value: number) => number;
  dof?: {focusY: number; strength: number};
};

const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;

export const PageCam = ({
  src,
  pageW = 1440,
  pageH,
  keys,
  children,
  blur = 0,
  saturate = 1,
  ease = Easing.bezier(0.33, 0, 0.15, 1),
  dof,
}: PageCamProps) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  if (keys.length === 0) throw new Error('PageCam requires at least one camera key');

  let from = keys[0];
  let to = keys[keys.length - 1];
  for (let index = 0; index < keys.length - 1; index += 1) {
    if (frame >= keys[index].frame && frame <= keys[index + 1].frame) {
      from = keys[index];
      to = keys[index + 1];
      break;
    }
  }

  const progress = from.frame === to.frame ? 1 : interpolate(frame, [from.frame, to.frame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const cx = lerp(from.cx, to.cx, progress);
  const cy = lerp(from.cy, to.cy, progress);
  const zoom = lerp(from.zoom, to.zoom, progress);
  const filters = [blur > 0 ? `blur(${blur}px)` : '', saturate !== 1 ? `saturate(${saturate})` : '']
    .filter(Boolean)
    .join(' ');
  const has3D = keys.some((key) => key.rotX !== undefined || key.rotY !== undefined || key.rotZ !== undefined || key.persp !== undefined);
  const centerX = width / 2;
  const centerY = height / 2;

  if (!has3D) {
    return (
      <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#F4F6F9'}}>
        <div style={{
          position: 'absolute',
          width: pageW,
          height: pageH,
          transform: `translate(${centerX - cx * zoom}px, ${centerY - cy * zoom}px) scale(${zoom})`,
          transformOrigin: '0 0',
          filter: filters || undefined,
        }}>
          <Img src={staticFile(src)} style={{position: 'absolute', width: pageW, height: pageH}} />
          {children}
        </div>
      </AbsoluteFill>
    );
  }

  const rotX = lerp(from.rotX ?? 0, to.rotX ?? 0, progress);
  const rotY = lerp(from.rotY ?? 0, to.rotY ?? 0, progress);
  const rotZ = lerp(from.rotZ ?? 0, to.rotZ ?? 0, progress);
  const persp = lerp(from.persp ?? 1400, to.persp ?? 1400, progress);

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#F4F6F9'}}>
      <div style={{
        position: 'absolute',
        inset: 0,
        perspective: `${persp * zoom}px`,
        perspectiveOrigin: `${centerX}px ${centerY}px`,
      }}>
        <div style={{
          position: 'absolute',
          width: pageW,
          height: pageH,
          zoom,
          transform: `translate(${centerX / zoom - cx}px, ${centerY / zoom - cy}px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rotZ}deg)`,
          transformOrigin: `${cx}px ${cy}px`,
          transformStyle: 'preserve-3d',
          filter: filters || undefined,
        }}>
          <Img src={staticFile(src)} style={{position: 'absolute', width: pageW, height: pageH}} />
          {children}
        </div>
      </div>
      {dof ? (
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: Math.max(0, dof.focusY),
          backdropFilter: `blur(${dof.strength}px)`,
          WebkitBackdropFilter: `blur(${dof.strength}px)`,
          maskImage: 'linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      ) : null}
    </AbsoluteFill>
  );
};
