import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://homeprojecthub.com',
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/privacy/') &&
        !page.includes('/terms/') &&
        !page.includes('/disclaimer/') &&
        !page.includes('/saved/') &&
        !page.includes('/planner/'),
      serialize(item) {
        const path = item.url.replace('https://homeprojecthub.com', '');
        if (path === '/' || path === '') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (path.startsWith('/calculators/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (path.startsWith('/guides/')) {
          item.priority = 0.7;
          item.changefreq = 'monthly';
        } else if (path.startsWith('/compare/')) {
          item.priority = 0.6;
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
