'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  BookMarked,
  BookOpen,
  Compass,
  LayoutDashboard,
  NotebookPen,
  Plus,
  Search,
  SearchCheck,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const { globalSearchQuery, setGlobalSearchQuery } = useSettingsStore();

  const isMindMapFullscreen = pathname.includes('/mindmap/');

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const navItems = [
    { href: '/', label: t('dashboard'), icon: LayoutDashboard, exact: true },
    { href: '/library', label: t('library'), icon: BookOpen, exact: false },
    { href: '/playground', label: t('playground'), icon: SearchCheck, exact: false },
    { href: '/journal', label: t('journal'), icon: NotebookPen, exact: false },
    { href: '/discover', label: t('discover'), icon: Compass, exact: false },
    { href: '/settings', label: t('settings'), icon: Settings, exact: false },
  ];

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathname !== '/library') {
      router.push('/library');
    }
  };

  if (isMindMapFullscreen) {
    return <div className="min-h-screen bg-[var(--bg-primary)]">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="flex h-16 items-center gap-3 border-b border-[var(--border-color)] px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-primary)] text-white shadow-xs">
            <BookMarked className="h-5 w-5" />
          </div>
          <div>
            <div className="font-serif-display text-lg font-bold leading-tight">
              {t('brand')}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">{t('subtitle')}</div>
          </div>
        </div>

        <div className="p-4">
          <Link
            href="/books/new"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-[var(--accent-primary-hover)]"
          >
            <Plus className="h-4 w-4" />
            <span>{t('addBook')}</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`) || (href === '/library' && pathname.startsWith('/books'));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[var(--accent-soft)] text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border-color)] p-4 text-xs text-[var(--text-muted)]">
          BookVault · Local Workspace
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex flex-1 flex-col md:pl-64 pb-20 md:pb-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <BookMarked className="h-5 w-5 text-[var(--accent-primary)]" />
            <span className="font-serif-display font-bold">{t('brand')}</span>
          </div>

          <form onSubmit={handleGlobalSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              ref={searchInputRef}
              type="search"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-1.5 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]"
            />
          </form>

          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <LanguageSwitcher />
          </div>
        </header>

        <main
          className={cn(
            'mx-auto w-full flex-1',
            pathname === '/playground'
              ? 'max-w-none p-2 sm:p-3'
              : 'max-w-7xl p-4 sm:p-6 lg:p-8'
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-[var(--border-color)] bg-[var(--bg-card)]/95 py-2 backdrop-blur-md md:hidden">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium',
                active ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
