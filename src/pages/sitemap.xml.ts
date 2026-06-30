import type { APIRoute } from 'astro';

const pages = [
  '/',
  '/calculators/concrete/',
  '/calculators/concrete/slab/',
  '/calculators/concrete/footing/',
  '/calculators/concrete/steps/',
  '/calculators/concrete/column/',
  '/calculators/concrete/wall/',
  '/calculators/concrete/tube/',
  '/calculators/roofing/',
  '/calculators/roofing/shingles/',
  '/calculators/roofing/metal/',
  '/calculators/roofing/plywood/',
  '/calculators/roofing/pitch/',
  '/compare/',
  '/compare/concrete-vs-pavers/',
  '/saved/',
  '/about/',
  '/privacy/',
  '/terms/',
];

export const GET: APIRoute = ({ site }) => {
  const baseURL = site?.toString() || 'https://homeprojecthub.com';
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseURL}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '/' ? '1.0' : page.includes('/calculators/') ? '0.8' : '0.6'}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
