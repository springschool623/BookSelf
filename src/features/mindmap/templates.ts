import dagre from '@dagrejs/dagre';
import type { Genre, MindEdge, MindMapKind, MindNode } from '@/types';

export function getRecommendedMapKinds(genres: Genre[]): MindMapKind[] {
  const recommended = new Set<MindMapKind>();
  if (genres.includes('history')) {
    recommended.add('timeline');
    recommended.add('family-tree');
  }
  if (genres.includes('detective')) {
    recommended.add('case-board');
    recommended.add('characters');
  }
  if (recommended.size === 0) {
    recommended.add('characters');
    recommended.add('free');
  }
  return Array.from(recommended);
}

export function createTemplateGraph(
  kind: MindMapKind,
  bookTitle: string
): { nodes: MindNode[]; edges: MindEdge[] } {
  switch (kind) {
    case 'timeline':
      return {
        nodes: [
          {
            id: 't-1',
            type: 'event',
            position: { x: 60, y: 140 },
            data: { label: bookTitle, date: 'Mốc 1', description: 'Khởi đầu bối cảnh' },
          },
          {
            id: 't-2',
            type: 'event',
            position: { x: 320, y: 140 },
            data: { label: 'Bước ngoặt', date: 'Mốc 2', description: 'Sự kiện trọng tâm' },
          },
          {
            id: 't-3',
            type: 'event',
            position: { x: 580, y: 140 },
            data: { label: 'Hệ quả', date: 'Mốc 3', description: 'Kết cục lịch sử' },
          },
        ],
        edges: [
          { id: 'et-1', source: 't-1', target: 't-2', label: 'dẫn tới' },
          { id: 'et-2', source: 't-2', target: 't-3', label: 'kết quả' },
        ],
      };

    case 'family-tree':
      return {
        nodes: [
          {
            id: 'f-1',
            type: 'character',
            position: { x: 260, y: 40 },
            data: { label: 'Thế hệ 1 (Tổ tiên)', role: 'Khởi tổ', date: 'Thế kỷ ...' },
          },
          {
            id: 'f-2',
            type: 'character',
            position: { x: 100, y: 200 },
            data: { label: 'Nhánh trưởng', role: 'Con trưởng' },
          },
          {
            id: 'f-3',
            type: 'character',
            position: { x: 420, y: 200 },
            data: { label: 'Nhánh thứ', role: 'Con thứ' },
          },
        ],
        edges: [
          { id: 'ef-1', source: 'f-1', target: 'f-2', label: 'cha của' },
          { id: 'ef-2', source: 'f-1', target: 'f-3', label: 'cha của' },
        ],
      };

    case 'case-board':
      return {
        nodes: [
          {
            id: 'c-1',
            type: 'character',
            position: { x: 260, y: 40 },
            data: { label: 'Nạn nhân / Vụ án', role: 'Trung tâm' },
          },
          {
            id: 'c-2',
            type: 'clue',
            position: { x: 60, y: 200 },
            data: { label: 'Manh mối #1', description: 'Hiện trường / vật chứng' },
          },
          {
            id: 'c-3',
            type: 'character',
            position: { x: 460, y: 200 },
            data: { label: 'Nghi phạm A', role: 'Liên quan', isSuspect: true },
          },
          {
            id: 'c-4',
            type: 'place',
            position: { x: 260, y: 340 },
            data: { label: 'Hiện trường chính' },
          },
        ],
        edges: [
          { id: 'ec-1', source: 'c-2', target: 'c-1', label: 'manh mối' },
          { id: 'ec-2', source: 'c-3', target: 'c-1', label: 'nghi phạm' },
          { id: 'ec-3', source: 'c-4', target: 'c-1', label: 'địa điểm' },
        ],
      };

    case 'characters':
      return {
        nodes: [
          {
            id: 'ch-1',
            type: 'character',
            position: { x: 260, y: 40 },
            data: { label: 'Nhân vật chính', role: 'Trung tâm' },
          },
          {
            id: 'ch-2',
            type: 'character',
            position: { x: 100, y: 200 },
            data: { label: 'Đồng minh', role: 'Hỗ trợ' },
          },
          {
            id: 'ch-3',
            type: 'character',
            position: { x: 420, y: 200 },
            data: { label: 'Đối thủ', role: 'Phản diện' },
          },
        ],
        edges: [
          { id: 'ech-1', source: 'ch-1', target: 'ch-2', label: 'hợp tác' },
          { id: 'ech-2', source: 'ch-1', target: 'ch-3', label: 'đối đầu' },
        ],
      };

    case 'free':
    default:
      return {
        nodes: [
          {
            id: 'fr-1',
            type: 'note',
            position: { x: 260, y: 120 },
            data: { label: bookTitle, description: 'Ý tưởng trung tâm' },
          },
        ],
        edges: [],
      };
  }
}

export function applyDagreLayout(
  nodes: MindNode[],
  edges: MindEdge[],
  direction: 'TB' | 'LR' = 'TB'
): MindNode[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

  const nodeWidth = 220;
  const nodeHeight = 96;

  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    if (!pos) return node;
    return {
      ...node,
      position: {
        x: Math.round(pos.x - nodeWidth / 2),
        y: Math.round(pos.y - nodeHeight / 2),
      },
    };
  });
}
