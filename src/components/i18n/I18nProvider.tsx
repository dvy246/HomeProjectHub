import { createContext, useContext, type ReactNode } from 'react';
import type { Locale } from '../../i18n';

interface I18nContextValue {
  locale: Locale;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  locale: Locale;
  translations: Record<string, string>;
  children: ReactNode;
}

export function I18nProvider({ locale, translations, children }: I18nProviderProps) {
  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: 'en',
      t: (key: string) => key,
    };
  }
  return ctx;
}
