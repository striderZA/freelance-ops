/**
 * providers/upwork.mjs — Upwork job search provider.
 *
 * Two backends:
 *   1. Flaresolverr (Docker) — bypasses Cloudflare challenges, recommended
 *   2. Playwright stealth — fallback, often blocked by Cloudflare
 *
 * Set FLARESOLVERR_URL env var or pass useFlaresolverr: true in config.
 *   docker run -d -p 8191:8191 ghcr.io/flaresolverr/flaresolverr
 *
 * Ethical constraints:
 *   - Rate-limited to 1 request per 2 seconds minimum
 *   - No login attempted (public listings only)
 *   - Max 50 results per search
 */

import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
chromium.use(stealth());

const UPWORK_SEARCH_BASE = 'https://www.upwork.com/nx/search/jobs/';
const DEFAULT_MAX_RESULTS = 25;
const MAX_RESULTS_HARD_CAP = 50;
const RATE_LIMIT_MS = 2_000;
const NAVIGATION_TIMEOUT_MS = 15_000;
const SELECTOR_TIMEOUT_MS = 8_000;
const FLARESOLVERR_DEFAULT = 'http://localhost:8191/v1';

let lastRequestTime = 0;

async function rateLimit() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise(r => setTimeout(r, RATE_LIMIT_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

function getFlaresolverrUrl(config) {
  return (config && config.flaresolverrUrl) || process.env.FLARESOLVERR_URL || FLARESOLVERR_DEFAULT;
}

/**
 * Fetch a URL through Flaresolverr (bypasses Cloudflare).
 * @param {string} url
 * @param {object} config
 * @returns {Promise<{html: string, status: number}|null>}
 */
async function requestViaFlaresolverr(url, config = {}) {
  const fsUrl = getFlaresolverrUrl(config);
  try {
    const resp = await fetch(fsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd: 'request.get',
        url,
        maxTimeout: 45000,
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!resp.ok) {
      console.warn(`[upwork.mjs] flaresolverr returned ${resp.status}`);
      return null;
    }
    const data = await resp.json();
    if (!data?.solution?.response) {
      console.warn('[upwork.mjs] flaresolverr response missing solution');
      return null;
    }
    return {
      html: data.solution.response,
      status: data.solution.status || 200,
    };
  } catch (err) {
    console.warn(`[upwork.mjs] flaresolverr request failed: ${err.message}`);
    return null;
  }
}

/**
 * Parse Upwork job cards from HTML returned by Flaresolverr.
 * Uses regex to extract cards from the search results page.
 */
function parseJobCardsFromHtml(html) {
  const jobs = [];

  // Try extracting from JSON-LD structured data first (most reliable)
  const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  for (const block of (jsonLdMatches || [])) {
    try {
      const json = JSON.parse(block.replace(/<[^>]+>/g, ''));
      if (json?.['@type'] === 'ItemList' && json?.itemListElement) {
        for (const item of json.itemListElement) {
          const job = item?.item || item;
          if (job?.title) {
            jobs.push({
              title: job.title,
              url: job.url || '',
              company: job.hiringOrganization?.name || '',
              location: job.jobLocation?.address?.addressLocality || '',
              budget: job.estimatedSalary?.value?.value
                ? `$${job.estimatedSalary.value.value}/${job.estimatedSalary.value.unitText || 'hr'}`
                : '',
              postedAt: job.datePosted ? Date.parse(job.datePosted) : undefined,
            });
          }
        }
      }
    } catch {}
  }
  if (jobs.length > 0) return jobs;

  // Fallback: extract from tile HTML patterns
  const tilePattern = /<div[^>]*class="[^"]*job-tile[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/gi;
  let match;
  while ((match = tilePattern.exec(html)) !== null) {
    const tile = match[1];
    const titleMatch = tile.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    const hrefMatch = tile.match(/href="(\/jobs\/[^"]+)"/);
    const clientMatch = tile.match(/data-test="client-name"[^>]*>([\s\S]*?)</);
    const budgetMatch = tile.match(/data-test="budget"[^>]*>([\s\S]*?)</);
    const locationMatch = tile.match(/data-test="location"[^>]*>([\s\S]*?)</);
    if (titleMatch) {
      jobs.push({
        title: titleMatch[1].replace(/<[^>]+>/g, '').trim(),
        url: hrefMatch ? `https://www.upwork.com${hrefMatch[1]}` : '',
        company: clientMatch ? clientMatch[1].replace(/<[^>]+>/g, '').trim() : '',
        location: locationMatch ? locationMatch[1].replace(/<[^>]+>/g, '').trim() : '',
        budget: budgetMatch ? budgetMatch[1].replace(/<[^>]+>/g, '').trim() : '',
        postedAt: undefined,
      });
    }
  }
  return jobs;
}

/**
 * Extract job details from an HTML page (for fetchJobDetails).
 */
function parseJobDetailFromHtml(html) {
  const titleMatch = html.match(/<h1[^>]*data-test="job-title"[^>]*>([\s\S]*?)<\/h1>/);
  const descMatch = html.match(/<div[^>]*data-test="description"[^>]*>([\s\S]*?)<\/div>/);
  const clientMatch = html.match(/data-test="client-name"[^>]*>([\s\S]*?)</);
  const locationMatch = html.match(/data-test="location"[^>]*>([\s\S]*?)</);
  const budgetMatch = html.match(/data-test="budget"[^>]*>([\s\S]*?)</);
  return {
    title: titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '',
    description: descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '',
    company: clientMatch ? clientMatch[1].replace(/<[^>]+>/g, '').trim() : '',
    location: locationMatch ? locationMatch[1].replace(/<[^>]+>/g, '').trim() : '',
    budget: budgetMatch ? budgetMatch[1].replace(/<[^>]+>/g, '').trim() : '',
  };
}

/**
 * Build a Upwork search URL from query and config.
 */
export function buildSearchUrl(query, config = {}) {
  const maxResults = Math.min(config.maxResults || DEFAULT_MAX_RESULTS, MAX_RESULTS_HARD_CAP);
  const params = new URLSearchParams({ q: query, per_page: String(maxResults) });
  if (config.category) params.set('category', config.category);
  return `${UPWORK_SEARCH_BASE}?${params.toString()}`;
}

/**
 * Extract job cards from a Playwright page.
 */
async function extractJobCards(page, config) {
  const selectors = [
    'div[data-test="JobTile"]', '.job-tile',
    'section[data-test="jobs-list"] > div', '[data-test="search-list"] > div',
  ];
  let cards = [];
  for (const sel of selectors) {
    cards = await page.$$(sel);
    if (cards.length > 0) break;
  }
  if (cards.length === 0) {
    await page.waitForSelector('div[data-test="JobTile"], .job-tile', { timeout: SELECTOR_TIMEOUT_MS }).catch(() => {});
    for (const sel of selectors) { cards = await page.$$(sel); if (cards.length > 0) break; }
  }
  const maxResults = Math.min(config.maxResults || DEFAULT_MAX_RESULTS, MAX_RESULTS_HARD_CAP);
  const jobs = [];
  for (const card of cards.slice(0, maxResults)) {
    const job = await extractJobCard(card);
    if (job) jobs.push(job);
  }
  return jobs;
}

/**
 * Extract a single job card element from Playwright.
 */
async function extractJobCard(card) {
  try {
    const titleEl = await card.$('h2.job-tile-title a, [data-test="job-title"] a, a[data-ev-label="job_title"]');
    if (!titleEl) return null;
    const title = (await titleEl.textContent())?.trim() || '';
    const href = await titleEl.getAttribute('href');
    if (!title || !href) return null;
    const url = href.startsWith('http') ? href : `https://www.upwork.com${href}`;
    const companyEl = await card.$('[data-test="client-name"], .client-name, .up-salary-client-client-info span');
    const company = (await companyEl?.textContent())?.trim() || '';
    const locationEl = await card.$('[data-test="location"], .location, [data-qa="location"]');
    const location = (await locationEl?.textContent())?.trim() || '';
    const budgetEl = await card.$('[data-test="budget"], .budget, [data-qa="budget"]');
    const budget = (await budgetEl?.textContent())?.trim() || '';
    const postedEl = await card.$('[data-test="posted-date"], .posted-date, time');
    let postedAt;
    if (postedEl) {
      const ts = await postedEl.getAttribute('datetime');
      if (ts) { const parsed = Date.parse(ts); if (!Number.isNaN(parsed)) postedAt = parsed; }
    }
    return { title, url, company, location, postedAt, budget };
  } catch { return null; }
}

/**
 * Search Upwork for jobs matching a query.
 * Uses flaresolverr if configured, otherwise Playwright stealth.
 *
 * @param {string} query
 * @param {object} [config] - { maxResults, category, useFlaresolverr, flaresolverrUrl }
 * @returns {Promise<Array<object>>}
 */
export async function search(query, config = {}) {
  const url = buildSearchUrl(query, config);
  await rateLimit();

  // Try flaresolverr first if configured (env var or config flag)
  const useFS = config.useFlaresolverr || process.env.FLARESOLVERR_URL || false;
  if (useFS) {
    const result = await requestViaFlaresolverr(url, config);
    if (result && result.html) {
      const jobs = parseJobCardsFromHtml(result.html);
      if (jobs.length > 0) return jobs.slice(0, Math.min(config.maxResults || DEFAULT_MAX_RESULTS, MAX_RESULTS_HARD_CAP));
      console.warn('[upwork.mjs] flaresolverr returned page but no jobs found — HTML may not match expected patterns');
    }
  }

  // Fallback: Playwright stealth
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-web-security', '--disable-features=BlockInsecurePrivateNetworkRequests',
        '--ignore-certificate-errors-spki-list'],
    });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }, locale: 'en-US', timezoneId: 'America/New_York',
      extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' },
    });
    const page = await context.newPage();
    await page.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT_MS });
    const jobs = await extractJobCards(page, config);
    if (jobs.length > 0) return jobs;
    const title = await page.title();
    if (title.includes('Just a moment') || (await page.content()).includes('cloudflare')) {
      console.warn('[upwork.mjs] Cloudflare challenge detected. Try setting FLARESOLVERR_URL=...');
    }
    return [];
  } catch (err) {
    console.warn(`[upwork.mjs] search failed: ${err.message}`);
    return [];
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

/**
 * Fetch full details of a specific Upwork job posting.
 *
 * @param {string} url
 * @param {object} [config] - { useFlaresolverr, flaresolverrUrl }
 * @returns {Promise<object>}
 */
export async function fetchJobDetails(url, config = {}) {
  await rateLimit();

  // Try flaresolverr first if configured
  const useFS = config.useFlaresolverr || process.env.FLARESOLVERR_URL || false;
  if (useFS) {
    const result = await requestViaFlaresolverr(url, config);
    if (result && result.html) {
      const detail = parseJobDetailFromHtml(result.html);
      return { ...detail, url, postedAt: undefined };
    }
  }

  // Fallback: Playwright stealth
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-web-security', '--disable-features=BlockInsecurePrivateNetworkRequests',
        '--ignore-certificate-errors-spki-list'],
    });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }, locale: 'en-US', timezoneId: 'America/New_York',
      extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' },
    });
    const page = await context.newPage();
    await page.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT_MS });
    const titleEl = await page.$('h1[data-test="job-title"], .job-title, h1');
    const title = (await titleEl?.textContent())?.trim() || '';
    const descriptionEl = await page.$('[data-test="description"], .job-description, [data-qa="job-description"]');
    const description = (await descriptionEl?.textContent())?.trim() || '';
    const clientEl = await page.$('[data-test="client-name"], .client-name');
    const company = (await clientEl?.textContent())?.trim() || '';
    const locationEl = await page.$('[data-test="location"], .location');
    const location = (await locationEl?.textContent())?.trim() || '';
    const budgetEl = await page.$('[data-test="budget"], .budget');
    const budget = (await budgetEl?.textContent())?.trim() || '';
    const postedEl = await page.$('[data-test="posted-date"], time');
    let postedAt;
    if (postedEl) { const ts = await postedEl.getAttribute('datetime'); if (ts) { const parsed = Date.parse(ts); if (!Number.isNaN(parsed)) postedAt = parsed; } }
    return { title, url, company, location, postedAt, budget, description };
  } catch (err) {
    console.warn(`[upwork.mjs] fetchJobDetails failed: ${err.message}`);
    return { url, error: err.message };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
