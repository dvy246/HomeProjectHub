import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://homeplanninghub.com',
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        return (
          !path.startsWith('/saved/') &&
          !path.startsWith('/planner/') &&
          path !== '/projects/' &&
          path !== '/projects/index.html' &&
          !path.startsWith('/projects/new') &&
          !path.startsWith('/zz-test/') &&
          !path.startsWith('/embed/') &&
          !path.startsWith('/renovate/plans/') &&
          path !== '/privacy/' &&
          path !== '/terms/' &&
          path !== '/disclaimer/' &&
          path !== '/privacy.html' &&
          path !== '/terms.html' &&
          path !== '/disclaimer.html' &&
          path !== '/404.html' &&
          path !== '/500.html' &&
          path !== '/404/' &&
          path !== '/500/'
        );
      },
      serialize(item) {
        const path = item.url.replace('https://homeplanninghub.com', '');
        if (path === '/' || path === '') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
          item.lastmod = new Date().toISOString();
        } else if (path.startsWith('/estimate/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (path.startsWith('/calculators/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (
          path.startsWith('/finance/') ||
          path.startsWith('/renovation/') ||
          path.startsWith('/planning/') ||
          path.startsWith('/energy/') ||
          path.startsWith('/projects/')
        ) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (path.startsWith('/strategy/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else if (path.startsWith('/maintenance/')) {
          item.priority = 0.7;
          item.changefreq = 'monthly';
        } else if (path.startsWith('/playbook/')) {
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
