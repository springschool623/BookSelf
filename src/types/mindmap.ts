export type MindMapKind =
  | 'characters'
  | 'timeline'
  | 'family-tree'
  | 'case-board'
  | 'free';

export type MindNodeType = 'character' | 'event' | 'clue' | 'place' | 'note';

export interface MindNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  color?: string;
  date?: string;
  role?: string;
  isSuspect?: boolean;
}

export interface MindNode {
  id: string;
  type: MindNodeType;
  position: { x: number; y: number };
  data: MindNodeData;
}

export interface MindEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface MindMap {
  id: string;
  bookId: string;
  title: string;
  kind: MindMapKind;
  nodes: MindNode[];
  edges: MindEdge[];
  createdAt: string;
  updatedAt: string;
}
