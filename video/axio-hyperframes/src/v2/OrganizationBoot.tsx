import type {FC} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {V2, range} from './theme';

type Point = {x: number; y: number};
type NodeSpec = Point & {
  id: string;
  name: string;
  role: string;
  emphasis?: boolean;
};

const landscapeNodes: NodeSpec[] = [
  {id: 'founder', name: 'FOUNDER', role: '最终治理权', x: 50, y: 10},
  {id: 'accio', name: 'ACCIO 超级主管', role: '监督 · 纠偏 · 治理', x: 22, y: 37},
  {id: 'agent', name: '专业 AGENT', role: '结构化建议层', x: 78, y: 37},
  {id: 'supervisor', name: 'AI 主管', role: '唯一正式任务派发者', x: 50, y: 47, emphasis: true},
  {id: 'g1', name: 'G1 API', role: '确定性执行器', x: 18, y: 78},
  {id: 'g2', name: 'G2 浏览器', role: '确定性执行器', x: 39, y: 78},
  {id: 'listing', name: 'LISTING', role: '上架 · 图片 · 定价', x: 61, y: 78},
  {id: 'ops', name: 'OPERATIONS', role: '清理 · 营销 · 回读', x: 82, y: 78},
];

const portraitNodes: NodeSpec[] = [
  {id: 'founder', name: 'FOUNDER', role: '最终治理权', x: 50, y: 8},
  {id: 'accio', name: 'ACCIO 超级主管', role: '监督 · 纠偏 · 治理', x: 27, y: 28},
  {id: 'agent', name: '专业 AGENT', role: '建议层', x: 73, y: 28},
  {id: 'supervisor', name: 'AI 主管', role: '唯一正式派发者', x: 50, y: 48, emphasis: true},
  {id: 'g1', name: 'G1 API', role: '执行器', x: 25, y: 73},
  {id: 'g2', name: 'G2 浏览器', role: '执行器', x: 75, y: 73},
  {id: 'listing', name: 'LISTING', role: '上架 · 定价', x: 25, y: 88},
  {id: 'ops', name: 'OPS', role: '营销 · 回读', x: 75, y: 88},
];

const edges = [
  ['founder', 'accio', 'governance'],
  ['founder', 'supervisor', 'governance'],
  ['accio', 'supervisor', 'governance'],
  ['agent', 'supervisor', 'advice'],
  ['supervisor', 'g1', 'dispatch'],
  ['supervisor', 'g2', 'dispatch'],
  ['supervisor', 'listing', 'dispatch'],
  ['supervisor', 'ops', 'dispatch'],
] as const;

const Node: FC<{node: NodeSpec; portrait: boolean; index: number}> = ({
  node,
  portrait,
  index,
}) => {
  const frame = useCurrentFrame();
  const p = range(frame, 10 + index * 5, 22 + index * 5);
  return (
    <div style={{
      position: 'absolute',
      left: `${node.x}%`,
      top: `${node.y}%`,
      transform: `translate(-50%, -50%) translateY(${(1 - p) * 26}px)`,
      width: portrait ? (node.emphasis ? 520 : 340) : (node.emphasis ? 760 : 500),
      padding: portrait ? '18px 22px' : '24px 30px',
      color: node.emphasis ? V2.paper : V2.ink,
      background: node.emphasis ? V2.orange : V2.paper,
      border: node.emphasis ? 'none' : '1px solid #CBC5BC',
      boxShadow: node.emphasis
        ? '0 28px 80px rgba(238,77,45,.32)'
        : '0 16px 44px rgba(17,17,17,.09)',
      opacity: p,
      zIndex: node.emphasis ? 4 : 3,
    }}>
      <div style={{
        fontSize: portrait ? (node.emphasis ? 32 : 24) : (node.emphasis ? 46 : 30),
        fontWeight: 900,
        whiteSpace: 'nowrap',
      }}>
        {node.name}
      </div>
      <div style={{
        marginTop: 8,
        fontSize: portrait ? 18 : 23,
        color: node.emphasis ? 'rgba(255,255,255,.86)' : V2.muted,
        whiteSpace: 'nowrap',
      }}>
        {node.role}
      </div>
    </div>
  );
};

export const OrganizationBoot: FC<{portrait?: boolean}> = ({
  portrait = false,
}) => {
  const frame = useCurrentFrame();
  const nodes = portrait ? portraitNodes : landscapeNodes;
  const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));
  return (
    <div style={{position: 'absolute', inset: portrait ? '160px 50px 150px' : '180px 160px 150px'}}>
      <svg
        viewBox='0 0 100 100'
        preserveAspectRatio='none'
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1}}
      >
        <defs>
          <marker id='arrow-orange' markerWidth='4' markerHeight='4' refX='3.3' refY='2' orient='auto'>
            <path d='M0,0 L4,2 L0,4 Z' fill='#EE4D2D' />
          </marker>
          <marker id='arrow-ink' markerWidth='4' markerHeight='4' refX='3.3' refY='2' orient='auto'>
            <path d='M0,0 L4,2 L0,4 Z' fill='#111111' />
          </marker>
          <marker id='arrow-muted' markerWidth='4' markerHeight='4' refX='3.3' refY='2' orient='auto'>
            <path d='M0,0 L4,2 L0,4 Z' fill='#8D8880' />
          </marker>
        </defs>
        {edges.map(([from, to, role], index) => {
          const start = byId[from];
          const end = byId[to];
          const length = Math.hypot(end.x - start.x, end.y - start.y);
          const p = range(frame, 18 + index * 4, 36 + index * 4);
          const color = role === 'dispatch' ? V2.orange : role === 'advice' ? '#8D8880' : V2.ink;
          return (
            <line
              key={`${from}-${to}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={color}
              strokeWidth={role === 'dispatch' ? 0.28 : 0.16}
              strokeDasharray={role === 'advice' ? '1.2 1.2' : length}
              strokeDashoffset={role === 'advice' ? 0 : interpolate(p, [0, 1], [length, 0])}
              opacity={p}
              strokeLinecap='round'
              markerEnd={`url(#arrow-${role === 'dispatch' ? 'orange' : role === 'advice' ? 'muted' : 'ink'})`}
            />
          );
        })}
      </svg>
      {nodes.map((node, index) => (
        <Node key={node.id} node={node} portrait={portrait} index={index} />
      ))}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: portrait ? '60%' : '61%',
        transform: 'translateX(-50%)',
        fontSize: portrait ? 20 : 28,
        fontWeight: 900,
        color: V2.paper,
        background: V2.orange,
        padding: portrait ? '8px 12px' : '10px 16px',
        opacity: range(frame, 58, 72),
        zIndex: 5,
      }}>
        FORMAL DISPATCH / 正式派发
      </div>
    </div>
  );
};
