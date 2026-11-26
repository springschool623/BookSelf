'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Download, RotateCcw, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { parseBackupJson } from '@/lib/backup';
import {
  buildCurrentBackup,
  resetAllToSampleData,
  restoreBackupPayload,
} from '@/stores/backupActions';
import { useHydrated } from '@/stores/useHydrated';

export function SettingsView() {
  const hydrated = useHydrated();
  const tSettings = useTranslations('settings');
  const tCommon = useTranslations('common');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const payload = buildCurrentBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookvault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const payload = parseBackupJson(text);
      await restoreBackupPayload(payload);
      toast.success(
        tSettings('importSuccess', {
          books: payload.books.length,
          journals: payload.journals.length,
          notes: payload.notes.length,
          mindmaps: payload.mindmaps.length,
        })
      );
    } catch {
      toast.error(tSettings('importInvalid'));
    } finally {
      e.target.value = '';
    }
  };

  const handleReset = async () => {
    if (!window.confirm(tSettings('resetConfirm'))) return;
    await resetAllToSampleData();
    toast.success(tSettings('resetSuccess'));
  };

  if (!hydrated) return <PageSkeleton />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-bold sm:text-3xl">
          {tSettings('title')}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {tSettings('subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{tSettings('appearance')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium">{tCommon('theme')}</div>
              <div className="text-xs text-[var(--text-secondary)]">
                {tSettings('themeDesc')}
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--border-color)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium">{tCommon('language')}</div>
              <div className="text-xs text-[var(--text-secondary)]">
                {tSettings('languageDesc')}
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{tSettings('dataManagement')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium">{tSettings('exportBtn')}</div>
              <div className="text-xs text-[var(--text-secondary)]">
                {tSettings('exportDesc')}
              </div>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" />
              <span>{tSettings('exportBtn')}</span>
            </Button>
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--border-color)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium">{tSettings('importBtn')}</div>
              <div className="text-xs text-[var(--text-secondary)]">
                {tSettings('importDesc')}
              </div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportFile}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                <span>{tSettings('importBtn')}</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--border-color)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium">{tSettings('resetBtn')}</div>
              <div className="text-xs text-[var(--text-secondary)]">
                {tSettings('resetDesc')}
              </div>
            </div>
            <Button variant="danger" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              <span>{tSettings('resetBtn')}</span>
            </Button>
          </div>

          <p className="rounded-lg bg-[var(--bg-secondary)] p-3 text-xs text-[var(--text-muted)]">
            {tSettings('architectureNote')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
