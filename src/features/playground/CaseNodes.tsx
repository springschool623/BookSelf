'use client';

import * as React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTranslations } from 'next-intl';
import {
  Clock,
  MapPin,
  Search,
  ShieldCheck,
  ShieldAlert,
  StickyNote,
  UserX,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { cn, getBookInitials } from '@/lib/utils';
import type { CaseNodeData, StickyColor } from '@/types';

const STICKY_BG: Record<StickyColor, string> = {
  yellow: 'bg-amber-200 border-amber-400 text-stone-900',
  pink: 'bg-rose-200 border-rose-400 text-stone-900',
  blue: 'bg-sky-200 border-sky-400 text-stone-900',
  purple: 'bg-purple-200 border-purple-400 text-stone-900',
};

function PinDot() {
  return (
    <span className="pointer-events-none absolute -top-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white bg-rose-600 shadow-sm" />
  );
}

function CardHandles() {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !bg-rose-600"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !bg-rose-600"
      />
    </>
  );
}

function getDimmedClass(data: CaseNodeData): string {
  return data.__dimmed ? 'opacity-25 scale-95' : 'opacity-100';
}

export function SuspectCaseNode({ data, selected }: NodeProps) {
  const t = useTranslations('playground');
  const d = data as CaseNodeData;
  const suspicion = Math.min(100, Math.max(0, d.suspicionLevel ?? 0));
  const status = d.suspectStatus ?? 'prime';

  const statusBadge = {
    prime: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
    alibi: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    cleared: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    victim: 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200',
  }[status];

  return (
    <div
      className={cn(
        'relative w-60 rounded-xl border-2 border-rose-500/70 bg-[var(--bg-card)] p-3 text-[var(--text-primary)] shadow-md transition-all',
        selected && 'ring-2 ring-rose-500 shadow-lg',
        getDimmedClass(d)
      )}
    >
      <PinDot />
      <CardHandles />
      <div className="flex items-start gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-200">
          {getBookInitials(d.label || 'S')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-sm font-bold">{d.label}</span>
            {status === 'cleared' ? (
              <UserCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            ) : status === 'victim' ? (
              <UserX className="h-3.5 w-3.5 shrink-0 text-stone-500" />
            ) : null}
          </div>
          {d.role && (
            <div className="truncate text-[11px] text-[var(--text-secondary)]">
              {d.role}
            </div>
          )}
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', statusBadge)}>
              {t(`suspectStatuses.${status}`)}
            </span>
            {typeof d.chapter === 'number' && (
              <span className="text-[10px] text-[var(--text-muted)]">
                {t('chapterShort', { chapter: d.chapter })}
              </span>
            )}
          </div>
        </div>
      </div>

      {status !== 'victim' && (
        <div className="mt-2.5 space-y-1">
          <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
            <span>{t('suspicionLevel')}</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              {suspicion}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]">
            <div
              className="h-full rounded-full bg-rose-600 transition-all"
              style={{ width: `${suspicion}%` }}
            />
          </div>
        </div>
      )}

      {d.motive && (
        <p className="mt-2 line-clamp-2 text-[11px] text-[var(--text-muted)]">
          {d.motive}
        </p>
      )}
    </div>
  );
}

