import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://homeprojecthub.com',
  integrations: [
    react(),
    sitemap({
      filter: (page) => page !== 'https://homeprojecthub.com/privacy/' && page !== 'https://homeprojecthub.com/terms/',
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
