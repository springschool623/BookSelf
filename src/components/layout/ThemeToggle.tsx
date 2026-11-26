'use client';

import { useSyncExternalStore } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const emptySubscribe = () => () => {};

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('common');
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return <div className="h-8 w-24 rounded-lg bg-[var(--bg-muted)] animate-pulse" />;
  }

  const options = [
    { id: 'light', label: t('light'), icon: Sun },
    { id: 'dark', label: t('dark'), icon: Moon },
    { id: 'system', label: t('system'), icon: Monitor },
  ] as const;

  if (compact) {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const Icon = theme === 'dark' ? Sun : Moon;
    return (
      <button
        type="button"
        onClick={() => setTheme(nextTheme)}
        aria-label={t('theme')}
        title={t('theme')}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="inline-flex rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-0.5">
      {options.map(({ id, label, icon: Icon }) => {
        const active = theme === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer',
              active
                ? 'bg-[var(--bg-card)] text-[var(--accent-primary)] shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
