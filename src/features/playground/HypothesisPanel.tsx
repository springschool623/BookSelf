'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { nanoid } from 'nanoid';
import { CheckCircle2, HelpCircle, Plus, ThumbsDown, ThumbsUp, Trash2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import type { CaseHypothesis, CaseNode, HypothesisStatus } from '@/types';

interface HypothesisPanelProps {
  hypotheses: CaseHypothesis[];
  nodes: CaseNode[];
  onChange: (next: CaseHypothesis[]) => void;
}

const STATUSES: HypothesisStatus[] = ['investigating', 'confirmed', 'disproved'];

export function HypothesisPanel({
  hypotheses,
  nodes,
  onChange,
}: HypothesisPanelProps) {
  const t = useTranslations('playground');
  const [title, setTitle] = React.useState('');

  const suspectNodes = nodes.filter((n) => n.type === 'suspect');
  const evidenceNodes = nodes.filter((n) => n.type !== 'suspect');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const next: CaseHypothesis = {
      id: `hyp-${nanoid(6)}`,
      title: title.trim(),
      status: 'investigating',
      supportingNodeIds: [],
      contradictingNodeIds: [],
      notes: '',
    };
    onChange([next, ...hypotheses]);
    setTitle('');
  };

  const updateHypothesis = (id: string, patch: Partial<CaseHypothesis>) => {
    onChange(hypotheses.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

  const toggleEvidence = (
    hyp: CaseHypothesis,
    nodeId: string,
    bucket: 'supportingNodeIds' | 'contradictingNodeIds'
  ) => {
    const otherBucket =
      bucket === 'supportingNodeIds' ? 'contradictingNodeIds' : 'supportingNodeIds';
    const exists = hyp[bucket].includes(nodeId);
    const nextBucket = exists
      ? hyp[bucket].filter((id) => id !== nodeId)
      : [...hyp[bucket], nodeId];
    const nextOther = hyp[otherBucket].filter((id) => id !== nodeId);

    updateHypothesis(hyp.id, {
      [bucket]: nextBucket,
      [otherBucket]: nextOther,
    });
  };

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-1.5">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('hypothesisPlaceholder')}
          className="text-xs"
        />
        <Button size="sm" type="submit">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </form>

      {hypotheses.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">{t('noHypotheses')}</p>
      ) : (
        <div className="space-y-3">
          {hypotheses.map((hyp) => {
            const StatusIcon =
              hyp.status === 'confirmed'
                ? CheckCircle2
                : hyp.status === 'disproved'
                  ? XCircle
                  : HelpCircle;
            const badgeVariant =
              hyp.status === 'confirmed'
                ? 'success'
                : hyp.status === 'disproved'
                  ? 'danger'
                  : 'warning';

            return (
              <div
                key={hyp.id}
                className="space-y-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <Badge variant={badgeVariant}>
                      <StatusIcon className="h-3 w-3" />
                      <span>{t(`hypothesisStatuses.${hyp.status}`)}</span>
                    </Badge>
                    <h4 className="text-xs font-semibold leading-snug">{hyp.title}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(hypotheses.filter((item) => item.id !== hyp.id))
                    }
                    className="rounded p-1 text-[var(--text-muted)] hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <Select
                    value={hyp.status}
                    onChange={(e) =>
                      updateHypothesis(hyp.id, {
                        status: e.target.value as HypothesisStatus,
                      })
                    }
                    className="py-1 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t(`hypothesisStatuses.${s}`)}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={hyp.suspectNodeId ?? ''}
                    onChange={(e) =>
                      updateHypothesis(hyp.id, {
                        suspectNodeId: e.target.value || undefined,
                      })
                    }
                    className="py-1 text-xs"
                  >
                    <option value="">{t('targetSuspect')}</option>
                    {suspectNodes.map((sn) => (
                      <option key={sn.id} value={sn.id}>
                        {sn.data.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <Textarea
                  rows={2}
                  value={hyp.notes ?? ''}
                  onChange={(e) =>
                    updateHypothesis(hyp.id, { notes: e.target.value })
                  }
                  placeholder={t('hypothesisNotesPlaceholder')}
                  className="min-h-14 text-xs"
                />

                {evidenceNodes.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-[var(--border-color)]">
                    <div className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">
                      {t('linkEvidence')}
                    </div>
                    <div className="max-h-32 space-y-1 overflow-y-auto">
                      {evidenceNodes.map((ev) => {
                        const isSup = hyp.supportingNodeIds.includes(ev.id);
                        const isCon = hyp.contradictingNodeIds.includes(ev.id);
                        return (
                          <div
                            key={ev.id}
                            className="flex items-center justify-between gap-1 rounded bg-[var(--bg-card)] px-2 py-1 text-[11px]"
                          >
                            <span className="truncate flex-1">
                              {nodeMap.get(ev.id)?.data.label}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                title={t('supporting')}
                                onClick={() =>
                                  toggleEvidence(hyp, ev.id, 'supportingNodeIds')
                                }
                                className={`rounded p-1 cursor-pointer ${
                                  isSup
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'
                                }`}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                title={t('contradicting')}
                                onClick={() =>
                                  toggleEvidence(hyp, ev.id, 'contradictingNodeIds')
                                }
                                className={`rounded p-1 cursor-pointer ${
                                  isCon
                                    ? 'bg-rose-600 text-white'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'
                                }`}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
