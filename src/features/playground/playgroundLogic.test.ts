import { describe, expect, it } from 'vitest';
import type { CaseEdge, CaseNode, Note } from '@/types';
import {
  computeSpotlightIds,
  createNodeFromBookNote,
  filterBoardByChapter,
  getMaxChapter,
} from './playgroundLogic';

const sampleNodes: CaseNode[] = [
  {
    id: 'n1',
    type: 'suspect',
    position: { x: 0, y: 0 },
    data: { label: 'Suspect A', chapter: 2 },
  },
  {
    id: 'n2',
    type: 'clue',
    position: { x: 100, y: 0 },
    data: { label: 'Clue Ch.5', chapter: 5 },
  },
  {
    id: 'n3',
    type: 'sticky',
    position: { x: 200, y: 0 },
    data: { label: 'General Note' },
  },
];

const sampleEdges: CaseEdge[] = [
  { id: 'e1', source: 'n1', target: 'n2', kind: 'suspect' },
  { id: 'e2', source: 'n1', target: 'n3', kind: 'related' },
];

describe('playgroundLogic', () => {
  it('calculates max chapter and filters nodes/edges by chapter progression', () => {
    expect(getMaxChapter(sampleNodes)).toBe(5);

    const ch3 = filterBoardByChapter(sampleNodes, sampleEdges, 3);
    expect(ch3.visibleNodes.map((n) => n.id)).toEqual(['n1', 'n3']);
    expect(ch3.visibleEdges.map((e) => e.id)).toEqual(['e2']);

    const all = filterBoardByChapter(sampleNodes, sampleEdges, null);
    expect(all.visibleNodes).toHaveLength(3);
    expect(all.visibleEdges).toHaveLength(2);
  });

  it('computes spotlight highlights for selected node and direct neighbors', () => {
    const spot = computeSpotlightIds('n2', sampleEdges);
    expect(Array.from(spot.highlightedNodeIds).sort()).toEqual(['n1', 'n2']);
    expect(Array.from(spot.highlightedEdgeIds)).toEqual(['e1']);
  });

  it('creates a clue card from a book note with parsed chapter and sourceNoteId', () => {
    const note: Note = {
      id: 'note-99',
      bookId: 'book-1',
      type: 'quote',
      content: 'The clock stopped at 1:15 AM.',
      page: 72,
      chapter: 'Chapter 4',
      tags: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const node = createNodeFromBookNote(note, 2);
    expect(node.type).toBe('clue');
    expect(node.data.chapter).toBe(4);
    expect(node.data.page).toBe(72);
    expect(node.data.sourceNoteId).toBe('note-99');
    expect(node.data.reliability).toBe('verified');
  });
});
