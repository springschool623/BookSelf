'use client';

import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { LOCALE_COOKIE, localeLabels, locales, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations('common');
  const router = useRouter();

  const handleChange = (nextLocale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1.5 text-xs">
      <Languages className="h-3.5 w-3.5 text-[var(--text-muted)]" />
      <select
        aria-label={t('language')}
        value={locale}
        onChange={(e) => handleChange(e.target.value as Locale)}
        className="bg-transparent font-medium text-[var(--text-primary)] focus:outline-none cursor-pointer"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
            {localeLabels[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
