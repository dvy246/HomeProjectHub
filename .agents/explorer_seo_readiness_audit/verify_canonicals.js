import fs from 'fs';
import path from 'path';

// Target directory and sitemaps
const distDir = '/Users/divyyadav/developer/HomeProjectHub/dist';
const sitemapPath = '/Users/divyyadav/developer/HomeProjectHub/dist/sitemap-0.xml';

// Excluded paths from sitemap (based on astro.config.mjs)
const excludedSubstrings = [
  '/saved/', '/planner/', '/projects/', '/zz-test/', '/embed/',
  '/renovate/plans/', '/privacy/', '/terms/', '/disclaimer/',
  '/404', '/500'
];

function getHtmlFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getHtmlFiles(filePath, files);
    } else if (filePath.endsWith('.html')) {
      files.push(filePath);
    }
  }
  return files;
}

function runAudit() {
  console.log('--- STARTING CANONICAL AND SITEMAP AUDIT ---');

  if (!fs.existsSync(sitemapPath)) {
    console.error(`Sitemap not found at: ${sitemapPath}`);
    return;
  }

  // Load sitemap locations
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  const locRegex = /<loc>(https:\/\/homeplanninghub\.com[^<]*)<\/loc>/g;
  const sitemapUrls = new Set();
  let match;
  while ((match = locRegex.exec(sitemapContent)) !== null) {
    sitemapUrls.add(match[1]);
  }
  console.log(`Loaded ${sitemapUrls.size} URLs from sitemap.`);

  const htmlFiles = getHtmlFiles(distDir);
  console.log(`Found ${htmlFiles.length} HTML files in dist/.\n`);

  let mismatchesCount = 0;
  let nonTrailingSlashCount = 0;
  let missingCanonicalCount = 0;
  let sitemapMismatches = 0;

  const canonicalTags = {};

  for (const file of htmlFiles) {
    const relativePath = path.relative(distDir, file);
    const fileContent = fs.readFileSync(file, 'utf8');
    
    // Extract canonical
    const canonicalMatch = fileContent.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    
    if (!canonicalMatch) {
      // Exclude 404.html and 500.html if they don't have canonicals
      if (relativePath !== '404.html' && relativePath !== '500.html' && !relativePath.startsWith('404/') && !relativePath.startsWith('500/')) {
        console.error(`Error: No canonical tag found in: ${relativePath}`);
        missingCanonicalCount++;
      }
      continue;
    }

    const canonicalUrl = canonicalMatch[1];
    canonicalTags[relativePath] = canonicalUrl;

    // Check 1: Trailing slash check
    if (!canonicalUrl.endsWith('/')) {
      console.warn(`Warning: Canonical URL does not end with trailing slash in ${relativePath}: ${canonicalUrl}`);
      nonTrailingSlashCount++;
    }

    // Check 2: Mismatch between relative path and canonical URL
    let expectedPath = '/' + relativePath.replace(/\\/g, '/');
    if (expectedPath.endsWith('/index.html')) {
      expectedPath = expectedPath.slice(0, -10); // Remove 'index.html', leaves '/'
    } else if (expectedPath.endsWith('.html')) {
      expectedPath = expectedPath.slice(0, -5) + '/'; // Replace .html with /
    }

    // Clean double slashes if index.html was at root
    if (expectedPath === '//') {
      expectedPath = '/';
    }

    const expectedUrl = `https://homeplanninghub.com${expectedPath}`;
    if (canonicalUrl !== expectedUrl) {
      console.error(`Error: Mismatch in ${relativePath}. Canonical is ${canonicalUrl}, but path implies ${expectedUrl}`);
      mismatchesCount++;
    }

    // Check 3: Check against sitemap
    const isExcluded = excludedSubstrings.some(sub => expectedPath.includes(sub));
    if (isExcluded) {
      if (sitemapUrls.has(canonicalUrl)) {
        console.error(`Error: Excluded page ${expectedPath} (canonical: ${canonicalUrl}) is present in sitemap.`);
        sitemapMismatches++;
      }
    } else {
      if (!sitemapUrls.has(canonicalUrl)) {
        if (relativePath !== '404.html' && relativePath !== '500.html') {
          console.warn(`Warning: Page ${expectedPath} (canonical: ${canonicalUrl}) is NOT in the sitemap but is not in the excluded list.`);
          sitemapMismatches++;
        }
      }
    }
  }

  // Check 4: Check if any URL in the sitemap does not exist as a physical file
  console.log('\nChecking if sitemap URLs exist as physical files...');
  let sitemapOrphanCount = 0;
  for (const url of sitemapUrls) {
    const pathPart = url.replace('https://homeplanninghub.com', '');
    let fileCandidates = [];
    if (pathPart === '/') {
      fileCandidates.push('index.html');
    } else {
      fileCandidates.push(path.join(pathPart.slice(1), 'index.html'));
      fileCandidates.push(pathPart.slice(1) + '.html');
    }

    let found = false;
    for (const cand of fileCandidates) {
      const fullCandPath = path.join(distDir, cand);
      if (fs.existsSync(fullCandPath)) {
        found = true;
        break;
      }
    }

    if (!found) {
      console.error(`Error: Sitemap contains URL ${url}, but no corresponding HTML file was found in dist/`);
      sitemapOrphanCount++;
    }
  }

  console.log('\n--- AUDIT SUMMARY ---');
  console.log(`Total HTML files analyzed: ${htmlFiles.length}`);
  console.log(`Total URLs in sitemap: ${sitemapUrls.size}`);
  console.log(`Missing canonical tags: ${missingCanonicalCount}`);
  console.log(`Non-trailing slash canonicals: ${nonTrailingSlashCount}`);
  console.log(`Path vs Canonical URL mismatches: ${mismatchesCount}`);
  console.log(`Sitemap consistency issues: ${sitemapMismatches}`);
  console.log(`Sitemap orphan URLs (no file exists): ${sitemapOrphanCount}`);
  console.log('--------------------------------------');
}

runAudit();
