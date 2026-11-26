'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  AlertTriangle,
  Calendar,
  MapPin,
  Search,
  StickyNote,
  User,
} from 'lucide-react';
import { cn, getBookInitials } from '@/lib/utils';
import type { MindNodeData, MindNodeType } from '@/types';

const TYPE_META: Record<
  MindNodeType,
  { border: string; badgeBg: string; icon: typeof User }
> = {
  character: {
    border: 'border-amber-600/60 dark:border-amber-500/60',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    icon: User,
  },
  event: {
    border: 'border-sky-600/60 dark:border-sky-500/60',
    badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    icon: Calendar,
  },
  clue: {
    border: 'border-rose-600/60 dark:border-rose-500/60',
    badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    icon: Search,
  },
  place: {
    border: 'border-emerald-600/60 dark:border-emerald-500/60',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    icon: MapPin,
  },
  note: {
    border: 'border-stone-500/60',
    badgeBg: 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200',
    icon: StickyNote,
  },
};

function MindNodeCard({
  kind,
  data,
  selected,
}: {
  kind: MindNodeType;
  data: MindNodeData;
  selected?: boolean;
}) {
  const meta = TYPE_META[kind];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        'w-56 rounded-xl border-2 bg-[var(--bg-card)] p-3 text-[var(--text-primary)] shadow-sm transition-shadow',
        meta.border,
        selected && 'ring-2 ring-[var(--accent-primary)] shadow-md'
      )}
      style={data.color ? { borderColor: data.color } : undefined}
    >
      <Handle type="target" position={Position.Top} className="!h-2.5 !w-2.5 !bg-[var(--accent-primary)]" />
      <div className="flex items-start gap-2.5">
        {kind === 'character' ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent-primary)]">
            {getBookInitials(data.label || 'C')}
          </div>
        ) : (
          <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', meta.badgeBg)}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <div className="truncate text-sm font-semibold">{data.label}</div>
            {data.isSuspect && (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
            )}
          </div>
          {data.role && (
            <div className="truncate text-[11px] font-medium text-[var(--accent-primary)]">
              {data.role}
            </div>
          )}
          {data.date && (
            <div className="truncate text-[11px] font-medium text-sky-600 dark:text-sky-400">
              {data.date}
            </div>
          )}
          {data.description && (
            <p className="mt-1 line-clamp-2 text-[11px] text-[var(--text-muted)]">
              {data.description}
            </p>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!h-2.5 !w-2.5 !bg-[var(--accent-primary)]" />
    </div>
  );
}

export function CharacterNode({ data, selected }: NodeProps) {
  return <MindNodeCard kind="character" data={data as MindNodeData} selected={selected} />;
}
export function EventNode({ data, selected }: NodeProps) {
  return <MindNodeCard kind="event" data={data as MindNodeData} selected={selected} />;
}
export function ClueNode({ data, selected }: NodeProps) {
  return <MindNodeCard kind="clue" data={data as MindNodeData} selected={selected} />;
}
export function PlaceNode({ data, selected }: NodeProps) {
  return <MindNodeCard kind="place" data={data as MindNodeData} selected={selected} />;
}
export function NoteNode({ data, selected }: NodeProps) {
  return <MindNodeCard kind="note" data={data as MindNodeData} selected={selected} />;
}

export const mindMapNodeTypes = {
  character: CharacterNode,
  event: EventNode,
  clue: ClueNode,
  place: PlaceNode,
  note: NoteNode,
};
