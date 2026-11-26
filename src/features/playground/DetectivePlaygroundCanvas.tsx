'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { nanoid } from 'nanoid';
import {
  CheckCircle2,
  Clock,
  Crosshair,
  Download,
  GitBranch,
  MapPin,
  Moon,
  PanelLeft,
  Plus,
  Redo2,
  Search,
  SlidersHorizontal,
  StickyNote,
  Sun,
  Trash2,
  Undo2,
  UserSearch,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useBookStore } from '@/stores/useBookStore';
import { useCaseBoardStore } from '@/stores/useCaseBoardStore';
import { useNoteStore } from '@/stores/useNoteStore';
import type {
  CaseBoard,
  CaseBoardTheme,
  CaseEdge,
  CaseEdgeKind,
  CaseHypothesis,
  CaseNode,
  CaseNodeData,
  CaseNodeType,
  ClueReliability,
  Note,
  StickyColor,
  SuspectStatus,
} from '@/types';
import { BookNotesDrawer } from './BookNotesDrawer';
import { toReactFlowEdge } from './CaseEdgeStyle';
import { playgroundNodeTypes } from './CaseNodes';
import { HypothesisPanel } from './HypothesisPanel';
import {
  applyPlaygroundDagreLayout,
  computeSpotlightIds,
  createNodeFromBookNote,
  filterBoardByChapter,
  getMaxChapter,
} from './playgroundLogic';

const NODE_TYPES: CaseNodeType[] = ['suspect', 'clue', 'sticky', 'alibi', 'location'];
const EDGE_KINDS: CaseEdgeKind[] = ['suspect', 'contradicts', 'alibi', 'related'];
const SUSPECT_STATUSES: SuspectStatus[] = ['prime', 'alibi', 'cleared', 'victim'];
const RELIABILITIES: ClueReliability[] = ['verified', 'unverified', 'red-herring'];
const STICKY_COLORS: StickyColor[] = ['yellow', 'pink', 'blue', 'purple'];

interface BoardSnapshot {
  nodes: CaseNode[];
  edges: CaseEdge[];
  hypotheses: CaseHypothesis[];
}

interface DetectivePlaygroundCanvasProps {
  board: CaseBoard;
  allBoards: CaseBoard[];
  onSelectBoard: (boardId: string) => void;
}

