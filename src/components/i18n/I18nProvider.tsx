import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  getDictSync,
  loadDict,
  resolveKey,
  interpolate,
  getLocale,
  subscribeToLocale,
} from './i18n-store';

interface I18nContextValue {
  locale: string;
  t: (
    key: string,
    params?: Record<string, string | number>,
  ) => string | undefined;
}

const defaultT = (): undefined => undefined;
const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  t: defaultT,
});

interface I18nProviderProps {
  locale: string;
  children: ReactNode;
}

export function I18nProvider({ locale, children }: I18nProviderProps) {
  const [dict, setDict] = useState<Record<string, any> | null>(() =>
    getDictSync(locale),
  );

  useEffect(() => {
    let cancelled = false;
    loadDict(locale).then((d) => {
      if (!cancelled) setDict(d);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const t = useCallback(
    (
      key: string,
      params?: Record<string, string | number>,
    ): string | undefined => {
      if (!dict) return undefined;
      const resolved = resolveKey(dict, key);
      if (resolved !== undefined) {
        return params ? interpolate(resolved, params) : resolved;
      }
      const enDict = getDictSync('en');
      if (enDict) {
        const enResolved = resolveKey(enDict, key);
        if (enResolved !== undefined) {
          return params ? interpolate(enResolved, params) : enResolved;
        }
      }
      return undefined;
    },
    [dict],
  );

  return (
    <I18nContext.Provider value={{ locale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

function buildT(locale: string): I18nContextValue['t'] {
  return (
    key: string,
    params?: Record<string, string | number>,
  ): string | undefined => {
    const dict = getDictSync(locale);
    if (!dict) return undefined;
    const resolved = resolveKey(dict, key);
    if (resolved !== undefined) {
      return params ? interpolate(resolved, params) : resolved;
    }
    const enDict = getDictSync('en');
    if (enDict) {
      const enResolved = resolveKey(enDict, key);
      if (enResolved !== undefined) {
        return params ? interpolate(enResolved, params) : enResolved;
      }
    }
    return undefined;
  };
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  const hasProvider = context.t !== defaultT;

  if (!hasProvider) {
    const [locale, setLocale] = useState(getLocale);

    useEffect(() => {
      return subscribeToLocale(setLocale);
    }, []);

    const t = useCallback(buildT(locale), [locale]);

    return { locale, t };
  }

  return context;
}
