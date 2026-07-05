import { useState, useEffect } from 'react';
import { getLocale, setLocale, subscribeToLocale } from './i18n-store';

const LOCALES = ['en', 'es', 'de', 'pt', 'pl', 'it'] as const;
const LOCALE_NAMES: Record<string, string> = { en: 'English', es: 'Español', de: 'Deutsch', pt: 'Português', pl: 'Polski', it: 'Italiano' };
const LOCALE_FLAGS: Record<string, string> = { en: '🇺🇸', es: '🇪🇸', de: '🇩🇪', pt: '🇵🇹', pl: '🇵🇱', it: '🇮🇹' };

interface Props {
  initialLocale?: string;
}

export function LanguageSwitcher({ initialLocale }: Props) {
  const [locale, setLocaleState] = useState(initialLocale || getLocale());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (initialLocale) return;
    return subscribeToLocale(setLocaleState);
  }, [initialLocale]);

  const handleLocaleChange = (l: string) => {
    if (initialLocale) {
      const pathWithoutLocale = window.location.pathname.replace(/^\/[a-z]{2}/, '') || '/';
      window.location.href = l === 'en' ? pathWithoutLocale : `/${l}${pathWithoutLocale}`;
    } else {
      setLocale(l);
      try { localStorage.setItem('preferred-locale', l); } catch (e) {}
    }
    setOpen(false);
  };

  return (
    <div className="relative group">
      <button
        type="button"
        className="flex items-center gap-1 px-2 py-1.5 text-[13px] font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] rounded-md hover:bg-[var(--bg-muted)] transition-colors"
        aria-label="Select language"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        <span className="hidden sm:inline">{LOCALE_FLAGS[locale]} {locale.toUpperCase()}</span>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        className={`absolute right-0 top-full mt-1 w-36 rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-lg z-50 transition-all duration-150 ${open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        role="menu"
      >
        <div className="py-1">
          {LOCALES.map((l) => (
            <button
              key={l}
              role="menuitem"
              onClick={() => handleLocaleChange(l)}
              className={`block w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                l === locale ? 'text-[var(--accent)] bg-[var(--bg-muted)]' : 'text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              {LOCALE_FLAGS[l]} {LOCALE_NAMES[l]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
