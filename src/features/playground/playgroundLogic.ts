import dagre from '@dagrejs/dagre';
import { nanoid } from 'nanoid';
import type { CaseEdge, CaseNode, Note } from '@/types';

export function getMaxChapter(nodes: CaseNode[]): number {
  let max = 0;
  for (const node of nodes) {
    if (typeof node.data.chapter === 'number' && node.data.chapter > max) {
      max = node.data.chapter;
    }
  }
  return max;
}

export function filterBoardByChapter(
  nodes: CaseNode[],
  edges: CaseEdge[],
  maxChapter: number | null
): { visibleNodes: CaseNode[]; visibleEdges: CaseEdge[] } {
  if (maxChapter === null) {
    return { visibleNodes: nodes, visibleEdges: edges };
  }

  const visibleNodes = nodes.filter(
    (node) =>
      typeof node.data.chapter !== 'number' || node.data.chapter <= maxChapter
  );
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = edges.filter(
    (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  );

  return { visibleNodes, visibleEdges };
}

export function computeSpotlightIds(
  selectedNodeId: string | null,
  edges: CaseEdge[]
): { highlightedNodeIds: Set<string>; highlightedEdgeIds: Set<string> } {
  const highlightedNodeIds = new Set<string>();
  const highlightedEdgeIds = new Set<string>();

  if (!selectedNodeId) {
    return { highlightedNodeIds, highlightedEdgeIds };
  }

  highlightedNodeIds.add(selectedNodeId);

  for (const edge of edges) {
    if (edge.source === selectedNodeId || edge.target === selectedNodeId) {
      highlightedEdgeIds.add(edge.id);
      highlightedNodeIds.add(edge.source);
      highlightedNodeIds.add(edge.target);
    }
  }

  return { highlightedNodeIds, highlightedEdgeIds };
}

export function parseChapterNumber(chapterText?: string): number | undefined {
  if (!chapterText) return undefined;
  const match = chapterText.match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

export function createNodeFromBookNote(
  note: Note,
  existingCount: number
): CaseNode {
  const shortLabel =
    note.content.length > 48
      ? `${note.content.slice(0, 48).trim()}…`
      : note.content;

  return {
    id: `clue-${nanoid(6)}`,
    type: 'clue',
    position: {
      x: 120 + ((existingCount * 36) % 360),
      y: 120 + ((existingCount * 28) % 240),
    },
    data: {
      label: shortLabel,
      description: note.content,
      chapter: parseChapterNumber(note.chapter),
      page: note.page,
      reliability: note.type === 'quote' ? 'verified' : 'unverified',
      sourceNoteId: note.id,
    },
  };
}

export function applyPlaygroundDagreLayout(
  nodes: CaseNode[],
  edges: CaseEdge[]
): CaseNode[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 70, ranksep: 90 });

  const width = 240;
  const height = 120;

  for (const node of nodes) {
    g.setNode(node.id, { width, height });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    if (!pos) return node;
    return {
      ...node,
      position: {
        x: Math.round(pos.x - width / 2),
        y: Math.round(pos.y - height / 2),
      },
    };
  });
}
