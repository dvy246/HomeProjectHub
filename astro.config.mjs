import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://homeplanninghub.com',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'de', 'pt', 'pl', 'it'],
    routing: {
      prefixDefaultLocale: false,
      strategy: 'prefix',
      fallback: {
        es: 'en',
        de: 'en',
        pt: 'en',
        pl: 'en',
        it: 'en',
      },
    },
  },
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          es: 'es-ES',
          de: 'de-DE',
          pt: 'pt-PT',
          pl: 'pl-PL',
          it: 'it-IT',
        },
      },
      filter: (page) => {
        const path = new URL(page).pathname;
        const isLocale = /^\/(es|de|pt|pl|it)(\/|$)/.test(path);
        return (
          !isLocale &&
          !path.includes('/saved/') &&
          !path.includes('/planner/') &&
          !path.includes('/projects/') &&
          !path.includes('/zz-test/')
        );
      },
      serialize(item) {
        const path = item.url.replace('https://homeplanninghub.com', '');
        if (path === '/' || path === '') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
          item.lastmod = new Date().toISOString();
        } else if (path.startsWith('/calculators/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (path.startsWith('/strategy/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else if (path.startsWith('/maintenance/')) {
          item.priority = 0.7;
          item.changefreq = 'monthly';
        } else if (path.startsWith('/guides/')) {
          item.priority = 0.7;
          item.changefreq = 'monthly';
        } else if (path.startsWith('/compare/')) {
          item.priority = 0.6;
          item.changefreq = 'monthly';
        } else if (path.startsWith('/quizzes/')) {
          item.priority = 0.6;
          item.changefreq = 'monthly';
        } else if (path.startsWith('/about/') || path.startsWith('/contact/')) {
          item.priority = 0.5;
          item.changefreq = 'monthly';
        } else {
          item.priority = 0.5;
          item.changefreq = 'monthly';
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
