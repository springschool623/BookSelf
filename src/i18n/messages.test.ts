import { describe, expect, it } from 'vitest';
import vi from '../../messages/vi.json';
import en from '../../messages/en.json';
import zh from '../../messages/zh.json';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flattenKeys(v as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

describe('i18n message bundles', () => {
  it('have identical flattened keys across vi, en, and zh', () => {
    const viKeys = flattenKeys(vi);
    const enKeys = flattenKeys(en);
    const zhKeys = flattenKeys(zh);

    expect(enKeys).toEqual(viKeys);
    expect(zhKeys).toEqual(viKeys);
    expect(viKeys.length).toBeGreaterThan(50);
  });
});
