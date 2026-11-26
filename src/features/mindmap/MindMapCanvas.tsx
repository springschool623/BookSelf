'use client';

import * as React from 'react';
import Link from 'next/link';
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
  ArrowLeft,
  CheckCircle2,
  Download,
  GitBranch,
  Plus,
  Redo2,
  Trash2,
  Undo2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useMindMapStore } from '@/stores/useMindMapStore';
import type { MindEdge, MindMap, MindNode, MindNodeData, MindNodeType } from '@/types';
import { mindMapNodeTypes } from './CustomNodes';
import { applyDagreLayout } from './templates';

const NODE_TYPES: MindNodeType[] = ['character', 'event', 'clue', 'place', 'note'];

interface Snapshot {
  nodes: MindNode[];
  edges: MindEdge[];
}

export function MindMapCanvas({ map }: { map: MindMap }) {
  const t = useTranslations('mindmap');
  const updateMindMap = useMindMapStore((s) => s.updateMindMap);

  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = React.useState<MindNode[]>(map.nodes);
  const [edges, setEdges] = React.useState<MindEdge[]>(map.edges);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<Snapshot[]>([]);
  const [future, setFuture] = React.useState<Snapshot[]>([]);
  const [savedTick, setSavedTick] = React.useState(false);

  const pushHistory = React.useCallback(
    (currNodes: MindNode[], currEdges: MindEdge[]) => {
      setHistory((prev) => [...prev.slice(-24), { nodes: currNodes, edges: currEdges }]);
      setFuture([]);
    },
    []
  );

  // Autosave debounced
  const firstRender = React.useRef(true);
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      await updateMindMap(map.id, { nodes, edges });
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 1500);
    }, 500);
    return () => clearTimeout(timer);
  }, [nodes, edges, map.id, updateMindMap]);

  const onNodesChange: OnNodesChange<Node> = (changes) => {
    setNodes((nds) => changes.applyTo(nds as Node[]) as MindNode[]);
  };

  const onEdgesChange: OnEdgesChange<Edge> = (changes) => {
    setEdges((eds) => changes.applyTo(eds as Edge[]) as MindEdge[]);
  };

  const onConnect = (connection: Connection) => {
    if (!connection.source || !connection.target) return;
    pushHistory(nodes, edges);
    const next = addEdge(
      { ...connection, id: `e-${nanoid(6)}`, label: '' },
      edges as Edge[]
    ) as MindEdge[];
    setEdges(next);
  };

  const handleAddNode = (nodeType: MindNodeType) => {
    pushHistory(nodes, edges);
    const offset = nodes.length * 24;
    const newNode: MindNode = {
      id: `n-${nanoid(6)}`,
      type: nodeType,
      position: { x: 180 + (offset % 240), y: 120 + (offset % 180) },
      data: {
        label: t(`nodeTypes.${nodeType}`),
        description: '',
      },
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setSelectedEdgeId(null);
  };

  const handleAutoLayout = () => {
    pushHistory(nodes, edges);
    const direction = map.kind === 'timeline' ? 'LR' : 'TB';
    setNodes((prev) => applyDagreLayout(prev, edges, direction));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture((f) => [{ nodes, edges }, ...f]);
    setHistory((h) => h.slice(0, -1));
    setNodes(prev.nodes);
    setEdges(prev.edges);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((h) => [...h, { nodes, edges }]);
    setFuture((f) => f.slice(1));
    setNodes(next.nodes);
    setEdges(next.edges);
  };

  const handleExportPng = async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await toPng(canvasRef.current, {
        backgroundColor: '#faf6ef',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${map.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(t('exportSuccess'));
    } catch {
      toast.error(t('exportError'));
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  const updateSelectedNodeData = (patch: Partial<MindNodeData>) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === selectedNodeId ? { ...n, data: { ...n.data, ...patch } } : n
      )
    );
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    pushHistory(nodes, edges);
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setEdges((prev) =>
      prev.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
    );
    setSelectedNodeId(null);
  };

  const updateSelectedEdgeLabel = (label: string) => {
    if (!selectedEdgeId) return;
    setEdges((prev) =>
      prev.map((e) => (e.id === selectedEdgeId ? { ...e, label } : e))
    );
  };

  const deleteSelectedEdge = () => {
    if (!selectedEdgeId) return;
    pushHistory(nodes, edges);
    setEdges((prev) => prev.filter((e) => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
  };

  return (
    <div className="flex h-screen flex-col bg-[var(--bg-primary)]">
      {/* Top Toolbar */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Link
            href={`/books/${map.bookId}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] px-2.5 py-1.5 text-xs font-medium hover:bg-[var(--bg-secondary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <div>
            <h1 className="font-serif-display text-sm font-bold sm:text-base">
              {map.title}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
              <span>{t(`kinds.${map.kind}`)}</span>
              {savedTick && (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {t('autosaved')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {NODE_TYPES.map((nt) => (
            <Button
              key={nt}
              size="sm"
              variant="outline"
              onClick={() => handleAddNode(nt)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t(`nodeTypes.${nt}`)}</span>
            </Button>
          ))}
          <Button size="sm" variant="secondary" onClick={handleAutoLayout}>
            <GitBranch className="h-3.5 w-3.5" />
            <span>{t('autoLayout')}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleUndo}
            disabled={history.length === 0}
            title={t('undo')}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRedo}
            disabled={future.length === 0}
            title={t('redo')}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleExportPng}>
            <Download className="h-3.5 w-3.5" />
            <span>{t('exportPng')}</span>
          </Button>
        </div>
      </header>

      {/* Canvas + Inspector */}
      <div className="flex flex-1 overflow-hidden">
        <div ref={canvasRef} className="flex-1 h-full">
          <ReactFlow
            nodes={nodes as Node[]}
            edges={edges as Edge[]}
            nodeTypes={mindMapNodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => {
              setSelectedNodeId(node.id);
              setSelectedEdgeId(null);
            }}
            onEdgeClick={(_, edge) => {
              setSelectedEdgeId(edge.id);
              setSelectedNodeId(null);
            }}
            onPaneClick={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Right Inspector Panel */}
        <aside className="w-72 shrink-0 overflow-y-auto border-l border-[var(--border-color)] bg-[var(--bg-card)] p-4 hidden md:block">
          {selectedNode ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{t('inspector')}</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={deleteSelectedNode}
                  aria-label={t('deleteNode')}
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">{t('nodeLabel')}</label>
                <Input
                  value={selectedNode.data.label}
                  onChange={(e) => updateSelectedNodeData({ label: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">{t('nodeRole')}</label>
                <Input
                  value={selectedNode.data.role ?? ''}
                  onChange={(e) => updateSelectedNodeData({ role: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">{t('nodeDate')}</label>
                <Input
                  value={selectedNode.data.date ?? ''}
                  onChange={(e) => updateSelectedNodeData({ date: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  {t('nodeDescription')}
                </label>
                <Textarea
                  rows={3}
                  value={selectedNode.data.description ?? ''}
                  onChange={(e) =>
                    updateSelectedNodeData({ description: e.target.value })
                  }
                />
              </div>
              {selectedNode.type === 'character' && (
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedNode.data.isSuspect)}
                    onChange={(e) =>
                      updateSelectedNodeData({ isSuspect: e.target.checked })
                    }
                  />
                  <span>{t('isSuspect')}</span>
                </label>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium">{t('nodeColor')}</label>
                <input
                  type="color"
                  value={selectedNode.data.color || '#8b4513'}
                  onChange={(e) => updateSelectedNodeData({ color: e.target.value })}
                  className="h-8 w-full cursor-pointer rounded border border-[var(--border-color)]"
                />
              </div>
            </div>
          ) : selectedEdge ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{t('edgeInspector')}</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={deleteSelectedEdge}
                  aria-label={t('deleteEdge')}
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">{t('edgeLabel')}</label>
                <Input
                  value={selectedEdge.label ?? ''}
                  onChange={(e) => updateSelectedEdgeLabel(e.target.value)}
                  placeholder={t('edgeLabelPlaceholder')}
                />
              </div>
            </div>
          ) : (
            <div className="text-xs leading-relaxed text-[var(--text-muted)]">
              {t('selectNodeHint')}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
