import type {FC} from 'react';
import {interpolate, staticFile, useCurrentFrame} from 'remotion';
import {evidenceState} from './evidence-model';
import {V2, range} from './theme';

export const EvidenceLens: FC<{
  asset: string;
  portrait?: boolean;
  label: string;
  start?: number;
}> = ({asset, portrait = false, label, start = 0}) => {
  const local = Math.max(0, useCurrentFrame() - start);
  const state = evidenceState(local);
  const enter = range(local, 0, 16);
  const zoom = state.mode === 'focus'
    ? interpolate(state.progress, [0, 1], [1, 1.075])
    : interpolate(state.progress, [0, 1], [1.075, 1]);
  return (
    <div style={{
      position: 'relative',
      height: portrait ? 700 : 1160,
      width: '100%',
      background: V2.paper,
      border: '1px solid #D8D2CA',
      boxShadow: '0 40px 100px rgba(17,17,17,.16)',
      overflow: 'hidden',
      opacity: enter,
      transform: `translateY(${(1 - enter) * 38}px)`,
    }}>
      <img
        src={staticFile(`evidence/${asset}`)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: `scale(${zoom})`,
          transition: 'none',
        }}
      />
      <div style={{
        position: 'absolute',
        top: portrait ? 22 : 30,
        left: portrait ? 22 : 30,
        padding: portrait ? '10px 14px' : '12px 18px',
        background: V2.ink,
        color: V2.paper,
        fontSize: portrait ? 20 : 26,
        fontWeight: 900,
      }}>
        {state.mode === 'complete' ? '完整功能模块' : label}
      </div>
      <div style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        height: 8,
        width: `${state.mode === 'focus' ? state.progress * 100 : 100}%`,
        background: V2.orange,
      }} />
    </div>
  );
};
