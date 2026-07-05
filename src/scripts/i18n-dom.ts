import {
  getLocale,
  loadDict,
  resolveKey,
  getDictSync,
  subscribeToLocale,
} from '../components/i18n/i18n-store';

function saveOriginals(): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    if (el.getAttribute('data-i18n-original') === null) {
      el.setAttribute('data-i18n-original', el.textContent || '');
    }
  });
  document
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      '[data-i18n-placeholder]',
    )
    .forEach((el) => {
      if (el.getAttribute('data-i18n-placeholder-original') === null) {
        el.setAttribute(
          'data-i18n-placeholder-original',
          el.placeholder || '',
        );
      }
    });
}

function applyDict(dict: Record<string, any>): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const val = resolveKey(dict, key);
    if (val && el.textContent !== val) {
      el.textContent = val;
    }
  });
  document
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      '[data-i18n-placeholder]',
    )
    .forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (!key) return;
      const val = resolveKey(dict, key);
      if (val && el.placeholder !== val) {
        el.placeholder = val;
      }
    });
}

function restoreEnglish(): void {
  document.querySelectorAll<HTMLElement>('[data-i18n-original]').forEach((el) => {
    const orig = el.getAttribute('data-i18n-original');
    if (orig !== null && el.textContent !== orig) {
      el.textContent = orig;
    }
  });
  document
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      '[data-i18n-placeholder-original]',
    )
    .forEach((el) => {
      const orig = el.getAttribute('data-i18n-placeholder-original');
      if (orig !== null && el.placeholder !== orig) {
        el.placeholder = orig;
      }
    });
}

async function applyLocale(locale: string): Promise<void> {
  if (locale === 'en') {
    restoreEnglish();
    return;
  }
  let dict = getDictSync(locale);
  if (!dict) {
    dict = await loadDict(locale);
  }
  applyDict(dict);
}

function init(): void {
  const locale = getLocale();
  saveOriginals();
  if (locale !== 'en') {
    loadDict(locale).then((dict) => applyDict(dict));
  }
}

subscribeToLocale((locale) => {
  applyLocale(locale);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
