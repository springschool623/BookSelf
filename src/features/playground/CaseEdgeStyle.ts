import type { Edge } from '@xyflow/react';
import type { CaseEdge, CaseEdgeKind } from '@/types';

export const CASE_EDGE_STYLES: Record<
  CaseEdgeKind,
  { stroke: string; strokeWidth: number; strokeDasharray?: string; animated: boolean }
> = {
  suspect: {
    stroke: '#dc2626',
    strokeWidth: 2.5,
    animated: false,
  },
  contradicts: {
    stroke: '#eab308',
    strokeWidth: 2.5,
    strokeDasharray: '6 4',
    animated: true,
  },
  alibi: {
    stroke: '#16a34a',
    strokeWidth: 2.2,
    animated: false,
  },
  related: {
    stroke: '#78716c',
    strokeWidth: 1.5,
    animated: false,
  },
};

export function toReactFlowEdge(
  edge: CaseEdge,
  dimmed: boolean
): Edge {
  const styleCfg = CASE_EDGE_STYLES[edge.kind ?? 'related'];
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: styleCfg.animated && !dimmed,
    style: {
      stroke: styleCfg.stroke,
      strokeWidth: styleCfg.strokeWidth,
      strokeDasharray: styleCfg.strokeDasharray,
      opacity: dimmed ? 0.18 : 1,
    },
    labelStyle: {
      fontSize: 11,
      fontWeight: 600,
      fill: styleCfg.stroke,
      opacity: dimmed ? 0.2 : 1,
    },
    labelBgStyle: {
      fill: 'var(--bg-card)',
      fillOpacity: 0.9,
    },
    data: { kind: edge.kind },
  };
}