export function ClueCaseNode({ data, selected }: NodeProps) {
  const t = useTranslations('playground');
  const d = data as CaseNodeData;
  const rel = d.reliability ?? 'unverified';

  const relBadge = {
    verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    unverified: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    'red-herring': 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
  }[rel];

  return (
    <div
      className={cn(
        'relative w-56 rounded-xl border-2 border-amber-500/70 bg-[var(--bg-card)] p-3 text-[var(--text-primary)] shadow-md transition-all',
        selected && 'ring-2 ring-amber-500 shadow-lg',
        getDimmedClass(d)
      )}
    >
      <PinDot />
      <CardHandles />
      <div className="flex items-start gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {rel === 'red-herring' ? (
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
          ) : (
            <Search className="h-3.5 w-3.5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 text-xs font-bold leading-snug">{d.label}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', relBadge)}>
              {t(`reliabilities.${rel}`)}
            </span>
            {typeof d.chapter === 'number' && (
              <span className="text-[10px] text-[var(--text-muted)]">
                {t('chapterShort', { chapter: d.chapter })}
              </span>
            )}
          </div>
          {d.description && (
            <p className="mt-1.5 line-clamp-2 text-[11px] text-[var(--text-muted)]">
              {d.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function StickyCaseNode({ id, data, selected }: NodeProps) {
  const t = useTranslations('playground');
  const d = data as CaseNodeData & {
    __onInlineChange?: (nodeId: string, label: string) => void;
  };
  const color = d.stickyColor ?? 'yellow';
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(d.label);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft !== d.label) {
      d.__onInlineChange?.(id, draft.trim());
    }
  };

  return (
    <div
      onDoubleClick={() => {
        setDraft(d.label);
        setEditing(true);
      }}
      className={cn(
        'relative w-52 rounded-md border-2 p-3 shadow-md transition-all',
        STICKY_BG[color],
        selected && 'ring-2 ring-[var(--accent-primary)] shadow-lg',
        getDimmedClass(d)
      )}
    >
      <PinDot />
      <CardHandles />
      <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase opacity-70">
        <span className="inline-flex items-center gap-1">
          <StickyNote className="h-3 w-3" />
          {t('nodeTypes.sticky')}
        </span>
        {typeof d.chapter === 'number' && (
          <span>{t('chapterShort', { chapter: d.chapter })}</span>
        )}
      </div>
      {editing ? (
        <textarea
          autoFocus
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              commit();
            }
          }}
          className="nodrag w-full rounded bg-white/70 p-1 text-xs font-medium text-stone-900 focus:outline-none"
        />
      ) : (
        <p className="text-xs font-semibold leading-snug">{d.label}</p>
      )}
      {d.description && !editing && (
        <p className="mt-1 line-clamp-3 text-[11px] opacity-80">{d.description}</p>
      )}
    </div>
  );
}

export function AlibiCaseNode({ data, selected }: NodeProps) {
  const t = useTranslations('playground');
  const d = data as CaseNodeData;
  const verified = Boolean(d.alibiVerified);

  return (
    <div
      className={cn(
        'relative w-56 rounded-xl border-2 p-3 bg-[var(--bg-card)] text-[var(--text-primary)] shadow-md transition-all',
        verified ? 'border-emerald-500/70' : 'border-amber-500/70',
        selected && 'ring-2 ring-emerald-500 shadow-lg',
        getDimmedClass(d)
      )}
    >
      <PinDot />
      <CardHandles />
      <div className="flex items-start gap-2">
        <div
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
            verified
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
          )}
        >
          {verified ? (
            <ShieldCheck className="h-4 w-4" />
          ) : (
            <ShieldAlert className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-bold">{d.label}</div>
          {d.timeLabel && (
            <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 dark:text-sky-400">
              <Clock className="h-3 w-3" />
              <span>{d.timeLabel}</span>
            </div>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 font-semibold',
                verified
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
              )}
            >
              {verified ? t('alibiConfirmed') : t('alibiQuestionable')}
            </span>
            {d.witness && (
              <span className="truncate text-[var(--text-muted)]">· {d.witness}</span>
            )}
          </div>
          {d.description && (
            <p className="mt-1 line-clamp-2 text-[11px] text-[var(--text-muted)]">
              {d.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function LocationCaseNode({ data, selected }: NodeProps) {
  const t = useTranslations('playground');
  const d = data as CaseNodeData;

  return (
    <div
      className={cn(
        'relative w-56 rounded-xl border-2 border-sky-500/70 bg-[var(--bg-card)] p-3 text-[var(--text-primary)] shadow-md transition-all',
        selected && 'ring-2 ring-sky-500 shadow-lg',
        getDimmedClass(d)
      )}
    >
      <PinDot />
      <CardHandles />
      <div className="flex items-start gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200">
          <MapPin className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-bold">{d.label}</div>
          {typeof d.chapter === 'number' && (
            <div className="text-[10px] text-[var(--text-muted)]">
              {t('chapterShort', { chapter: d.chapter })}
            </div>
          )}
          {d.description && (
            <p className="mt-1 line-clamp-2 text-[11px] text-[var(--text-muted)]">
              {d.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export const playgroundNodeTypes = {
  suspect: SuspectCaseNode,
  clue: ClueCaseNode,
  sticky: StickyCaseNode,
  alibi: AlibiCaseNode,
  location: LocationCaseNode,
};
