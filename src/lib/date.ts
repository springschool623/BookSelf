import { format, parseISO } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';
import type { Locale } from '@/i18n/config';

const dateLocaleMap = {
  vi,
  en: enUS,
  zh: zhCN,
} as const;

export function formatDateLocalized(
  dateStr: string,
  locale: Locale,
  pattern = 'PP'
): string {
  try {
    const parsed = parseISO(dateStr);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return format(parsed, pattern, { locale: dateLocaleMap[locale] ?? vi });
  } catch {
    return dateStr;
  }
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