export function DetectivePlaygroundCanvas({
  board,
  allBoards,
  onSelectBoard,
}: DetectivePlaygroundCanvasProps) {
  const t = useTranslations('playground');
  const tCommon = useTranslations('common');

  const books = useBookStore((s) => s.books);
  const notes = useNoteStore((s) => s.notes);
  const { createCaseBoard, updateCaseBoard, deleteCaseBoard } = useCaseBoardStore();

  const canvasRef = React.useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = React.useState<CaseNode[]>(board.nodes);
  const [edges, setEdges] = React.useState<CaseEdge[]>(board.edges);
  const [hypotheses, setHypotheses] = React.useState<CaseHypothesis[]>(board.hypotheses);
  const [boardTheme, setBoardTheme] = React.useState<CaseBoardTheme>(board.theme);

  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = React.useState<string | null>(null);
  const [rightTab, setRightTab] = React.useState<'inspector' | 'hypotheses'>('inspector');
  const [drawerOpen, setDrawerOpen] = React.useState(Boolean(board.bookId));
  const [spotlightOn, setSpotlightOn] = React.useState(false);
  const [chapterFilter, setChapterFilter] = React.useState<number | null>(null);
  const [savedTick, setSavedTick] = React.useState(false);

  const [history, setHistory] = React.useState<BoardSnapshot[]>([]);
  const [future, setFuture] = React.useState<BoardSnapshot[]>([]);

  // New board modal
  const [newOpen, setNewOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newBookId, setNewBookId] = React.useState('');
  const [newTheme, setNewTheme] = React.useState<CaseBoardTheme>('corkboard');

  // Sync local state when switching board
  const prevBoardIdRef = React.useRef(board.id);
  React.useEffect(() => {
    if (prevBoardIdRef.current !== board.id) {
      prevBoardIdRef.current = board.id;
      setNodes(board.nodes);
      setEdges(board.edges);
      setHypotheses(board.hypotheses);
      setBoardTheme(board.theme);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setChapterFilter(null);
      setHistory([]);
      setFuture([]);
    }
  }, [board]);

  const pushHistory = React.useCallback(
    (n: CaseNode[], e: CaseEdge[], h: CaseHypothesis[]) => {
      setHistory((prev) => [...prev.slice(-24), { nodes: n, edges: e, hypotheses: h }]);
      setFuture([]);
    },
    []
  );

  // Autosave
  const skipInitialSave = React.useRef(true);
  React.useEffect(() => {
    skipInitialSave.current = true;
  }, [board.id]);

  React.useEffect(() => {
    if (skipInitialSave.current) {
      skipInitialSave.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      await updateCaseBoard(board.id, {
        nodes,
        edges,
        hypotheses,
        theme: boardTheme,
      });
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 1500);
    }, 450);
    return () => clearTimeout(timer);
  }, [nodes, edges, hypotheses, boardTheme, board.id, updateCaseBoard]);

  const maxChapter = React.useMemo(() => getMaxChapter(nodes), [nodes]);

  const { visibleNodes, visibleEdges } = React.useMemo(
    () => filterBoardByChapter(nodes, edges, chapterFilter),
    [nodes, edges, chapterFilter]
  );

  const spotlight = React.useMemo(
    () =>
      spotlightOn
        ? computeSpotlightIds(selectedNodeId, visibleEdges)
        : { highlightedNodeIds: new Set<string>(), highlightedEdgeIds: new Set<string>() },
    [spotlightOn, selectedNodeId, visibleEdges]
  );

  const handleInlineStickyChange = React.useCallback((nodeId: string, label: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
      )
    );
  }, []);

  const flowNodes = React.useMemo<Node[]>(() => {
    const hasSpotlight = spotlightOn && selectedNodeId !== null;
    return visibleNodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        __dimmed: hasSpotlight && !spotlight.highlightedNodeIds.has(n.id),
        __onInlineChange: n.type === 'sticky' ? handleInlineStickyChange : undefined,
      },
    }));
  }, [visibleNodes, spotlightOn, selectedNodeId, spotlight.highlightedNodeIds, handleInlineStickyChange]);

  const flowEdges = React.useMemo<Edge[]>(() => {
    const hasSpotlight = spotlightOn && selectedNodeId !== null;
    return visibleEdges.map((e) =>
      toReactFlowEdge(e, hasSpotlight && !spotlight.highlightedEdgeIds.has(e.id))
    );
  }, [visibleEdges, spotlightOn, selectedNodeId, spotlight.highlightedEdgeIds]);

  const onNodesChange: OnNodesChange<Node> = (changes) => {
    setNodes((nds) => changes.applyTo(nds as Node[]) as CaseNode[]);
  };

  const onEdgesChange: OnEdgesChange<Edge> = (changes) => {
    setEdges((eds) => changes.applyTo(eds as Edge[]) as CaseEdge[]);
  };

  const onConnect = (connection: Connection) => {
    if (!connection.source || !connection.target) return;
    pushHistory(nodes, edges, hypotheses);
    const created: CaseEdge = {
      id: `ce-${nanoid(6)}`,
      source: connection.source,
      target: connection.target,
      label: '',
      kind: 'suspect',
    };
    const next = addEdge(created as Edge, edges as Edge[]) as CaseEdge[];
    setEdges(next);
    setSelectedEdgeId(created.id);
    setSelectedNodeId(null);
    setRightTab('inspector');
  };

  const handleAddNode = (nodeType: CaseNodeType) => {
    pushHistory(nodes, edges, hypotheses);
    const offset = nodes.length * 26;
    const baseData: CaseNodeData = {
      label: t(`nodeTypes.${nodeType}`),
      description: '',
    };
    if (nodeType === 'suspect') {
      baseData.suspectStatus = 'prime';
      baseData.suspicionLevel = 50;
    } else if (nodeType === 'clue') {
      baseData.reliability = 'unverified';
    } else if (nodeType === 'sticky') {
      baseData.stickyColor = 'yellow';
    } else if (nodeType === 'alibi') {
      baseData.alibiVerified = false;
    }

    const newNode: CaseNode = {
      id: `cn-${nanoid(6)}`,
      type: nodeType,
      position: { x: 160 + (offset % 280), y: 120 + (offset % 220) },
      data: baseData,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setSelectedEdgeId(null);
    setRightTab('inspector');
  };

  const handleDropNote = (note: Note) => {
    pushHistory(nodes, edges, hypotheses);
    const newNode = createNodeFromBookNote(note, nodes.length);
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setSelectedEdgeId(null);
    setRightTab('inspector');
  };

  const handleAutoLayout = () => {
    pushHistory(nodes, edges, hypotheses);
    setNodes((prev) => applyPlaygroundDagreLayout(prev, edges));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture((f) => [{ nodes, edges, hypotheses }, ...f]);
    setHistory((h) => h.slice(0, -1));
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setHypotheses(prev.hypotheses);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((h) => [...h, { nodes, edges, hypotheses }]);
    setFuture((f) => f.slice(1));
    setNodes(next.nodes);
    setEdges(next.edges);
    setHypotheses(next.hypotheses);
  };

  const handleExportPng = async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await toPng(canvasRef.current, {
        backgroundColor: boardTheme === 'noir' ? '#141210' : '#d8be98',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${board.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(t('exportSuccess'));
    } catch {
      toast.error(t('exportError'));
    }
  };

  const handleCreateNewBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createCaseBoard({
      title: newTitle.trim() || t('defaultBoardTitle'),
      bookId: newBookId || undefined,
      theme: newTheme,
      nodes: [
        {
          id: `cn-${nanoid(6)}`,
          type: 'suspect',
          position: { x: 240, y: 80 },
          data: {
            label: t('nodeTypes.suspect'),
            suspectStatus: 'victim',
            suspicionLevel: 0,
          },
        },
      ],
      edges: [],
      hypotheses: [],
    });
    setNewOpen(false);
    setNewTitle('');
    onSelectBoard(created.id);
    toast.success(tCommon('saved'));
  };

  const handleDeleteBoard = async () => {
    if (allBoards.length <= 1) return;
    if (!window.confirm(tCommon('confirmDelete'))) return;
    const remaining = allBoards.filter((b) => b.id !== board.id);
    await deleteCaseBoard(board.id);
    if (remaining[0]) onSelectBoard(remaining[0].id);
    toast.success(tCommon('deleted'));
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  const updateSelectedNodeData = (patch: Partial<CaseNodeData>) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === selectedNodeId ? { ...n, data: { ...n.data, ...patch } } : n
      )
    );
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    pushHistory(nodes, edges, hypotheses);
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setEdges((prev) =>
      prev.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
    );
    setSelectedNodeId(null);
  };

  const updateSelectedEdge = (patch: Partial<CaseEdge>) => {
    if (!selectedEdgeId) return;
    setEdges((prev) =>
      prev.map((e) => (e.id === selectedEdgeId ? { ...e, ...patch } : e))
    );
  };

  const deleteSelectedEdge = () => {
    if (!selectedEdgeId) return;
    pushHistory(nodes, edges, hypotheses);
    setEdges((prev) => prev.filter((e) => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
  };

  const linkedBook = books.find((b) => b.id === board.bookId);
  const linkedBookNotes = React.useMemo(
    () =>
      board.bookId
        ? notes.filter((n) => n.bookId === board.bookId)
        : notes.slice(0, 12),
    [notes, board.bookId]
  );

  const nodeButtonIcons: Record<CaseNodeType, typeof UserSearch> = {
    suspect: UserSearch,
    clue: Search,
    sticky: StickyNote,
    alibi: Clock,
    location: MapPin,
  };

  return (
    <div className="flex h-[calc(100vh-5.5rem)] flex-col overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={drawerOpen ? 'primary' : 'outline'}
            onClick={() => setDrawerOpen((v) => !v)}
            title={t('bookNotesDrawer')}
          >
            <PanelLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('bookNotesDrawer')}</span>
          </Button>

          <Select
            aria-label={t('selectCase')}
            value={board.id}
            onChange={(e) => onSelectBoard(e.target.value)}
            className="w-52 py-1 text-xs font-semibold"
          >
            {allBoards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </Select>

          <Button size="sm" variant="outline" onClick={() => setNewOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            <span>{t('newBoard')}</span>
          </Button>

          {allBoards.length > 1 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDeleteBoard}
              title={tCommon('delete')}
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            </Button>
          )}

          {savedTick && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              {t('autosaved')}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {maxChapter > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
              <span className="whitespace-nowrap">
                {chapterFilter === null
                  ? t('allChapters')
                  : t('upToChapter', { chapter: chapterFilter })}
              </span>
              <input
                type="range"
                min={1}
                max={maxChapter}
                value={chapterFilter ?? maxChapter}
                onChange={(e) => setChapterFilter(Number(e.target.value))}
                className="w-20 accent-[var(--accent-primary)] cursor-pointer"
              />
              {chapterFilter !== null && (
                <button
                  type="button"
                  onClick={() => setChapterFilter(null)}
                  className="text-[10px] font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
                >
                  {tCommon('reset')}
                </button>
              )}
            </div>
          )}

          <Button
            size="sm"
            variant={spotlightOn ? 'primary' : 'outline'}
            onClick={() => setSpotlightOn((v) => !v)}
            title={t('spotlightHint')}
          >
            <Crosshair className="h-3.5 w-3.5" />
            <span>{t('spotlight')}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setBoardTheme((prev) => (prev === 'corkboard' ? 'noir' : 'corkboard'))
            }
            title={t('boardTheme')}
          >
            {boardTheme === 'noir' ? (
              <Moon className="h-3.5 w-3.5" />
            ) : (
              <Sun className="h-3.5 w-3.5" />
            )}
            <span>{t(`themes.${boardTheme}`)}</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleUndo}
            disabled={history.length === 0}
            title={t('undo')}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRedo}
            disabled={future.length === 0}
            title={t('redo')}
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleAutoLayout}>
            <GitBranch className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" onClick={handleExportPng}>
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('exportPng')}</span>
          </Button>
        </div>
      </div>

      {/* Add Card Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {NODE_TYPES.map((nt) => {
            const Icon = nodeButtonIcons[nt];
            return (
              <Button
                key={nt}
                size="sm"
                variant="outline"
                onClick={() => handleAddNode(nt)}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>+ {t(`nodeTypes.${nt}`)}</span>
              </Button>
            );
          })}
        </div>
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-4 rounded-full bg-red-600" />
            {t('edgeKinds.suspect')}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-4 rounded-full bg-yellow-500" />
            {t('edgeKinds.contradicts')}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-4 rounded-full bg-green-600" />
            {t('edgeKinds.alibi')}
          </span>
        </div>
      </div>

      {/* Main Split Area */}
      <div className="flex flex-1 overflow-hidden">
        {drawerOpen && (
          <aside className="hidden md:block w-64 shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-card)]">
            <BookNotesDrawer
              bookTitle={linkedBook?.title}
              notes={linkedBookNotes}
              boardNodes={nodes}
              onDropNote={handleDropNote}
            />
          </aside>
        )}

        {/* Crime Wall Canvas */}
        <div
          ref={canvasRef}
          className={cn(
            'relative flex-1 h-full',
            boardTheme === 'noir' ? 'playground-noir' : 'playground-corkboard'
          )}
        >
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={playgroundNodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => {
              setSelectedNodeId(node.id);
              setSelectedEdgeId(null);
              setRightTab('inspector');
            }}
            onEdgeClick={(_, edge) => {
              setSelectedEdgeId(edge.id);
              setSelectedNodeId(null);
              setRightTab('inspector');
            }}
            onPaneClick={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            fitView
          >
            <Background gap={22} size={1} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Right Inspector & Hypotheses */}
        <aside className="hidden lg:flex w-80 shrink-0 flex-col border-l border-[var(--border-color)] bg-[var(--bg-card)]">
          <div className="grid grid-cols-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <button
              type="button"
              onClick={() => setRightTab('inspector')}
              className={cn(
                'py-2.5 text-xs font-semibold cursor-pointer',
                rightTab === 'inspector'
                  ? 'border-b-2 border-[var(--accent-primary)] bg-[var(--bg-card)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)]'
              )}
            >
              {t('inspectorTab')}
            </button>
            <button
              type="button"
              onClick={() => setRightTab('hypotheses')}
              className={cn(
                'py-2.5 text-xs font-semibold cursor-pointer',
                rightTab === 'hypotheses'
                  ? 'border-b-2 border-[var(--accent-primary)] bg-[var(--bg-card)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)]'
              )}
            >
              {t('hypothesesTab')} ({hypotheses.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {rightTab === 'hypotheses' ? (
              <HypothesisPanel
                hypotheses={hypotheses}
                nodes={nodes}
                onChange={(next) => {
                  pushHistory(nodes, edges, hypotheses);
                  setHypotheses(next);
                }}
              />
            ) : selectedNode ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[var(--text-muted)]">
                    {t(`nodeTypes.${selectedNode.type}`)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={deleteSelectedNode}
                    aria-label={tCommon('delete')}
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium">{t('fieldLabel')}</label>
                  <Input
                    value={selectedNode.data.label}
                    onChange={(e) => updateSelectedNodeData({ label: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium">{t('fieldChapter')}</label>
                    <Input
                      type="number"
                      min={1}
                      value={selectedNode.data.chapter ?? ''}
                      onChange={(e) =>
                        updateSelectedNodeData({
                          chapter: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">{t('fieldPage')}</label>
                    <Input
                      type="number"
                      min={1}
                      value={selectedNode.data.page ?? ''}
                      onChange={(e) =>
                        updateSelectedNodeData({
                          page: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>

                {selectedNode.type === 'suspect' && (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium">{t('fieldRole')}</label>
                      <Input
                        value={selectedNode.data.role ?? ''}
                        onChange={(e) => updateSelectedNodeData({ role: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        {t('fieldSuspectStatus')}
                      </label>
                      <Select
                        value={selectedNode.data.suspectStatus ?? 'prime'}
                        onChange={(e) =>
                          updateSelectedNodeData({
                            suspectStatus: e.target.value as SuspectStatus,
                          })
                        }
                      >
                        {SUSPECT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {t(`suspectStatuses.${s}`)}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-xs font-medium">
                        <span>{t('suspicionLevel')}</span>
                        <span>{selectedNode.data.suspicionLevel ?? 0}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={selectedNode.data.suspicionLevel ?? 0}
                        onChange={(e) =>
                          updateSelectedNodeData({
                            suspicionLevel: Number(e.target.value),
                          })
                        }
                        className="w-full accent-rose-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">{t('fieldMotive')}</label>
                      <Input
                        value={selectedNode.data.motive ?? ''}
                        onChange={(e) => updateSelectedNodeData({ motive: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {selectedNode.type === 'clue' && (
                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      {t('fieldReliability')}
                    </label>
                    <Select
                      value={selectedNode.data.reliability ?? 'unverified'}
                      onChange={(e) =>
                        updateSelectedNodeData({
                          reliability: e.target.value as ClueReliability,
                        })
                      }
                    >
                      {RELIABILITIES.map((r) => (
                        <option key={r} value={r}>
                          {t(`reliabilities.${r}`)}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {selectedNode.type === 'sticky' && (
                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      {t('fieldStickyColor')}
                    </label>
                    <div className="flex gap-2">
                      {STICKY_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateSelectedNodeData({ stickyColor: c })}
                          className={cn(
                            'h-7 w-7 rounded-full border-2 cursor-pointer',
                            c === 'yellow' && 'bg-amber-300 border-amber-500',
                            c === 'pink' && 'bg-rose-300 border-rose-500',
                            c === 'blue' && 'bg-sky-300 border-sky-500',
                            c === 'purple' && 'bg-purple-300 border-purple-500',
                            selectedNode.data.stickyColor === c && 'ring-2 ring-[var(--accent-primary)]'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.type === 'alibi' && (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium">{t('fieldTime')}</label>
                      <Input
                        value={selectedNode.data.timeLabel ?? ''}
                        onChange={(e) =>
                          updateSelectedNodeData({ timeLabel: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">{t('fieldWitness')}</label>
                      <Input
                        value={selectedNode.data.witness ?? ''}
                        onChange={(e) =>
                          updateSelectedNodeData({ witness: e.target.value })
                        }
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(selectedNode.data.alibiVerified)}
                        onChange={(e) =>
                          updateSelectedNodeData({ alibiVerified: e.target.checked })
                        }
                      />
                      <span>{t('alibiConfirmed')}</span>
                    </label>
                  </>
                )}

                <div>
                  <label className="mb-1 block text-xs font-medium">
                    {t('fieldDescription')}
                  </label>
                  <Textarea
                    rows={3}
                    value={selectedNode.data.description ?? ''}
                    onChange={(e) =>
                      updateSelectedNodeData({ description: e.target.value })
                    }
                  />
                </div>
              </div>
            ) : selectedEdge ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[var(--text-muted)]">
                    {t('edgeSettings')}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={deleteSelectedEdge}
                    aria-label={tCommon('delete')}
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium">{t('edgeKind')}</label>
                  <Select
                    value={selectedEdge.kind}
                    onChange={(e) =>
                      updateSelectedEdge({ kind: e.target.value as CaseEdgeKind })
                    }
                  >
                    {EDGE_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {t(`edgeKinds.${k}`)}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium">{t('edgeLabel')}</label>
                  <Input
                    value={selectedEdge.label ?? ''}
                    onChange={(e) => updateSelectedEdge({ label: e.target.value })}
                    placeholder={t('edgeLabelPlaceholder')}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs leading-relaxed text-[var(--text-muted)]">
                <p>{t('selectHint')}</p>
                <p className="text-[11px]">{t('stickyDoubleClickHint')}</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Create New Board Dialog */}
      <Dialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title={t('newBoard')}
      >
        <form onSubmit={handleCreateNewBoard} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('boardTitle')}</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t('defaultBoardTitle')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('linkedBook')}</label>
            <Select
              value={newBookId}
              onChange={(e) => setNewBookId(e.target.value)}
            >
              <option value="">{t('standaloneBoard')}</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('boardTheme')}</label>
            <Select
              value={newTheme}
              onChange={(e) => setNewTheme(e.target.value as CaseBoardTheme)}
            >
              <option value="corkboard">{t('themes.corkboard')}</option>
              <option value="noir">{t('themes.noir')}</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNewOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit">{tCommon('create')}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
