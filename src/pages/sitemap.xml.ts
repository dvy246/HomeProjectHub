import type { APIRoute } from 'astro';

const pages = [
  { path: '/', priority: '1.0' },
  { path: '/calculators/concrete/', priority: '0.8' },
  { path: '/calculators/concrete/slab/', priority: '0.9' },
  { path: '/calculators/concrete/footing/', priority: '0.9' },
  { path: '/calculators/concrete/rebar/', priority: '0.9' },
  { path: '/calculators/concrete/block-fill/', priority: '0.9' },
  { path: '/calculators/concrete/mix-ratio/', priority: '0.9' },
  { path: '/calculators/concrete/steps/', priority: '0.9' },
  { path: '/calculators/concrete/column/', priority: '0.9' },
  { path: '/calculators/concrete/wall/', priority: '0.9' },
  { path: '/calculators/concrete/tube/', priority: '0.9' },
  { path: '/calculators/concrete/curb-gutter/', priority: '0.9' },
  { path: '/calculators/roofing/', priority: '0.8' },
  { path: '/calculators/roofing/shingles/', priority: '0.9' },
  { path: '/calculators/roofing/metal/', priority: '0.9' },
  { path: '/calculators/roofing/plywood/', priority: '0.9' },
  { path: '/calculators/roofing/pitch/', priority: '0.9' },
  { path: '/calculators/roofing/ice-water-shield/', priority: '0.9' },
  { path: '/calculators/roofing/snow-load/', priority: '0.9' },
  { path: '/compare/', priority: '0.7' },
  { path: '/compare/concrete-vs-pavers/', priority: '0.7' },
  { path: '/compare/concrete-vs-gravel/', priority: '0.7' },
  { path: '/saved/', priority: '0.6' },
  { path: '/about/', priority: '0.5' },
  { path: '/contact/', priority: '0.5' },
];

export const GET: APIRoute = ({ site }) => {
  const baseURL = site?.toString() || 'https://homeprojecthub.com';
  const lastmod = new Date().toISOString().split('T')[0];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${baseURL}${p.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
