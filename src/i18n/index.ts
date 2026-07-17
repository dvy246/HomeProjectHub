import type en from './en.json';
import enDict from './en.json';
import esDict from './es.json';
import deDict from './de.json';
import ptDict from './pt.json';
import plDict from './pl.json';
import itDict from './it.json';

export type Locale = 'en' | 'es' | 'de' | 'pt' | 'pl' | 'it';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'es', 'de', 'pt', 'pl', 'it'];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  pl: 'Polski',
  it: 'Italiano',
};

const allTranslations: Record<Locale, Record<string, unknown>> = {
  en: enDict,
  es: esDict,
  de: deDict,
  pt: ptDict,
  pl: plDict,
  it: itDict,
};

export function getTranslations(locale: Locale): typeof en {
  return (allTranslations[locale] || allTranslations['en']) as typeof en;
}

export function t(locale: Locale, key: string): string {
  const dict = allTranslations[locale] || allTranslations['en'];
  const parts = key.split('.');
  let result: unknown = dict;
  for (const part of parts) {
    if (result && typeof result === 'object' && part in result) {
      result = (result as Record<string, unknown>)[part];
    } else {
      const fallbackDict = allTranslations['en'];
      let fallback: unknown = fallbackDict;
      for (const p of parts) {
        if (fallback && typeof fallback === 'object' && p in fallback) {
          fallback = (fallback as Record<string, unknown>)[p];
        } else {
          return key;
        }
      }
      return typeof fallback === 'string' ? fallback : key;
    }
  }
  return typeof result === 'string' ? result : key;
}

export function getLocaleFromUrl(url: string): Locale {
  const match = url.match(/^\/([a-z]{2})(\/|$)/i);
  if (match && SUPPORTED_LOCALES.includes(match[1].toLowerCase() as Locale)) {
    return match[1].toLowerCase() as Locale;
  }
  return DEFAULT_LOCALE;
}

export function localizedPath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return `/${locale}${path}`;
}
