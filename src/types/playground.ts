export type CaseNodeType = 'suspect' | 'clue' | 'sticky' | 'alibi' | 'location';

export type SuspectStatus = 'prime' | 'alibi' | 'cleared' | 'victim';

export type ClueReliability = 'verified' | 'unverified' | 'red-herring';

export type StickyColor = 'yellow' | 'pink' | 'blue' | 'purple';

export type CaseEdgeKind = 'suspect' | 'contradicts' | 'alibi' | 'related';

export type CaseBoardTheme = 'corkboard' | 'noir';

export type HypothesisStatus = 'investigating' | 'disproved' | 'confirmed';

export interface CaseNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  chapter?: number;
  page?: number;
  // Suspect fields
  role?: string;
  suspectStatus?: SuspectStatus;
  suspicionLevel?: number;
  motive?: string;
  // Clue fields
  reliability?: ClueReliability;
  sourceNoteId?: string;
  // Sticky fields
  stickyColor?: StickyColor;
  // Alibi fields
  timeLabel?: string;
  witness?: string;
  alibiVerified?: boolean;
}

export interface CaseNode {
  id: string;
  type: CaseNodeType;
  position: { x: number; y: number };
  data: CaseNodeData;
}

export interface CaseEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  kind: CaseEdgeKind;
}

export interface CaseHypothesis {
  id: string;
  title: string;
  suspectNodeId?: string;
  status: HypothesisStatus;
  supportingNodeIds: string[];
  contradictingNodeIds: string[];
  notes?: string;
}

export interface CaseBoard {
  id: string;
  bookId?: string;
  title: string;
  theme: CaseBoardTheme;
  nodes: CaseNode[];
  edges: CaseEdge[];
  hypotheses: CaseHypothesis[];
  createdAt: string;
  updatedAt: string;
}
