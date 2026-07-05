import { useState, useEffect, type ComponentType } from 'react';
import { I18nProvider } from './I18nProvider';
import { getLocale, subscribeToLocale } from './i18n-store';

export function withI18n<P extends object>(
  Component: ComponentType<P>,
): ComponentType<P & { locale?: string }> {
  function I18nWrapped(props: P & { locale?: string }) {
    const [locale, setLocale] = useState(props.locale || getLocale());

    useEffect(() => {
      if (props.locale) return;
      const unsubscribe = subscribeToLocale(setLocale);
      return unsubscribe;
    }, [props.locale]);

    if (locale === 'en') {
      return <Component {...(props as P)} />;
    }

    return (
      <I18nProvider locale={locale}>
        <Component {...(props as P)} />
      </I18nProvider>
    );
  }

  const displayName = Component.displayName || Component.name || 'Component';
  I18nWrapped.displayName = `withI18n(${displayName})`;

  return I18nWrapped;
}
