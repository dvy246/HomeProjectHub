import enDict from '../../i18n/en.json';

const dictCache = new Map<string, Record<string, any>>();
dictCache.set('en', enDict as Record<string, any>);

const listeners = new Set<(locale: string) => void>();
let currentLocale: string | null = null;

export const SUPPORTED_LOCALES = ['en', 'es', 'de', 'pt', 'pl', 'it'] as const;

function detectLocale(): string {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem('hp_locale');
    if (stored && (SUPPORTED_LOCALES as readonly string[]).includes(stored)) return stored;
  } catch {}
  try {
    const browser = navigator.language?.split('-')[0];
    if (browser && (SUPPORTED_LOCALES as readonly string[]).includes(browser)) return browser;
  } catch {}
  return 'en';
}

export function getLocale(): string {
  if (!currentLocale) currentLocale = detectLocale();
  return currentLocale;
}

export function getDictSync(locale: string): Record<string, any> | null {
  return dictCache.get(locale) ?? null;
}

export async function loadDict(locale: string): Promise<Record<string, any>> {
  if (dictCache.has(locale)) return dictCache.get(locale)!;

  let mod: { default: Record<string, any> };
  switch (locale) {
    case 'es':
      mod = await import('../../i18n/es.json');
      break;
    case 'de':
      mod = await import('../../i18n/de.json');
      break;
    case 'pt':
      mod = await import('../../i18n/pt.json');
      break;
    case 'pl':
      mod = await import('../../i18n/pl.json');
      break;
    case 'it':
      mod = await import('../../i18n/it.json');
      break;
    default:
      return enDict as Record<string, any>;
  }

  dictCache.set(locale, mod.default);
  return mod.default;
}

export async function setLocale(locale: string): Promise<void> {
  await loadDict(locale);
  currentLocale = locale;
  try {
    localStorage.setItem('hp_locale', locale);
  } catch {}
  listeners.forEach((fn) => fn(locale));
}

export function subscribeToLocale(fn: (locale: string) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function resolveKey(
  dict: Record<string, any>,
  key: string,
): string | undefined {
  const parts = key.split('.');
  let current: any = dict;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

export function interpolate(
  text: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_: string, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`,
  );
}
